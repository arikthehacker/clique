/**
 * ==============================
 * FILE: src/context/GroupContext.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Holds the user's groups and every group's messages, so the home list,
 * the create screen, and the chat room all read the same data.
 *
 * Includes:
 * - Groups, newest first
 * - Create, rename, photo, memory schedule, leave
 * - Invite by username
 * - A group's messages, with older pages on scroll
 * - Sending text, photos, poll cards and nudges
 *
 * Notes:
 * - Firebase mode subscribes to a group's messages the first time a screen asks.
 * - Demo mode saves to AsyncStorage, so every invite stays an invite there.
 * - Memory reminders pause on this phone while off the grid is on.
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { QueryDocumentSnapshot } from 'firebase/firestore';

import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import * as groupService from '../firebase/groupService';
import * as messageService from '../firebase/messageService';
import { uploadImage } from '../firebase/storageService';
import { findUserByUsername } from '../firebase/userService';
import { normalizeUsername } from '../lib/groups';
import {
  cancelMemoryReminders,
  scheduleMemoryReminders,
} from '../lib/notifications';
import {
  loadJson,
  saveJson,
  STORAGE_KEYS,
} from '../lib/storage';
import {
  Group,
  MemorySchedule,
  Message,
  MessageKind,
} from '../types';
import { useAuth } from './AuthContext';

type MessagesByGroup = Record<string, Message[]>;

export type InviteResult = 'added' | 'invited' | 'already';

export type SendOptions = {
  imageUri?: string | null;
  kind?: MessageKind;
  refId?: string | null;
};

type GroupCtx = {
  groups: Group[];
  loading: boolean;
  error: string | null;
  createGroup: (name: string) => Promise<string>;
  renameGroup: (groupId: string, name: string) => Promise<void>;
  setGroupImage: (groupId: string, localUri: string) => Promise<void>;
  setSchedule: (groupId: string, schedule: MemorySchedule | null) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<void>;
  inviteMember: (groupId: string, username: string) => Promise<InviteResult>;
  messagesFor: (groupId: string) => Message[];
  sendMessage: (groupId: string, text: string, options?: SendOptions) => Promise<void>;
  loadOlderMessages: (groupId: string) => Promise<void>;
};

const GroupContext = createContext<GroupCtx>({
  groups: [],
  loading: true,
  error: null,
  createGroup: async () => '',
  renameGroup: async () => {},
  setGroupImage: async () => {},
  setSchedule: async () => true,
  leaveGroup: async () => {},
  inviteMember: async () => 'invited',
  messagesFor: () => [],
  sendMessage: async () => {},
  loadOlderMessages: async () => {},
});

// fills in fields older saved groups are missing
function withDefaults(group: Partial<Group>): Group {
  return {
    id: group.id ?? '',
    name: group.name ?? '',
    imageUri: group.imageUri ?? null,
    createdBy: group.createdBy ?? '',
    members: group.members ?? [],
    profiles: group.profiles ?? {},
    invites: group.invites ?? [],
    schedule: group.schedule ?? null,
    createdAt: group.createdAt ?? 0,
  };
}

export function GroupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const uid = user?.uid ?? null;
  const offGrid = user?.offGrid ?? false;

  const [
    groups,
    setGroups,
  ] = useState<Group[]>([]);

  const [
    messages,
    setMessages,
  ] = useState<MessagesByGroup>({});

  const [
    loadedFor,
    setLoadedFor,
  ] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const messageUnsubs = useRef<Record<string, () => void>>({});
  const oldestSeen = useRef<Record<string, QueryDocumentSnapshot | null>>({});

  useEffect(() => {
    if (!uid) {
      return undefined;
    }

    if (isFirebaseConfigured) {
      return groupService.subscribeToGroups(
        uid,
        (nextGroups) => {
          setGroups(nextGroups);
          setLoadedFor(uid);
        },
        (subscribeError) => {
          setError(subscribeError.message);
          setLoadedFor(uid);
        },
      );
    }

    Promise.all([
      loadJson<Partial<Group>[]>(STORAGE_KEYS.groups, []),
      loadJson<MessagesByGroup>(STORAGE_KEYS.messages, {}),
    ]).then(([savedGroups, savedMessages]) => {
      setGroups(savedGroups.map(withDefaults));

      // fills in kind and refId on older saved messages
      const upgraded: MessagesByGroup = {};

      for (const [groupId, list] of Object.entries(savedMessages)) {
        upgraded[groupId] = list.map((message) => ({
          ...message,
          kind: message.kind ?? (message.imageUri ? 'photo' : 'text'),
          refId: message.refId ?? null,
        }));
      }

      setMessages(upgraded);
      setLoadedFor(uid);
    });

    return undefined;
  }, [uid]);

  // drops the chat subscriptions when the account changes
  useEffect(() => {
    const unsubs = messageUnsubs.current;
    const cursors = oldestSeen.current;

    return () => {
      for (const groupId of Object.keys(unsubs)) {
        unsubs[groupId]();
        delete unsubs[groupId];
        delete cursors[groupId];
      }
    };
  }, [uid]);

  // off the grid pauses memory reminders on this phone
  useEffect(() => {
    if (!uid) {
      return;
    }

    for (const group of groups) {
      if (offGrid) {
        cancelMemoryReminders(group.id);
      } else if (group.schedule) {
        scheduleMemoryReminders(group.id, group.name, group.schedule);
      }
    }
  }, [
    uid,
    offGrid,
    groups,
  ]);

  const saveGroups = useCallback(async (nextGroups: Group[]) => {
    setGroups(nextGroups);
    await saveJson(STORAGE_KEYS.groups, nextGroups);
  }, []);

  const createGroup = useCallback(
    async (name: string) => {
      if (!user) {
        throw new Error('Sign in to create a group.');
      }

      const profile = {
        username: user.username || 'me',
        avatarUri: user.avatarUri,
      };

      if (isFirebaseConfigured) {
        return groupService.createGroup(name, null, user.uid, profile);
      }

      const newGroup: Group = {
        id: Date.now().toString(),
        name: name,
        imageUri: null,
        createdBy: user.uid,
        members: [user.uid],
        profiles: {
          [user.uid]: profile,
        },
        invites: [],
        schedule: null,
        createdAt: Date.now(),
      };

      await saveGroups([
        newGroup,
        ...groups,
      ]);

      return newGroup.id;
    },
    [
      user,
      groups,
      saveGroups,
    ],
  );

  const renameGroup = useCallback(
    async (groupId: string, name: string) => {
      if (isFirebaseConfigured) {
        await groupService.renameGroup(groupId, name);
        return;
      }

      await saveGroups(
        groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                name: name,
              }
            : group,
        ),
      );
    },
    [
      groups,
      saveGroups,
    ],
  );

  const setGroupImage = useCallback(
    async (groupId: string, localUri: string) => {
      if (!user) {
        return;
      }

      if (isFirebaseConfigured) {
        await groupService.setGroupImage(groupId, await uploadImage(user.uid, 'groups', localUri));
        return;
      }

      await saveGroups(
        groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                imageUri: localUri,
              }
            : group,
        ),
      );
    },
    [
      user,
      groups,
      saveGroups,
    ],
  );

  const setSchedule = useCallback(
    async (groupId: string, schedule: MemorySchedule | null) => {
      const group = groups.find((candidate) => candidate.id === groupId);

      if (!group) {
        return false;
      }

      const granted = await scheduleMemoryReminders(groupId, group.name, schedule);

      if (isFirebaseConfigured) {
        await groupService.setSchedule(groupId, schedule);
      } else {
        await saveGroups(
          groups.map((candidate) =>
            candidate.id === groupId
              ? {
                  ...candidate,
                  schedule: schedule,
                }
              : candidate,
          ),
        );
      }

      return granted;
    },
    [
      groups,
      saveGroups,
    ],
  );

  const leaveGroup = useCallback(
    async (groupId: string) => {
      if (!user) {
        return;
      }

      if (isFirebaseConfigured) {
        await groupService.leaveGroup(groupId, user.uid);

        // stops listening to a chat we are no longer in
        messageUnsubs.current[groupId]?.();
        delete messageUnsubs.current[groupId];
        delete oldestSeen.current[groupId];
        return;
      }

      await saveGroups(groups.filter((group) => group.id !== groupId));

      const nextMessages = { ...messages };
      delete nextMessages[groupId];

      setMessages(nextMessages);
      await saveJson(STORAGE_KEYS.messages, nextMessages);
    },
    [
      user,
      groups,
      messages,
      saveGroups,
    ],
  );

  const inviteMember = useCallback(
    async (groupId: string, username: string): Promise<InviteResult> => {
      const group = groups.find((candidate) => candidate.id === groupId);
      const name = normalizeUsername(username);

      if (!group || !name) {
        return 'already';
      }

      const alreadyIn =
        group.invites.some((invite) => normalizeUsername(invite) === name) ||
        Object.values(group.profiles).some((profile) => normalizeUsername(profile.username) === name);

      if (alreadyIn) {
        return 'already';
      }

      if (isFirebaseConfigured) {
        const found = await findUserByUsername(name);

        if (found) {
          await groupService.addMember(groupId, found.uid, found.profile);
          return 'added';
        }

        await groupService.addInvite(groupId, name);
        return 'invited';
      }

      await saveGroups(
        groups.map((candidate) =>
          candidate.id === groupId
            ? {
                ...candidate,
                invites: [
                  ...candidate.invites,
                  name,
                ],
              }
            : candidate,
        ),
      );

      return 'invited';
    },
    [
      groups,
      saveGroups,
    ],
  );

  const subscribeIfNeeded = useCallback((groupId: string) => {
    if (!isFirebaseConfigured || messageUnsubs.current[groupId]) {
      return;
    }

    messageUnsubs.current[groupId] = messageService.subscribeToMessages(
      groupId,
      (recent, oldest) => {
        oldestSeen.current[groupId] = oldest;

        // keeps older pages, swaps in the live tail
        setMessages((prev) => {
          const recentIds = new Set(recent.map((message) => message.id));
          const olderOnly = (prev[groupId] ?? []).filter(
            (message) => !recentIds.has(message.id) && message.createdAt < (recent[0]?.createdAt ?? Infinity),
          );

          return {
            ...prev,
            [groupId]: [
              ...olderOnly,
              ...recent,
            ],
          };
        });
      },
      (subscribeError) => setError(subscribeError.message),
    );
  }, []);

  const messagesFor = useCallback(
    (groupId: string) => {
      if (!user) {
        return [];
      }

      subscribeIfNeeded(groupId);

      return messages[groupId] ?? [];
    },
    [
      user,
      messages,
      subscribeIfNeeded,
    ],
  );

  const sendMessage = useCallback(
    async (groupId: string, text: string, options: SendOptions = {}) => {
      if (!user) {
        return;
      }

      const senderName = user.username || 'me';
      const imageUri = options.imageUri ?? null;
      const kind: MessageKind = options.kind ?? (imageUri ? 'photo' : 'text');
      const refId = options.refId ?? null;

      if (isFirebaseConfigured) {
        await messageService.sendMessage(groupId, user.uid, senderName, text, imageUri, kind, refId);
        return;
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        groupId: groupId,
        senderId: user.uid,
        senderName: senderName,
        kind: kind,
        text: text,
        imageUri: imageUri,
        refId: refId,
        createdAt: Date.now(),
      };

      const nextMessages = {
        ...messages,
        [groupId]: [
          ...(messages[groupId] ?? []),
          newMessage,
        ],
      };

      setMessages(nextMessages);
      await saveJson(STORAGE_KEYS.messages, nextMessages);
    },
    [
      user,
      messages,
    ],
  );

  const loadOlderMessages = useCallback(async (groupId: string) => {
    const before = oldestSeen.current[groupId];

    if (!isFirebaseConfigured || !before) {
      return;
    }

    const page = await messageService.loadOlderMessages(groupId, before);
    oldestSeen.current[groupId] = page.oldest;

    setMessages((prev) => ({
      ...prev,
      [groupId]: [
        ...page.messages,
        ...(prev[groupId] ?? []),
      ],
    }));
  }, []);

  const value = useMemo(
    () => ({
      groups: user ? groups : [],
      loading: user ? loadedFor !== user.uid : false,
      error: error,
      createGroup: createGroup,
      renameGroup: renameGroup,
      setGroupImage: setGroupImage,
      setSchedule: setSchedule,
      leaveGroup: leaveGroup,
      inviteMember: inviteMember,
      messagesFor: messagesFor,
      sendMessage: sendMessage,
      loadOlderMessages: loadOlderMessages,
    }),
    [
      user,
      groups,
      loadedFor,
      error,
      createGroup,
      renameGroup,
      setGroupImage,
      setSchedule,
      leaveGroup,
      inviteMember,
      messagesFor,
      sendMessage,
      loadOlderMessages,
    ],
  );

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupContext);
}

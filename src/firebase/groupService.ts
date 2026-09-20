/**
 * ==============================
 * FILE: src/firebase/groupService.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Creates groups, streams the ones you belong to, and handles membership.
 *
 * Includes:
 * - createGroup, with the creator as first member
 * - renameGroup, setGroupImage, setSchedule
 * - addMember, by uid plus the profile to show for them
 * - addInvite, a username with no account yet
 * - leaveGroup
 * - subscribeToGroups, your groups, newest first
 *
 * Notes:
 * - members is a plain uid array, which is what firestore.rules checks.
 */

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  Group,
  MemberProfile,
  MemorySchedule,
} from '../types';
import { requireDb } from './firebaseConfig';

function toProfiles(value: unknown): Record<string, MemberProfile> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const result: Record<string, MemberProfile> = {};

  for (const [uid, raw] of Object.entries(value as Record<string, unknown>)) {
    const entry = (raw ?? {}) as Partial<MemberProfile>;

    result[uid] = {
      username: String(entry.username ?? ''),
      avatarUri: typeof entry.avatarUri === 'string' ? entry.avatarUri : null,
    };
  }

  return result;
}

function toSchedule(value: unknown): MemorySchedule | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const raw = value as Partial<MemorySchedule>;

  return {
    hour: Number(raw.hour ?? 16),
    minute: Number(raw.minute ?? 0),
    weekdays: Array.isArray(raw.weekdays) ? raw.weekdays.map(Number) : [],
  };
}

export async function createGroup(
  name: string,
  imageUri: string | null,
  createdBy: string,
  creatorProfile: MemberProfile,
): Promise<string> {
  const groupRef = await addDoc(collection(requireDb(), 'groups'), {
    name: name,
    imageUri: imageUri,
    createdBy: createdBy,
    members: [createdBy],
    profiles: {
      [createdBy]: creatorProfile,
    },
    invites: [],
    schedule: null,
    createdAt: serverTimestamp(),
  });

  return groupRef.id;
}

export async function renameGroup(groupId: string, name: string): Promise<void> {
  await updateDoc(doc(requireDb(), 'groups', groupId), {
    name: name,
  });
}

export async function setGroupImage(groupId: string, imageUri: string | null): Promise<void> {
  await updateDoc(doc(requireDb(), 'groups', groupId), {
    imageUri: imageUri,
  });
}

export async function setSchedule(groupId: string, schedule: MemorySchedule | null): Promise<void> {
  await updateDoc(doc(requireDb(), 'groups', groupId), {
    schedule: schedule,
  });
}

export async function addMember(
  groupId: string,
  uid: string,
  profile: MemberProfile,
): Promise<void> {
  await updateDoc(doc(requireDb(), 'groups', groupId), {
    members: arrayUnion(uid),
    [`profiles.${uid}`]: profile,
    invites: arrayRemove(profile.username),
  });
}

export async function addInvite(groupId: string, username: string): Promise<void> {
  await updateDoc(doc(requireDb(), 'groups', groupId), {
    invites: arrayUnion(username),
  });
}

export async function leaveGroup(groupId: string, uid: string): Promise<void> {
  await updateDoc(doc(requireDb(), 'groups', groupId), {
    members: arrayRemove(uid),
    [`profiles.${uid}`]: deleteField(),
  });
}

export function subscribeToGroups(
  userId: string,
  onChange: (groups: Group[]) => void,
  onError: (error: Error) => void,
): () => void {
  const groupsQuery = query(
    collection(requireDb(), 'groups'),
    where('members', 'array-contains', userId),
  );

  return onSnapshot(
    groupsQuery,
    (snapshot) => {
      const groups = snapshot.docs.map((groupDoc) => {
        const data = groupDoc.data();

        return {
          id: groupDoc.id,
          name: String(data.name ?? ''),
          imageUri: typeof data.imageUri === 'string' ? data.imageUri : null,
          createdBy: String(data.createdBy ?? ''),
          members: Array.isArray(data.members) ? data.members.map(String) : [],
          profiles: toProfiles(data.profiles),
          invites: Array.isArray(data.invites) ? data.invites.map(String) : [],
          schedule: toSchedule(data.schedule),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        };
      });

      groups.sort((a, b) => b.createdAt - a.createdAt);

      onChange(groups);
    },
    onError,
  );
}

/**
 * ==============================
 * FILE: src/lib/groups.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Helpers for groups and messages that the screens share.
 *
 * Includes:
 * - memberRows, you first, then members, then invites
 * - visibleMessages, hides messages from blocked usernames
 * - peopleAcrossGroups, everyone you share a group with
 * - normalizeUsername
 *
 * Notes:
 * - Usernames compare lowercase with the @ stripped, so "@Ying" is "ying".
 */

import {
  Group,
  Message,
} from '../types';

export type MemberRow = {
  key: string;
  username: string;
  avatarUri: string | null;
  isYou: boolean;
  invited: boolean;
};

export function normalizeUsername(name: string): string {
  return name.trim().replace(/^@/, '').toLowerCase();
}

export function memberRows(group: Group, currentUid: string): MemberRow[] {
  const members: MemberRow[] = group.members.map((uid) => {
    const profile = group.profiles[uid];

    return {
      key: uid,
      username: profile?.username || 'someone',
      avatarUri: profile?.avatarUri ?? null,
      isYou: uid === currentUid,
      invited: false,
    };
  });

  const invites: MemberRow[] = group.invites.map((username) => ({
    key: `invite-${username}`,
    username: username,
    avatarUri: null,
    isYou: false,
    invited: true,
  }));

  members.sort((a, b) => Number(b.isYou) - Number(a.isYou));

  return [
    ...members,
    ...invites,
  ];
}

export function visibleMessages(messages: Message[], blocked: string[]): Message[] {
  if (blocked.length === 0) {
    return messages;
  }

  const blockedSet = new Set(blocked.map(normalizeUsername));

  return messages.filter((message) => !blockedSet.has(normalizeUsername(message.senderName)));
}

export function peopleAcrossGroups(groups: Group[], currentUid: string): MemberRow[] {
  const seen = new Map<string, MemberRow>();

  for (const group of groups) {
    for (const row of memberRows(group, currentUid)) {
      if (row.isYou) {
        continue;
      }

      const key = normalizeUsername(row.username);

      if (!seen.has(key) || (seen.get(key)?.invited && !row.invited)) {
        seen.set(key, row);
      }
    }
  }

  return [...seen.values()].sort((a, b) => a.username.localeCompare(b.username));
}

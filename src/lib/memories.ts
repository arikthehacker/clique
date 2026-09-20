/**
 * ==============================
 * FILE: src/lib/memories.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Memory logic: reactions, replies and sticker placement.
 *
 * Includes:
 * - REACTIONS, the icons you can react with
 * - toggleReaction, one reaction per person, tap again to remove
 * - reactionCounts, grouped for display
 * - addReply
 * - placeSticker, up to MAX_STICKERS, spread out so taps never stack
 * - withMemoryDefaults, fills fields older saved memories are missing
 *
 * Notes:
 * - Sticker positions are fractions of the photo's width and height.
 */

import {
  Memory,
  Reply,
  Sticker,
} from '../types';

export const REACTIONS = [
  'heart',
  'happy',
  'flame',
  'star',
  'thumbs-up',
  'sparkles',
] as const;

export const MAX_STICKERS = 8;
const MAX_REPLY_LENGTH = 300;

const SLOTS: [number, number][] = [
  [0.78, 0.12],
  [0.12, 0.8],
  [0.8, 0.8],
  [0.12, 0.14],
  [0.5, 0.08],
  [0.5, 0.86],
  [0.08, 0.5],
  [0.86, 0.5],
];

export function stickerSlot(index: number): { x: number; y: number } {
  const [x, y] = SLOTS[index % SLOTS.length];

  return {
    x: x,
    y: y,
  };
}

export function placeSticker(stickers: Sticker[], art: string): Sticker[] {
  if (stickers.length >= MAX_STICKERS) {
    return stickers;
  }

  return [
    ...stickers,
    {
      art: art,
      ...stickerSlot(stickers.length),
    },
  ];
}

export function toggleReaction(memory: Memory, uid: string, reaction: string): Memory {
  const reactions = { ...memory.reactions };

  if (reactions[uid] === reaction) {
    delete reactions[uid];
  } else {
    reactions[uid] = reaction;
  }

  return {
    ...memory,
    reactions: reactions,
  };
}

export function reactionCounts(memory: Memory): { reaction: string; count: number }[] {
  const counts = new Map<string, number>();

  // older memories may hold emoji, those just drop out
  for (const reaction of Object.values(memory.reactions)) {
    if ((REACTIONS as readonly string[]).includes(reaction)) {
      counts.set(reaction, (counts.get(reaction) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([reaction, count]) => ({
      reaction: reaction,
      count: count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function addReply(
  memory: Memory,
  uid: string,
  name: string,
  text: string,
  now: number = Date.now(),
): Memory {
  const clean = text.trim().slice(0, MAX_REPLY_LENGTH);

  if (!clean) {
    return memory;
  }

  const reply: Reply = {
    id: now.toString(),
    uid: uid,
    name: name,
    text: clean,
    at: now,
  };

  return {
    ...memory,
    replies: [
      ...memory.replies,
      reply,
    ],
  };
}

export function withMemoryDefaults(memory: Partial<Memory>): Memory {
  return {
    id: memory.id ?? '',
    groupId: memory.groupId ?? null,
    uri: memory.uri ?? '',
    frame: memory.frame ?? 'none',
    caption: memory.caption ?? '',
    stickers: (memory.stickers ?? []).filter((sticker) => Boolean(sticker.art)),
    reactions: memory.reactions ?? {},
    replies: memory.replies ?? [],
    createdAt: memory.createdAt ?? 0,
  };
}

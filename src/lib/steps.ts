/**
 * ==============================
 * FILE: src/lib/steps.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The steps streak and the sticker sets it unlocks.
 *
 * Includes:
 * - DEFAULT_GOAL and STICKER_SETS
 * - advanceStreak, today's streak from yesterday's
 * - unlockedStickers, everything open at a streak
 * - lockedSets, what is still left to earn
 *
 * Notes:
 * - Missing the goal for a day resets the streak to zero.
 */

export const DEFAULT_GOAL = 6000;

export type StickerSet = {
  streak: number;
  label: string;
  stickers: string[];
};

export const STICKER_SETS: StickerSet[] = [
  {
    streak: 0,
    label: 'starter',
    stickers: [
      'wave',
      'peace',
      'hands',
      'signature',
      'heart',
      'dizzy',
    ],
  },
  {
    streak: 3,
    label: '3 day streak',
    stickers: [
      'fist',
      'knock',
      'crying',
    ],
  },
  {
    streak: 7,
    label: '7 day streak',
    stickers: [
      'cupped',
      'palm',
      'cat',
    ],
  },
  {
    streak: 30,
    label: '30 day streak',
    stickers: ['reach'],
  },
];

export type StreakInput = {
  streak: number;
  lastDate: string;
  today: string;
  stepsToday: number;
  goal: number;
  yesterday: string;
};

export function advanceStreak(input: StreakInput): number {
  const metToday = input.stepsToday >= input.goal;

  if (input.lastDate === input.today) {
    return input.streak;
  }

  const chain = input.lastDate === input.yesterday ? input.streak : 0;

  return metToday ? chain + 1 : chain;
}

export function unlockedStickers(streak: number): string[] {
  return STICKER_SETS.filter((set) => set.streak <= streak).flatMap((set) => set.stickers);
}

export function lockedSets(streak: number): StickerSet[] {
  return STICKER_SETS.filter((set) => set.streak > streak);
}

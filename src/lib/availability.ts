/**
 * ==============================
 * FILE: src/lib/availability.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Finds a time that works for everyone from the availability each member shared.
 *
 * Includes:
 * - toMinutes and toClock, HH:mm to minutes and back
 * - mergeSlots, folds overlapping slots together
 * - freeWindows, times every member is free
 * - subtractBusy, free time minus device busy blocks
 *
 * Notes:
 * - Minutes since midnight on one local date. No time zones.
 */

import {
  AvailabilitySlot,
  BusyBlock,
} from '../types';

export type Window = {
  start: number;
  end: number;
};

export function toMinutes(clock: string): number {
  const [hours, minutes] = clock.split(':').map(Number);

  return hours * 60 + (minutes || 0);
}

export function toClock(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function mergeSlots(windows: Window[]): Window[] {
  const sorted = [...windows]
    .filter((window) => window.end > window.start)
    .sort((a, b) => a.start - b.start);

  const merged: Window[] = [];

  for (const window of sorted) {
    const last = merged[merged.length - 1];

    if (last && window.start <= last.end) {
      last.end = Math.max(last.end, window.end);
    } else {
      merged.push({ ...window });
    }
  }

  return merged;
}

function intersect(a: Window[], b: Window[]): Window[] {
  const result: Window[] = [];

  for (const left of a) {
    for (const right of b) {
      const start = Math.max(left.start, right.start);
      const end = Math.min(left.end, right.end);

      if (end > start) {
        result.push({
          start: start,
          end: end,
        });
      }
    }
  }

  return mergeSlots(result);
}

function slotsOn(slots: AvailabilitySlot[], date: string): Window[] {
  return mergeSlots(
    slots
      .filter((slot) => slot.date === date)
      .map((slot) => ({
        start: toMinutes(slot.start),
        end: toMinutes(slot.end),
      })),
  );
}

export function freeWindows(
  members: AvailabilitySlot[][],
  date: string,
  minMinutes: number,
): Window[] {
  if (members.length === 0) {
    return [];
  }

  let common = slotsOn(members[0], date);

  for (const slots of members.slice(1)) {
    common = intersect(common, slotsOn(slots, date));
  }

  return common.filter((window) => window.end - window.start >= minMinutes);
}

export function subtractBusy(
  free: Window[],
  busy: BusyBlock[],
  date: string,
): Window[] {
  const blocks = mergeSlots(
    busy
      .filter((block) => block.date === date)
      .map((block) => ({
        start: toMinutes(block.start),
        end: toMinutes(block.end),
      })),
  );

  let result = mergeSlots(free);

  for (const block of blocks) {
    const next: Window[] = [];

    for (const window of result) {
      if (block.end <= window.start || block.start >= window.end) {
        next.push(window);
        continue;
      }

      if (block.start > window.start) {
        next.push({
          start: window.start,
          end: block.start,
        });
      }

      if (block.end < window.end) {
        next.push({
          start: block.end,
          end: window.end,
        });
      }
    }

    result = next;
  }

  return result;
}

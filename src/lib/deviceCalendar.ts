/**
 * ==============================
 * FILE: src/lib/deviceCalendar.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Reads the phone's own calendars and turns their events into anonymous busy
 * blocks: a date, a start and an end, nothing else.
 *
 * Includes:
 * - readBusyBlocks, for a date range, after asking permission
 *
 * Notes:
 * - Busy blocks stay on the phone. They are never saved or synced.
 * - All-day events block 00:00 to 23:59.
 * - Uses expo-calendar/legacy, SDK 57 throws on the old root functions.
 */

import * as Calendar from 'expo-calendar/legacy';
import dayjs from 'dayjs';

import { BusyBlock } from '../types';
import {
  DATE_FORMAT,
  TIME_FORMAT,
} from './calendar';

export type BusyResult = {
  granted: boolean;
  blocks: BusyBlock[];
  calendars: number;
};

export async function readBusyBlocks(from: Date, to: Date): Promise<BusyResult> {
  const permission = await Calendar.requestCalendarPermissionsAsync();

  if (!permission.granted) {
    return {
      granted: false,
      blocks: [],
      calendars: 0,
    };
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const ids = calendars.map((calendar) => calendar.id);

  if (ids.length === 0) {
    return {
      granted: true,
      blocks: [],
      calendars: 0,
    };
  }

  const events = await Calendar.getEventsAsync(ids, from, to);

  const blocks: BusyBlock[] = events.map((event) => {
    const start = dayjs(event.startDate);
    const end = dayjs(event.endDate);

    return {
      id: event.id,
      date: start.format(DATE_FORMAT),
      start: event.allDay ? '00:00' : start.format(TIME_FORMAT),
      end: event.allDay || !end.isSame(start, 'day') ? '23:59' : end.format(TIME_FORMAT),
    };
  });

  return {
    granted: true,
    blocks: blocks,
    calendars: ids.length,
  };
}

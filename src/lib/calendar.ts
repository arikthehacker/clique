/**
 * ==============================
 * FILE: src/lib/calendar.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The date math behind the calendar screen.
 *
 * Includes:
 * - to24Hour and formatTime12, picker hours to HH:mm and back
 * - buildEventDateTime, picker values to an event's date and time
 * - monthGrid and weekDays, the cells for the month and week views
 * - upcomingEvents, the next few events for a group or for you
 * - eventDateTime, an event as a Date for reminders
 *
 * Notes:
 * - Dates are 'YYYY-MM-DD', times are 24-hour 'HH:mm', both strings.
 * - Feb 31 and friends clamp to the last day of the month.
 */

import dayjs, { Dayjs } from 'dayjs';

import { CalendarEvent } from '../types';

export type AmPm = 'AM' | 'PM';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';

export function to24Hour(hour12: number, ampm: AmPm): number {
  if (ampm === 'AM') {
    return hour12 === 12 ? 0 : hour12;
  }

  return hour12 === 12 ? 12 : hour12 + 12;
}

export function buildEventDateTime(
  year: number,
  monthIndex: number,
  day: number,
  hour12: number,
  minute: number,
  ampm: AmPm,
): { date: string; time: string } {
  const firstOfMonth = dayjs()
    .year(year)
    .month(monthIndex)
    .date(1);

  const safeDay = Math.min(day, firstOfMonth.daysInMonth());

  const value = firstOfMonth
    .date(safeDay)
    .hour(to24Hour(hour12, ampm))
    .minute(minute)
    .second(0);

  return {
    date: value.format(DATE_FORMAT),
    time: value.format(TIME_FORMAT),
  };
}

export function monthGrid(month: Dayjs): (Dayjs | null)[] {
  const startOfMonth = month.startOf('month');

  const leading: (Dayjs | null)[] = Array(startOfMonth.day()).fill(null);

  const days = Array.from(
    { length: month.daysInMonth() },
    (_, index) => startOfMonth.add(index, 'day'),
  );

  return [
    ...leading,
    ...days,
  ];
}

export function weekDays(date: Dayjs): Dayjs[] {
  const sunday = date.subtract(date.day(), 'day').startOf('day');

  return Array.from({ length: 7 }, (_, index) => sunday.add(index, 'day'));
}

export function upcomingEvents(
  events: CalendarEvent[],
  groupId: string | null,
  from: Dayjs,
  limit: number,
): CalendarEvent[] {
  const today = from.format(DATE_FORMAT);

  return events
    .filter((event) => event.groupId === groupId && event.date >= today)
    .sort((a, b) => `${a.date} ${a.time ?? ''}`.localeCompare(`${b.date} ${b.time ?? ''}`))
    .slice(0, limit);
}

export function formatTime12(time: string | null): string {
  if (!time) {
    return '';
  }

  const [
    hourText,
    minuteText,
  ] = time.split(':');

  const hour24 = Number(hourText);
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const ampm: AmPm = hour24 < 12 ? 'AM' : 'PM';

  return `${hour12}:${minuteText} ${ampm}`;
}

export function eventDateTime(date: string, time: string | null): Date {
  return dayjs(`${date} ${time ?? '09:00'}`, `${DATE_FORMAT} ${TIME_FORMAT}`).toDate();
}

/**
 * ==============================
 * FILE: src/lib/notifications.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Local reminders for calendar events and the group "take a memory" nudges.
 *
 * Includes:
 * - configureNotifications, alerts show while the app is open
 * - scheduleEventReminder, 30 minutes before an event
 * - notifyNow, one notification right away
 * - scheduleMemoryReminders and cancelMemoryReminders, weekly per group
 *
 * Notes:
 * - Permission is asked on the first reminder, not at launch.
 * - Local only, no push notifications yet.
 */

import * as Notifications from 'expo-notifications';

import { eventDateTime } from './calendar';
import { MemorySchedule } from '../types';

const REMINDER_LEAD_MINUTES = 30;

export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function hasPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();

  return requested.granted;
}

export async function scheduleEventReminder(
  title: string,
  date: string,
  time: string | null,
): Promise<string | null> {
  const startsAt = eventDateTime(date, time).getTime();

  // no reminders for things that already happened
  if (startsAt <= Date.now()) {
    return null;
  }

  if (!(await hasPermission())) {
    return null;
  }

  const fireAt = new Date(startsAt - REMINDER_LEAD_MINUTES * 60 * 1000);

  const trigger: Notifications.NotificationTriggerInput =
    fireAt.getTime() > Date.now()
      ? {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
        }
      : null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Coming up in Clique',
      body: title,
    },
    trigger: trigger,
  });
}

export async function notifyNow(title: string, body: string): Promise<void> {
  if (!(await hasPermission())) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: null,
  });
}

function memoryReminderId(groupId: string, weekday: number): string {
  return `memory-${groupId}-${weekday}`;
}

export async function cancelMemoryReminders(groupId: string): Promise<void> {
  await Promise.all(
    Array.from({ length: 7 }, (_, weekday) =>
      Notifications.cancelScheduledNotificationAsync(memoryReminderId(groupId, weekday)).catch(() => {}),
    ),
  );
}

export async function scheduleMemoryReminders(
  groupId: string,
  groupName: string,
  schedule: MemorySchedule | null,
): Promise<boolean> {
  await cancelMemoryReminders(groupId);

  if (!schedule || schedule.weekdays.length === 0) {
    return true;
  }

  if (!(await hasPermission())) {
    return false;
  }

  await Promise.all(
    schedule.weekdays.map((weekday) =>
      Notifications.scheduleNotificationAsync({
        identifier: memoryReminderId(groupId, weekday),
        content: {
          title: groupName,
          body: 'time to take a memory',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          // expo weeks start at 1
          weekday: weekday + 1,
          hour: schedule.hour,
          minute: schedule.minute,
        },
      }),
    ),
  );

  return true;
}

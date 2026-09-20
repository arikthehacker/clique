/**
 * ==============================
 * FILE: src/firebase/eventService.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Stores calendar events under users/{uid}/events and streams them back.
 *
 * Includes:
 * - addEvent
 * - subscribeToEvents, live list ordered by date
 * - updateEvent, used for RSVPs
 * - deleteEvent
 *
 * Notes:
 * - Group events still live under the person who made them, so other members
 *   do not see them yet.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import {
  CalendarEvent,
  RsvpStatus,
} from '../types';
import { requireDb } from './firebaseConfig';

export async function addEvent(
  userId: string,
  event: Omit<CalendarEvent, 'id'>,
): Promise<string> {
  const eventRef = await addDoc(collection(requireDb(), 'users', userId, 'events'), {
    ...event,
    createdAt: serverTimestamp(),
  });

  return eventRef.id;
}

export function subscribeToEvents(
  userId: string,
  onChange: (events: CalendarEvent[]) => void,
  onError: (error: Error) => void,
): () => void {
  const eventsQuery = query(
    collection(requireDb(), 'users', userId, 'events'),
    orderBy('date', 'asc'),
  );

  return onSnapshot(
    eventsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((eventDoc) => {
          const data = eventDoc.data();

          return {
            id: eventDoc.id,
            groupId: typeof data.groupId === 'string' ? data.groupId : null,
            title: String(data.title ?? ''),
            date: String(data.date ?? ''),
            time: typeof data.time === 'string' ? data.time : null,
            reminder: Boolean(data.reminder),
            color: typeof data.color === 'string' ? data.color : null,
            rsvps: (data.rsvps ?? {}) as Record<string, RsvpStatus>,
          };
        }),
      );
    },
    onError,
  );
}

export async function updateEvent(
  userId: string,
  id: string,
  patch: Partial<Pick<CalendarEvent, 'rsvps' | 'title' | 'date' | 'time'>>,
): Promise<void> {
  await updateDoc(doc(requireDb(), 'users', userId, 'events', id), patch);
}

export async function deleteEvent(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(requireDb(), 'users', userId, 'events', id));
}

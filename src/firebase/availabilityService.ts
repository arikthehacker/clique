/**
 * ==============================
 * FILE: src/firebase/availabilityService.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Each member's shared availability for a group, one document per member
 * under groups/{groupId}/availability.
 *
 * Includes:
 * - subscribeToAvailability, everyone's slots for a group
 * - saveMyAvailability, replaces your own document
 *
 * Notes:
 * - Only the slots someone chose to share, never their device calendar.
 */

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

import {
  AvailabilitySlot,
  MemberAvailability,
} from '../types';
import { requireDb } from './firebaseConfig';

export function subscribeToAvailability(
  groupId: string,
  onChange: (members: MemberAvailability[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    collection(requireDb(), 'groups', groupId, 'availability'),
    (snapshot) =>
      onChange(
        snapshot.docs.map((item) => {
          const data = item.data();

          return {
            uid: item.id,
            username: String(data.username ?? ''),
            slots: Array.isArray(data.slots)
              ? data.slots.map((slot: Record<string, unknown>) => ({
                  date: String(slot.date ?? ''),
                  start: String(slot.start ?? '00:00'),
                  end: String(slot.end ?? '00:00'),
                }))
              : [],
          };
        }),
      ),
    onError,
  );
}

export async function saveMyAvailability(
  groupId: string,
  uid: string,
  username: string,
  slots: AvailabilitySlot[],
): Promise<void> {
  await setDoc(doc(requireDb(), 'groups', groupId, 'availability', uid), {
    username: username,
    slots: slots,
  });
}

/**
 * ==============================
 * FILE: src/firebase/memoryService.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Stores memories under users/{uid}/memories and streams the feed back,
 * newest first.
 *
 * Includes:
 * - addMemory
 * - subscribeToMemories
 * - updateMemory, stickers, reactions, replies and caption
 * - deleteMemory
 *
 * Notes:
 * - uri is a Storage download URL. The context uploads the photo first.
 * - Memories stay under their owner even when tagged with a group.
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
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

import {
  FRAMES,
  FrameType,
  Memory,
} from '../types';
import { requireDb } from './firebaseConfig';

export async function addMemory(
  userId: string,
  memory: Omit<Memory, 'id' | 'createdAt'>,
): Promise<string> {
  const memoryRef = await addDoc(collection(requireDb(), 'users', userId, 'memories'), {
    ...memory,
    createdAt: serverTimestamp(),
  });

  return memoryRef.id;
}

export function subscribeToMemories(
  userId: string,
  onChange: (memories: Memory[]) => void,
  onError: (error: Error) => void,
): () => void {
  const memoriesQuery = query(
    collection(requireDb(), 'users', userId, 'memories'),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    memoriesQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((memoryDoc) => {
          const data = memoryDoc.data();

          return {
            id: memoryDoc.id,
            groupId: typeof data.groupId === 'string' ? data.groupId : null,
            uri: String(data.uri ?? ''),
            frame: FRAMES.includes(data.frame as FrameType) ? (data.frame as FrameType) : 'none',
            caption: String(data.caption ?? ''),
            stickers: Array.isArray(data.stickers) ? data.stickers : [],
            reactions: (data.reactions ?? {}) as Record<string, string>,
            replies: Array.isArray(data.replies) ? data.replies : [],
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
          };
        }),
      );
    },
    onError,
  );
}

export async function updateMemory(
  userId: string,
  id: string,
  patch: Partial<Pick<Memory, 'stickers' | 'reactions' | 'replies' | 'caption'>>,
): Promise<void> {
  await updateDoc(doc(requireDb(), 'users', userId, 'memories', id), patch);
}

export async function deleteMemory(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(requireDb(), 'users', userId, 'memories', id));
}

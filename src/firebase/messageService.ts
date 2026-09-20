/**
 * ==============================
 * FILE: src/firebase/messageService.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Sends messages and streams a group's recent ones, with paging back through
 * older messages.
 *
 * Includes:
 * - sendMessage, text, a shared photo, a poll card or a nudge
 * - subscribeToMessages, the newest PAGE_SIZE messages, live
 * - loadOlderMessages, the page before a given message
 *
 * Notes:
 * - A message still sending shows as "now" until the server stamps it.
 */

import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  Timestamp,
} from 'firebase/firestore';

import {
  Message,
  MessageKind,
} from '../types';
import { requireDb } from './firebaseConfig';

const PAGE_SIZE = 50;

function toMessage(groupId: string, messageDoc: QueryDocumentSnapshot): Message {
  const data = messageDoc.data();

  return {
    id: messageDoc.id,
    groupId: groupId,
    senderId: String(data.senderId ?? ''),
    senderName: String(data.senderName ?? ''),
    kind: (typeof data.kind === 'string' ? data.kind : 'text') as MessageKind,
    text: String(data.text ?? ''),
    imageUri: typeof data.imageUri === 'string' ? data.imageUri : null,
    refId: typeof data.refId === 'string' ? data.refId : null,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
  };
}

export async function sendMessage(
  groupId: string,
  senderId: string,
  senderName: string,
  text: string,
  imageUri: string | null,
  kind: MessageKind,
  refId: string | null,
): Promise<void> {
  await addDoc(collection(requireDb(), 'groups', groupId, 'messages'), {
    senderId: senderId,
    senderName: senderName,
    kind: kind,
    text: text,
    imageUri: imageUri,
    refId: refId,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(
  groupId: string,
  onChange: (messages: Message[], oldest: QueryDocumentSnapshot | null) => void,
  onError: (error: Error) => void,
): () => void {
  const recentQuery = query(
    collection(requireDb(), 'groups', groupId, 'messages'),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE),
  );

  return onSnapshot(
    recentQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((messageDoc) => toMessage(groupId, messageDoc)).reverse();
      const oldest = snapshot.docs[snapshot.docs.length - 1] ?? null;

      onChange(messages, oldest);
    },
    onError,
  );
}

export async function loadOlderMessages(
  groupId: string,
  before: QueryDocumentSnapshot,
): Promise<{ messages: Message[]; oldest: QueryDocumentSnapshot | null }> {
  const olderQuery = query(
    collection(requireDb(), 'groups', groupId, 'messages'),
    orderBy('createdAt', 'desc'),
    startAfter(before),
    limit(PAGE_SIZE),
  );

  const snapshot = await getDocs(olderQuery);

  return {
    messages: snapshot.docs.map((messageDoc) => toMessage(groupId, messageDoc)).reverse(),
    oldest: snapshot.docs[snapshot.docs.length - 1] ?? null,
  };
}

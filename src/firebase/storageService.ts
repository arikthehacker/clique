/**
 * ==============================
 * FILE: src/firebase/storageService.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Uploads a local image to Firebase Storage and returns its download URL.
 *
 * Includes:
 * - uploadImage, for avatars, memories and group photos
 *
 * Notes:
 * - Files go under users/{uid}/, the only place storage.rules lets you write.
 */

import {
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';

import { requireStorage } from './firebaseConfig';

export type ImageKind = 'avatars' | 'memories' | 'groups';

export async function uploadImage(
  userId: string,
  kind: ImageKind,
  localUri: string,
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const extension = localUri.split('.').pop()?.split('?')[0] || 'jpg';
  const fileRef = ref(requireStorage(), `users/${userId}/${kind}/${Date.now()}.${extension}`);

  await uploadBytes(fileRef, blob, {
    contentType: blob.type || 'image/jpeg',
  });

  return getDownloadURL(fileRef);
}

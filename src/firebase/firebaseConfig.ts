/**
 * ==============================
 * FILE: src/firebase/firebaseConfig.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Starts Firebase from the .env config and hands out the auth, Firestore and
 * Storage handles the services use.
 *
 * Includes:
 * - isFirebaseConfigured, true when every EXPO_PUBLIC_FIREBASE_* value is set
 * - requireAuth, requireDb and requireStorage
 * - auth that stays signed in across restarts
 *
 * Notes:
 * - Config comes from .env (see .env.example).
 * - Without config the app runs locally and nothing here throws on import.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
/* eslint-disable import/no-duplicates */
import {
  Auth,
  initializeAuth,
} from 'firebase/auth';
// @ts-expect-error only in the react-native typings
import { getReactNativePersistence } from 'firebase/auth';
/* eslint-enable import/no-duplicates */
import {
  Firestore,
  getFirestore,
} from 'firebase/firestore';
import {
  FirebaseStorage,
  getStorage,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every((value) => value !== '');

let authHandle: Auth | null = null;
let dbHandle: Firestore | null = null;
let storageHandle: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);

  authHandle = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  dbHandle = getFirestore(app);
  storageHandle = getStorage(app);
}

export function requireAuth(): Auth {
  if (!authHandle) {
    throw new Error('Firebase is not configured. Fill in .env to use a real backend.');
  }

  return authHandle;
}

export function requireDb(): Firestore {
  if (!dbHandle) {
    throw new Error('Firebase is not configured. Fill in .env to use a real backend.');
  }

  return dbHandle;
}

export function requireStorage(): FirebaseStorage {
  if (!storageHandle) {
    throw new Error('Firebase is not configured. Fill in .env to use a real backend.');
  }

  return storageHandle;
}

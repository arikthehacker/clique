/**
 * ==============================
 * FILE: src/lib/storage.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Saves and loads JSON in AsyncStorage for the contexts.
 *
 * Includes:
 * - STORAGE_KEYS
 * - loadJson, with a fallback when the key is missing or broken
 * - saveJson and removeJson
 *
 * Notes:
 * - Storage errors are ignored. The app keeps working, it just forgets.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  user: 'clique.user',
  groups: 'clique.groups',
  messages: 'clique.messages',
  events: 'clique.events',
  memories: 'clique.memories',
  reports: 'clique.reports',
  polls: 'clique.polls',
  todos: 'clique.todos',
  questions: 'clique.questions',
  availability: 'clique.availability',
  expenses: 'clique.expenses',
  steps: 'clique.steps',
} as const;

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);

    if (raw === null) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    // broken entry, start fresh
    return fallback;
  }
}

export async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // in-memory state is still fine
  }
}

export async function removeJson(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // best effort
  }
}

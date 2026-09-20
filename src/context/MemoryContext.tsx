/**
 * ==============================
 * FILE: src/context/MemoryContext.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Holds the user's memory feed so the camera flow can add to it and the
 * Memory tab can show it.
 *
 * Includes:
 * - Memories, newest first
 * - Adding a memory from the post screen
 * - Deleting a memory
 * - Stickers, reactions, captions and replies
 *
 * Notes:
 * - Firebase mode uploads the photo to Storage before saving the memory.
 * - Demo mode keeps the local photo and saves the list to AsyncStorage.
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import * as memoryService from '../firebase/memoryService';
import { uploadImage } from '../firebase/storageService';
import { withMemoryDefaults } from '../lib/memories';
import {
  loadJson,
  saveJson,
  STORAGE_KEYS,
} from '../lib/storage';
import { Memory } from '../types';
import { useAuth } from './AuthContext';

type NewMemory = Omit<Memory, 'id' | 'createdAt'>;

type MemoryCtx = {
  memories: Memory[];
  loading: boolean;
  error: string | null;
  addMemory: (memory: NewMemory) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  updateMemory: (id: string, patch: Partial<Memory>) => Promise<void>;
};

const MemoryContext = createContext<MemoryCtx>({
  memories: [],
  loading: true,
  error: null,
  addMemory: async () => {},
  deleteMemory: async () => {},
  updateMemory: async () => {},
});

export function MemoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const uid = user?.uid ?? null;

  const [
    memories,
    setMemories,
  ] = useState<Memory[]>([]);

  const [
    loadedFor,
    setLoadedFor,
  ] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      return undefined;
    }

    if (isFirebaseConfigured) {
      return memoryService.subscribeToMemories(
        uid,
        (nextMemories) => {
          setMemories(nextMemories);
          setLoadedFor(uid);
        },
        (subscribeError) => {
          setError(subscribeError.message);
          setLoadedFor(uid);
        },
      );
    }

    loadJson<Partial<Memory>[]>(STORAGE_KEYS.memories, []).then((saved) => {
      setMemories(saved.map(withMemoryDefaults));
      setLoadedFor(uid);
    });

    return undefined;
  }, [uid]);

  const addMemory = useCallback(
    async (memory: NewMemory) => {
      if (!user) {
        return;
      }

      if (isFirebaseConfigured) {
        // uploads the photo so the group can see it
        const uri = await uploadImage(user.uid, 'memories', memory.uri);

        await memoryService.addMemory(user.uid, {
          ...memory,
          uri: uri,
        });

        return;
      }

      const newMemory: Memory = withMemoryDefaults({
        ...memory,
        id: Date.now().toString(),
        createdAt: Date.now(),
      });

      // newest memories show first, like a cute little feed
      const nextMemories = [
        newMemory,
        ...memories,
      ];

      setMemories(nextMemories);
      await saveJson(STORAGE_KEYS.memories, nextMemories);
    },
    [
      user,
      memories,
    ],
  );

  const deleteMemory = useCallback(
    async (id: string) => {
      if (!user) {
        return;
      }

      if (isFirebaseConfigured) {
        await memoryService.deleteMemory(user.uid, id);
        return;
      }

      const nextMemories = memories.filter((memory) => memory.id !== id);

      setMemories(nextMemories);
      await saveJson(STORAGE_KEYS.memories, nextMemories);
    },
    [
      user,
      memories,
    ],
  );

  const updateMemory = useCallback(
    async (id: string, patch: Partial<Memory>) => {
      if (!user) {
        return;
      }

      const nextMemories = memories.map((memory) =>
        memory.id === id
          ? {
              ...memory,
              ...patch,
            }
          : memory,
      );

      // shows the change right away
      setMemories(nextMemories);

      if (isFirebaseConfigured) {
        await memoryService.updateMemory(user.uid, id, {
          ...(patch.stickers ? { stickers: patch.stickers } : {}),
          ...(patch.reactions ? { reactions: patch.reactions } : {}),
          ...(patch.replies ? { replies: patch.replies } : {}),
          ...(patch.caption !== undefined ? { caption: patch.caption } : {}),
        });
        return;
      }

      await saveJson(STORAGE_KEYS.memories, nextMemories);
    },
    [
      user,
      memories,
    ],
  );

  const value = useMemo(
    () => ({
      memories: user ? memories : [],
      loading: user ? loadedFor !== user.uid : false,
      error: error,
      addMemory: addMemory,
      deleteMemory: deleteMemory,
      updateMemory: updateMemory,
    }),
    [
      user,
      memories,
      loadedFor,
      error,
      addMemory,
      deleteMemory,
      updateMemory,
    ],
  );

  return (
    <MemoryContext.Provider value={value}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  return useContext(MemoryContext);
}

/**
 * ==============================
 * FILE: app/memory/index.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The Memory tab. Every memory pinned up in its frame, newest first.
 *
 * Includes:
 * - Take a Memory button
 * - Filter chips: all, just me, or one group
 * - Two-column board of framed memories with their reactions
 * - Tap a memory to open it
 * - Loading, error, and empty states
 */

import { useState } from 'react';

import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import MemoryFrame from '../../src/components/MemoryFrame';
import { useGroups } from '../../src/context/GroupContext';
import { useMemory } from '../../src/context/MemoryContext';
import { reactionCounts } from '../../src/lib/memories';
import { Memory } from '../../src/types';

const cardWidth = (Dimensions.get('window').width - 48) / 2;

// a little tilt so the board looks pinned up by hand
const TILTS = [
  -2,
  1.5,
  1,
  -1.5,
];

const ALL = 'all';
const MINE = 'mine';

export default function MemoryIndex() {
  const router = useRouter();

  const {
    memories,
    loading,
    error,
  } = useMemory();

  const { groups } = useGroups();

  const [
    filter,
    setFilter,
  ] = useState<string>(ALL);

  const shown = memories.filter((memory) => {
    if (filter === ALL) {
      return true;
    }

    if (filter === MINE) {
      return memory.groupId === null;
    }

    return memory.groupId === filter;
  });

  const groupName = (groupId: string | null) =>
    groupId ? (groups.find((group) => group.id === groupId)?.name ?? 'a group') : 'just me';

  const openCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/memory/camera');
  };

  const openMemory = (memory: Memory) => {
    Haptics.selectionAsync();

    router.push({
      pathname: '/memory/[id]',
      params: {
        id: memory.id,
      },
    });
  };

  const pickFilter = (value: string) => {
    Haptics.selectionAsync();
    setFilter(value);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          Memories
        </Text>

        <TouchableOpacity
          style={styles.takeBtn}
          onPress={openCamera}
        >
          <Ionicons
            name="camera"
            size={22}
            color="#fffef2"
          />

          <Text style={styles.takeText}>
            Take a Memory
          </Text>
        </TouchableOpacity>

        {/* filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {[
            {
              key: ALL,
              label: 'all',
            },
            {
              key: MINE,
              label: 'just me',
            },
            ...groups.map((group) => ({
              key: group.id,
              label: group.name,
            })),
          ].map((chip) => (
            <TouchableOpacity
              key={chip.key}
              style={[
                styles.chip,
                filter === chip.key && styles.chipActive,
              ]}
              onPress={() => pickFilter(chip.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === chip.key && styles.chipTextActive,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading && (
          <ActivityIndicator color="#b7931d" />
        )}

        {error && (
          <Text style={styles.errorText}>
            could not load memories: {error}
          </Text>
        )}

        {/* empty board, the blank polaroid opens the camera */}
        {!loading && !error && shown.length === 0 && (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={openCamera}
          >
            <Ionicons
              name="camera-outline"
              size={36}
              color="#b7931d"
            />
          </TouchableOpacity>
        )}

        <View style={styles.board}>
          {shown.map((memory, index) => {
            const counts = reactionCounts(memory);

            return (
              <TouchableOpacity
                key={memory.id}
                style={styles.card}
                onPress={() => openMemory(memory)}
                activeOpacity={0.9}
              >
                <MemoryFrame
                  uri={memory.uri}
                  frame={memory.frame}
                  width={cardWidth}
                  stickers={memory.stickers}
                  caption={memory.caption}
                  tilt={TILTS[index % TILTS.length]}
                />

                <View style={styles.meta}>
                  <Text
                    style={styles.metaGroup}
                    numberOfLines={1}
                  >
                    {groupName(memory.groupId)}
                  </Text>

                  {counts.map((row) => (
                    <View
                      key={row.reaction}
                      style={styles.metaCount}
                    >
                      <Ionicons
                        name={row.reaction as keyof typeof Ionicons.glyphMap}
                        size={12}
                        color="#8f741d"
                      />

                      <Text style={styles.metaText}>
                        {row.count}
                      </Text>
                    </View>
                  ))}

                  {memory.replies.length > 0 && (
                    <View style={styles.metaCount}>
                      <Ionicons
                        name="chatbubble"
                        size={11}
                        color="#8f741d"
                      />

                      <Text style={styles.metaText}>
                        {memory.replies.length}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// memory screen styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
  },

  scroll: {
    paddingTop: 24,
    paddingBottom: 110,
  },

  title: {
    fontSize: 32,
    fontFamily: 'Gaegu-Bold',
    color: '#4a3b12',
    marginHorizontal: 20,
    marginBottom: 12,
  },

  takeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#b7931d',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
  },

  takeText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 20,
    color: '#fffef2',
  },

  chips: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },

  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#fffef2',
    borderWidth: 1,
    borderColor: '#e8dab9',
  },

  chipActive: {
    borderColor: '#b7931d',
    backgroundColor: '#b7931d',
  },

  chipText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 15,
    color: '#5a4400',
  },

  chipTextActive: {
    color: '#fffef2',
  },

  errorText: {
    color: '#a83232',
    fontFamily: 'Gaegu-Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  emptyCard: {
    alignSelf: 'center',
    width: cardWidth,
    height: cardWidth * 1.15,
    borderRadius: 4,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d8c48f',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-2deg' }],
  },

  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    rowGap: 24,
  },

  card: {
    width: cardWidth,
  },

  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 2,
  },

  metaGroup: {
    flexShrink: 1,
    fontFamily: 'Gaegu-Regular',
    fontSize: 14,
    color: '#8a7a55',
  },

  metaCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  metaText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 13,
    color: '#8f741d',
  },
});

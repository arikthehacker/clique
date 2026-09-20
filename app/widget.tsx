/**
 * ==============================
 * FILE: app/widget.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * A preview of the home screen widget: one tile per group with its latest
 * memory.
 *
 * Includes:
 * - Up to four group tiles with real memories
 * - Empty state when there is nothing to show yet
 *
 * Notes:
 * - Preview only. The real widget needs native iOS and Android code.
 */

import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useGroups } from '../src/context/GroupContext';
import { useMemory } from '../src/context/MemoryContext';

const groupChatPhotoImg = require('../assets/images/groupchat-photo.png');

const widgetSize = Math.min(Dimensions.get('window').width - 80, 320);
const tileSize = (widgetSize - 12 * 3) / 2;

export default function WidgetPreview() {
  const router = useRouter();
  const { groups } = useGroups();
  const { memories } = useMemory();

  // one tile per group, with its newest memory
  const tiles = groups.slice(0, 4).map((group) => ({
    group: group,
    memory: memories.find((memory) => memory.groupId === group.id) ?? null,
  }));

  const handleBack = () => {
    // little tap feedback before leaving
    Haptics.selectionAsync();
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.back}
      >
        <Text style={styles.link}>
          ← back
        </Text>
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <Text style={styles.title}>
          Your widget
        </Text>

        <Text style={styles.soon}>
          coming soon
        </Text>
      </View>

      {/* widget preview */}
      <View style={styles.phoneBg}>
        <View style={styles.widget}>
          {tiles.length === 0 && (
            <Text style={styles.empty}>
              make a group and share a memory to see it here
            </Text>
          )}

          {tiles.map(({ group, memory }) => (
            <View
              key={group.id}
              style={styles.tile}
            >
              <Image
                source={memory ? { uri: memory.uri } : group.imageUri ? { uri: group.imageUri } : groupChatPhotoImg}
                style={styles.tileImage}
              />

              <View style={styles.tileLabel}>
                <Text
                  style={styles.tileText}
                  numberOfLines={1}
                >
                  {group.name}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// widget preview styling
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F1E3C0',
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  back: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  link: {
    fontFamily: 'Gaegu-Light',
    fontSize: 20,
    color: '#b7931d',
  },

  title: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 34,
    color: '#5a4400',
    alignSelf: 'flex-start',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    marginBottom: 20,
  },

  soon: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 14,
    color: '#fffef2',
    backgroundColor: '#b7931d',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },

  phoneBg: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: '#3b3350',
  },

  widget: {
    width: widgetSize,
    minHeight: widgetSize / 2,
    backgroundColor: '#fffef2',
    borderRadius: 22,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },

  empty: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 15,
    color: '#8a7a55',
    textAlign: 'center',
    padding: 12,
  },

  tile: {
    width: tileSize,
    height: tileSize,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#e8dab9',
  },

  tileImage: {
    width: tileSize,
    height: tileSize,
  },

  tileLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(90,68,0,0.55)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },

  tileText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 14,
    color: '#fff',
  },
});

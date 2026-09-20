/**
 * ==============================
 * FILE: app/memory/post.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The post-capture step. Preview the photo, dress it up, choose who sees it,
 * and save.
 *
 * Includes:
 * - Photo preview with the stickers placed so far
 * - Frame selection buttons
 * - Sticker tray, tap a placed sticker to remove it
 * - More sticker sets unlock with the step streak
 * - Share with: just me, or one of my groups
 * - Caption input
 * - Save button with a spinner
 * - Group memories also land in that group's chat
 *
 * Notes:
 * - Depends on the uri param from the camera or the chat tools bar.
 *   groupId is optional and preselects the group.
 */

import { useState } from 'react';

import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import StickerArt from '../../src/components/StickerArt';
import MemoryFrame from '../../src/components/MemoryFrame';
import { useGroups } from '../../src/context/GroupContext';
import { useMemory } from '../../src/context/MemoryContext';
import { useSteps } from '../../src/context/StepsContext';
import {
  MAX_STICKERS,
  placeSticker,
} from '../../src/lib/memories';
import { STICKER_SETS } from '../../src/lib/steps';
import {
  FRAMES,
  FrameType,
  Sticker,
} from '../../src/types';

const JUST_ME = '';

const previewWidth = Dimensions.get('window').width * 0.72;

export default function MemoryPost() {
  const router = useRouter();

  const {
    uri,
    groupId: presetGroupId,
  } = useLocalSearchParams<{ uri: string; groupId?: string }>();

  const { addMemory } = useMemory();

  const {
    groups,
    sendMessage,
  } = useGroups();

  const { unlocked } = useSteps();

  const [
    caption,
    setCaption,
  ] = useState('');

  const [
    frame,
    setFrame,
  ] = useState<FrameType>(FRAMES[0]);

  const [
    stickers,
    setStickers,
  ] = useState<Sticker[]>([]);

  const [
    groupId,
    setGroupId,
  ] = useState<string>(presetGroupId ?? JUST_ME);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const pickFrame = (frameOption: FrameType) => {
    Haptics.selectionAsync();
    setFrame(frameOption);
  };

  const pickGroup = (id: string) => {
    Haptics.selectionAsync();
    setGroupId(id);
  };

  const addSticker = (art: string) => {
    Haptics.selectionAsync();
    setStickers((current) => placeSticker(current, art));
  };

  const removeSticker = (index: number) => {
    Haptics.selectionAsync();
    setStickers((current) => current.filter((_, at) => at !== index));
  };

  const cancel = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const submit = async () => {
    // no photo, nothing to save
    if (!uri) {
      router.back();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    setError(null);

    const target = groupId === JUST_ME ? null : groupId;
    const cleanCaption = caption.trim();

    try {
      await addMemory({
        groupId: target,
        uri: uri,
        frame: frame,
        caption: cleanCaption,
        stickers: stickers,
        reactions: {},
        replies: [],
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the memory.');
      setSaving(false);
      return;
    }

    // group memories drop into the chat too
    if (target) {
      try {
        await sendMessage(target, cleanCaption || 'shared a memory', {
          imageUri: uri,
          kind: 'photo',
        });

        router.replace({
          pathname: '/groupchat/[id]',
          params: {
            id: target,
          },
        });
        return;
      } catch {
        // saved but not posted, so land on the feed instead
      }
    }

    // back to the memory tab so the new one shows first
    router.replace({
      pathname: '/home',
      params: {
        tab: 'memory',
      },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* preview with stickers, tap a sticker to take it off */}
      <View style={styles.previewWrap}>
        <MemoryFrame
          uri={uri}
          frame={frame}
          width={previewWidth}
          stickers={stickers}
          caption={caption}
          tilt={-1.5}
          onPressSticker={removeSticker}
        />
      </View>

      <Text style={styles.label}>
        Choose Frame:
      </Text>

      <View style={styles.optionRow}>
        {FRAMES.map((frameOption) => (
          <TouchableOpacity
            key={frameOption}
            style={[
              styles.optionBtn,
              frame === frameOption && styles.optionBtnActive,
            ]}
            onPress={() => pickFrame(frameOption)}
          >
            <Text
              style={[
                styles.optionText,
                frame === frameOption && styles.optionTextActive,
              ]}
            >
              {frameOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>
        Stickers:
      </Text>

      <View style={styles.stickerTray}>
        {STICKER_SETS.flatMap((set) => set.stickers).map((art) => {
          const locked = !unlocked.includes(art);

          return (
            <TouchableOpacity
              key={art}
              style={[
                styles.stickerBtn,
                locked && styles.stickerBtnLocked,
              ]}
              onPress={() => addSticker(art)}
              disabled={locked || stickers.length >= MAX_STICKERS}
            >
              <StickerArt
                art={art}
                size={56}
              />

              {locked && (
                <View style={styles.lockBadge}>
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color="#fff"
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>
        Share with:
      </Text>

      <View style={styles.optionRow}>
        <TouchableOpacity
          style={[
            styles.optionBtn,
            groupId === JUST_ME && styles.optionBtnActive,
          ]}
          onPress={() => pickGroup(JUST_ME)}
        >
          <Text
            style={[
              styles.optionText,
              groupId === JUST_ME && styles.optionTextActive,
            ]}
          >
            just me
          </Text>
        </TouchableOpacity>

        {groups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.optionBtn,
              groupId === group.id && styles.optionBtnActive,
            ]}
            onPress={() => pickGroup(group.id)}
          >
            <Text
              style={[
                styles.optionText,
                groupId === group.id && styles.optionTextActive,
              ]}
            >
              {group.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Add a caption…"
        placeholderTextColor="#999"
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={submit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons
              name="checkmark"
              size={24}
              color="#fff"
            />

            <Text style={styles.saveText}>
              {groupId === JUST_ME ? 'Save Memory' : 'Share Memory'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={cancel}>
        <Text style={styles.cancel}>
          Cancel
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// post-capture memory styling
const styles = StyleSheet.create({
  previewWrap: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },

  container: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#F1E3C0',
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Gaegu-Bold',
  },

  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },

  optionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#fffef2',
    borderWidth: 1,
    borderColor: '#e8dab9',
    marginRight: 8,
    marginBottom: 8,
  },

  optionBtnActive: {
    borderColor: '#b7931d',
    backgroundColor: '#b7931d',
  },

  optionText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 15,
    color: '#5a4400',
  },

  optionTextActive: {
    color: '#fffef2',
  },

  stickerTray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },

  stickerBtn: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#fffef2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stickerBtnLocked: {
    opacity: 0.35,
  },

  lockBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8f741d',
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    height: 80,
    textAlignVertical: 'top',
    fontFamily: 'Gaegu-Regular',
  },

  error: {
    color: '#a83232',
    fontFamily: 'Gaegu-Regular',
    marginTop: 12,
    textAlign: 'center',
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b7931d',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: 'center',
    minHeight: 48,
  },

  saveText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Gaegu-Regular',
  },

  cancel: {
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Gaegu-Light',
    fontSize: 18,
    color: '#614e26',
  },
});

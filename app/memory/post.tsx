/**
 * ==============================
 * FILE: app/memory/post.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen handles the post-capture memory flow.
 * It receives a captured image URI from the camera screen, lets the user choose
 * a frame, add a caption, save the memory through MemoryContext, and return to
 * the memory index screen.
 *
 * Includes:
 * - Captured image preview
 * - Frame selection buttons
 * - Caption input
 * - Save button
 * - MemoryContext save flow
 * - Route back to /memory after saving
 *
 * Notes:
 * - This screen is the more realistic memory-posting flow.
 * - It depends on a URI passed from app/memory/camera.tsx.
 * - Memory data is saved through context right now.
 * - Later, this should upload the image to Firebase Storage and save the
 *   memory document in Firestore.
 */

import React, {
  useState,
} from 'react';

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { useMemory } from '../_context/MemoryContext';

const FRAMES = [
  'polaroid',
  'vintage',
  'none',
] as const;

type FrameType = typeof FRAMES[number];

export default function MemoryPost() {
  const router = useRouter();

  const {
    uri,
  } = useLocalSearchParams<{
    uri: string;
  }>();

  const {
    addMemory,
  } = useMemory();

  const [
    caption,
    setCaption,
  ] = useState('');

  const [
    frame,
    setFrame,
  ] = useState<FrameType>(FRAMES[0]);

  const submit = () => {
    // saves the selected image/frame/caption into memory context
    addMemory({
      uri: uri,
      frame: frame,
      caption: caption,
    });

    // returns to the memory tab after saving
    router.replace('/memory');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: uri }}
        style={styles.preview}
      />

      <Text style={styles.label}>
        Choose Frame:
      </Text>

      <View style={styles.framesRow}>
        {FRAMES.map((frameOption) => (
          <TouchableOpacity
            key={frameOption}
            style={[
              styles.frameBtn,
              frame === frameOption && styles.frameBtnActive,
            ]}
            onPress={() => setFrame(frameOption)}
          >
            <Text>
              {frameOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Add a caption…"
        value={caption}
        onChangeText={setCaption}
      />

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={submit}
      >
        <Ionicons
          name="checkmark"
          size={24}
          color="#fff"
        />

        <Text style={styles.saveText}>
          Save Memory
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// post-capture memory styling
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#F1E3C0',
  },

  preview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
  },

  framesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  frameBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 8,
  },

  frameBtnActive: {
    borderColor: '#b7931d',
    backgroundColor: '#fffef2',
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    height: 80,
    textAlignVertical: 'top',
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b7931d',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: 'center',
  },

  saveText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
});

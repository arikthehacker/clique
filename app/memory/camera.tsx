/**
 * ==============================
 * FILE: app/memory/camera.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The camera step for a memory. Takes the photo and hands it to the post
 * screen.
 *
 * Includes:
 * - Camera permission prompt, with a settings link once it is denied
 * - Live camera preview
 * - Capture button
 * - Back button
 * - Opens /memory/post with the photo, and the group when it came from a chat
 *
 * Notes:
 * - The photo stays a local file until MemoryContext saves it.
 */

import {
  useRef,
  useState,
} from 'react';

import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import * as Haptics from 'expo-haptics';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import BackButton from '../../src/components/BackButton';

export default function MemoryCamera() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();

  const [
    permission,
    requestPermission,
  ] = useCameraPermissions();

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    failed,
    setFailed,
  ] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);

  // waiting for the permission result
  if (!permission) {
    return <View style={styles.filler} />;
  }

  // camera permission denied, no dramatic crash lol
  if (!permission.granted) {
    const allow = () => {
      Haptics.selectionAsync();

      if (permission.canAskAgain) {
        requestPermission();
        return;
      }

      Linking.openSettings();
    };

    return (
      <View style={styles.centerWrap}>
        <BackButton />

        <Text style={styles.center}>
          Clique needs the camera to take a memory
        </Text>

        <Pressable
          style={styles.allowBtn}
          onPress={allow}
        >
          <Text style={styles.allowText}>
            {permission.canAskAgain ? 'Allow camera' : 'Open settings'}
          </Text>
        </Pressable>
      </View>
    );
  }

  const snap = async () => {
    // one shot at a time
    if (!cameraRef.current || busy) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBusy(true);
    setFailed(false);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      // sends the captured image to the post/edit screen
      router.push({
        pathname: '/memory/post',
        params: {
          uri: photo.uri,
          ...(groupId ? { groupId: groupId } : {}),
        },
      });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing="back"
      />

      <BackButton />

      {failed && (
        <Text style={styles.failed}>
          that one did not take, try again
        </Text>
      )}

      <TouchableOpacity
        style={styles.snapBtn}
        onPress={snap}
        disabled={busy}
      >
        <Ionicons
          name="camera"
          size={32}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

// camera screen styling
const styles = StyleSheet.create({
  filler: {
    flex: 1,
    backgroundColor: '#000',
  },

  centerWrap: {
    flex: 1,
    backgroundColor: '#F1E3C0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  center: {
    textAlign: 'center',
    fontFamily: 'Gaegu-Regular',
    fontSize: 22,
    color: '#5a4400',
    marginBottom: 16,
  },

  allowBtn: {
    backgroundColor: '#b7931d',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  allowText: {
    color: '#fff',
    fontFamily: 'Gaegu-Regular',
    fontSize: 18,
  },

  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  failed: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
  },

  snapBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#b7931d',
    padding: 16,
    borderRadius: 32,
  },
});

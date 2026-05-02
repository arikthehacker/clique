/**
 * ==============================
 * FILE: app/memory/camera.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen handles the real camera capture flow for Clique memories.
 * It requests camera permission, shows the live camera view, captures a photo,
 * and sends that photo URI to the memory post screen.
 *
 * Includes:
 * - Camera permission request
 * - Live Expo Camera preview
 * - Camera ref for taking photos
 * - Capture button
 * - Route to /memory/post with the captured image URI
 *
 * Notes:
 * - This is the more functional camera-based memory flow.
 * - The captured image is passed through route params for now.
 * - Later, the photo should be uploaded to Firebase Storage and saved with
 *   memory metadata in Firestore.
 * - This file is separate from the memory mockup screen so camera behavior can
 *   be tested independently without breaking the demo layout.
 */

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { useRouter } from 'expo-router';

export default function MemoryCamera() {
  const router = useRouter();

  const [
    hasPerm,
    setHasPerm,
  ] = useState<boolean | null>(null);

  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      // asks for camera access before showing the camera screen
      const {
        status,
      } = await Camera.requestCameraPermissionsAsync();

      setHasPerm(status === 'granted');
    };

    requestPermission();
  }, []);

  // waiting for the permission result
  if (hasPerm === null) {
    return <View style={styles.filler} />;
  }

  // camera permission denied, no dramatic crash lol
  if (!hasPerm) {
    return (
      <Text style={styles.center}>
        No access to camera
      </Text>
    );
  }

  const snap = async () => {
    // do nothing if the camera ref is not ready yet
    if (!cameraRef.current) {
      return;
    }

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
    });

    // sends the captured image to the post/edit screen
    router.push({
      pathname: '/memory/post',
      params: {
        uri: photo.uri,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        ref={cameraRef}
      />

      <TouchableOpacity
        style={styles.snapBtn}
        onPress={snap}
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

  center: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    color: '#555',
  },

  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
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

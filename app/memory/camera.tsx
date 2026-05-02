
// FILE: app/memory/camera.tsx
// PURPOSE: request permission, show live camera, capture & navigate to post

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';            // <-- make sure this matches your install
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MemoryCamera() {
  const [hasPerm, setHasPerm] = useState<boolean|null>(null);
  const cameraRef = useRef<Camera|null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPerm(status === 'granted');
    })();
  }, []);

  if (hasPerm === null) return <View style={styles.filler} />;
  if (!hasPerm) return <Text style={styles.center}>No access to camera</Text>;

  const snap = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    router.push({ pathname: '/memory/post', params: { uri: photo.uri } });
  };

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef} />
      <TouchableOpacity style={styles.snapBtn} onPress={snap}>
        <Ionicons name="camera" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  filler: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, textAlign: 'center', marginTop: 50, color: '#555' },
  container: { flex: 1 },
  camera: { flex: 1 },
  snapBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#b7931d',
    padding: 16,
    borderRadius: 32,
  },
});

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function BackButton() {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} style={styles.button}>
      <Text style={styles.text}>← Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 60,
    left: 20,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,
  },
  text: {
    color: '#333',
    fontSize: 16,
  },
});



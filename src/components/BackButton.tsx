/**
 * ==============================
 * FILE: src/components/BackButton.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * A shared back button that returns to the previous screen.
 *
 * Includes:
 * - Back label pinned to the top-left
 * - Haptics on tap
 */

import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // tiny tap feedback before leaving the screen
    Haptics.selectionAsync();

    // back one screen
    router.back();
  };

  return (
    <Pressable
      onPress={handleBack}
      style={styles.button}
    >
      <Text style={styles.text}>
        Back
      </Text>
    </Pressable>
  );
}

// reusable back button styling
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
    color: '#615310',
    fontSize: 20,
    fontFamily: 'Gaegu-Light',
  },
});

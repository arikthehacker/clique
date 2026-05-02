/**
 * ==============================
 * FILE: app/components/BackButton.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This component gives screens a reusable back button that returns the user
 * to the previous route in the Expo Router navigation stack.
 *
 * Includes:
 * - Expo Router back navigation
 * - Pressable button wrapper
 * - Simple text-based arrow label
 * - Absolute positioning near the top-left of the screen
 * - Soft transparent background so it stays visible without feeling heavy
 *
 * Notes:
 * - This keeps the back button styling consistent across onboarding screens.
 * - Haptics is imported but not used yet.
 * - Later, haptic feedback can be added inside onPress so every back action
 *   feels consistent with the rest of Clique.
 */

import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    // tiny tap feedback before leaving the screen
    Haptics.selectionAsync();

    // sends user back one screen in the navigation stack
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

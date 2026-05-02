/**
 * ==============================
 * FILE: app/welcome.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen gives the user a short personalized welcome moment after
 * choosing a username. It acts as a soft transition between profile setup
 * and the next onboarding step.
 *
 * Includes:
 * - Username pulled from route params
 * - Default avatar display
 * - Floating avatar animation
 * - Haptic feedback when the screen loads
 * - Automatic route to /questions after a short delay
 * - Warm Clique styling with playful typography
 *
 * Notes:
 * - This is part of the demo/MVP onboarding flow.
 * - The avatar is currently using a default local image.
 * - Later, this should use the user's selected profile image from app state,
 *   Firestore user data, or Firebase Storage.
 * - The timeout keeps the demo flow moving without requiring another button tap.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function Welcome() {
  const router = useRouter();

  // grabs the username passed from the previous screen
  const { username } = useLocalSearchParams();

  // controls the up-and-down floating motion
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // tiny feedback so the screen feels alive
    Haptics.selectionAsync();

    // makes the avatar gently float instead of just sitting there
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // auto-continues so the welcome screen feels like a transition moment
    const timer = setTimeout(() => {
      router.push('/questions');
    }, 3000);

    // cleanup so the timer does not keep running if the screen changes early
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* floating avatar moment, very clique lol */}
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <Image
          source={require('../assets/images/default-avatar.png')}
          style={styles.avatar}
        />
      </Animated.View>

      {/* personalized welcome text */}
      <Text style={styles.text}>Welcome,</Text>
      <Text style={styles.username}>@{username}!</Text>
    </View>
  );
}

// screen styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6E49C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  text: {
    fontSize: 28,
    fontFamily: 'Figtree-SemiBold',
    color: '#333',
  },
  username: {
    fontSize: 46,
    fontFamily: 'Gaegu-Regular',
  },
});

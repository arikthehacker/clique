/**
 * ==============================
 * FILE: app/welcome.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * A short hello after the username is chosen, between profile setup and
 * the onboarding questions.
 *
 * Includes:
 * - Floating avatar, the user's own photo when they picked one
 * - "Welcome, @username"
 * - Moves on to /questions after three seconds
 */

import {
  useEffect,
  useState,
} from 'react';

import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useAuth } from '../src/context/AuthContext';

const defaultAvatar = require('../assets/images/default-avatar.png');

const CONTINUE_AFTER_MS = 3000;

export default function Welcome() {
  const router = useRouter();
  const { user } = useAuth();

  // controls the up-and-down floating motion
  const [floatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // tiny feedback so the screen feels alive
    Haptics.selectionAsync();

    // avatar gently floats
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
      ]),
    ).start();

    // moves on by itself after a beat
    const timer = setTimeout(() => {
      router.replace('/questions');
    }, CONTINUE_AFTER_MS);

    // stop the timer if they leave early
    return () => clearTimeout(timer);
  }, [
    floatAnim,
    router,
  ]);

  return (
    <View style={styles.container}>
      {/* floating avatar moment, very clique lol */}
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <Image
          source={user?.avatarUri ? { uri: user.avatarUri } : defaultAvatar}
          style={styles.avatar}
        />
      </Animated.View>

      <Text style={styles.text}>
        Welcome,
      </Text>

      <Text style={styles.username}>
        @{user?.username || 'friend'}!
      </Text>
    </View>
  );
}

// welcome screen styling
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

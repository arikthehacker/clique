
/**
 * ===============================
 * 📄 FILE: app/avatar.tsx
 * 🗓️ Last Updated: 2025-03-28
 * ===============================
 *
 * 🌍 PURPOSE:
 * This screen allows users to upload a profile photo and pick a username.
 * Orbiting dots around the avatar follow a physics-style motion:
 *   - Slow up top (against gravity)
 *   - Speed down bottom (with gravity)
 *
 * 🔁 Includes:
 * - Windows-style orbit animation
 * - Natural easing (gravity-inspired)
 * - No white border
 * - Haptics + KeyboardAvoidingView
 * - "Next" button only appears when username is filled
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

export default function Avatar() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.bezier(0.65, 0, 0.35, 1), // gravity-feel
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleNext = () => {
    Haptics.selectionAsync();
    router.push({ pathname: '/welcome', params: { username } });
  };

  const { width } = Dimensions.get('window');
  const avatarSize = 120;
  const dotSize = 8;
  const orbitRadius = avatarSize / 2 + 12;

  const rotateStyles = {
    transform: [
      {
        rotate: spinAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          style={styles.back}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Add a Profile Photo</Text>

        <View style={styles.avatarWrapper}>
          {/* Orbit ring */}
          <Animated.View style={[styles.orbitContainer, rotateStyles]}>
            {[...Array(8)].map((_, i) => {
              const angle = (2 * Math.PI * i) / 8;
              const x = orbitRadius * Math.cos(angle);
              const y = orbitRadius * Math.sin(angle);
              return (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      left: x + avatarSize / 2 - dotSize / 2,
                      top: y + avatarSize / 2 - dotSize / 2,
                    },
                  ]}
                />
              );
            })}
          </Animated.View>

          {/* Avatar */}
          <Image
            source={require('../assets/images/default-avatar.png')}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.subtitle}>Choose a username</Text>
        <TextInput
          placeholder="x__________"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />

        {username.length > 0 && (
          <Pressable style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>Next</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6E49C',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  back: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backText: {
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    position: 'relative',
    marginBottom: 60,
  },
  orbitContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#b7931d',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    width: '80%',
    fontFamily: 'serif',
    fontSize: 18,
  },
  nextButton: {
    backgroundColor: '#b7931d',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 24,
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});



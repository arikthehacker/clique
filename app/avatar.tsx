
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


// FILE: app/avatar.tsx
// PURPOSE: Upload avatar + custom username with orbit ring and x____ style input

// FILE: app/avatar.tsx
// PURPOSE: Avatar upload and username selection screen with orbit animation, inline username input, and photo picker

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const defaultAvatar = require('../assets/images/default-avatar.png');

export default function Avatar() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(defaultAvatar);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleNext = () => {
    Haptics.selectionAsync();
    router.push({ pathname: '/welcome', params: { username } });
  };

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setAvatar({ uri: result.assets[0].uri });
    }
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
        <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Add a Profile Photo</Text>

        <Pressable onPress={handleUpload} style={styles.avatarWrapper}>
          <Animated.View style={[styles.orbitContainer, rotateStyles]}>
            {[...Array(12)].map((_, i) => {
              const angle = (2 * Math.PI * i) / 12;
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
          <Image source={avatar} style={styles.avatar} />
        </Pressable>

        <Text style={styles.subtitle}>Choose your Username!</Text>

        <View style={styles.usernameWrapper}>
          <Text style={styles.usernamePrefix}>x </Text>
          <TextInput
            style={styles.usernameInput}
            value={username}
            onChangeText={setUsername}
            maxLength={80}
            placeholder="_ _ _ _ _ _ _ _ _ _ _"
            placeholderTextColor="#89710c"
            autoFocus
          />
        </View>

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
    fontSize: 24,
    fontFamily: 'Gaegu-Light',
    marginTop: 22,
    color: '#6d5909',
  },
  title: {
    fontSize: 36,
    fontFamily: 'Gaegu-Regular',
    marginBottom: 32,
    color: "#6d5909"
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
    backgroundColor: '#8a7211',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  subtitle: {
    fontSize: 26,
    fontFamily: 'Gaegu-Regular',
    marginBottom: 10,
    color: "#6d5909",
  },
  usernameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#D2BF71',
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginTop: 10,
    width: '90%',
  },
  usernamePrefix: {
    fontSize: 42,
    fontFamily: 'Gaegu-Regular',
    color: '#89710c',
  },
  usernameInput: {
    fontSize: 36,
    fontFamily: 'Gaegu-Regular',
    letterSpacing: 2,
    color: '#89710c',
    flex: 1,
    padding: 0,
  },
  nextButton: {
    backgroundColor: '#b7931d',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 24,
  },
  nextText: {
    color: '#f9efc9',
    fontFamily: 'Gaegu-Light',
    fontSize: 24,
  },
});

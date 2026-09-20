/**
 * ==============================
 * FILE: app/avatar.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Profile photo and username. The first onboarding step after sign up, and
 * the edit screen later from the profile drawer.
 *
 * Includes:
 * - Orbiting dots around the avatar
 * - Photo picker
 * - Username, with Next or Save once it has text
 * - Bio, phone and avatar frame when editing
 * - Error line if saving fails
 *
 * Notes:
 * - ?from=profile switches to editing and returns to the drawer.
 */

import {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { useAuth } from '../src/context/AuthContext';
import {
  FRAMES,
  FrameType,
} from '../src/types';

const defaultAvatar = require('../assets/images/default-avatar.png');

const AVATAR_SIZE = 120;
const DOT_SIZE = 8;
const DOT_COUNT = 12;
const ORBIT_RADIUS = AVATAR_SIZE / 2 + 12;

export default function Avatar() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const {
    user,
    updateProfile,
  } = useAuth();

  const editing = from === 'profile';

  const [
    username,
    setUsername,
  ] = useState(user?.username ?? '');

  const [
    avatar,
    setAvatar,
  ] = useState<ImageSourcePropType>(
    user?.avatarUri ? { uri: user.avatarUri } : defaultAvatar,
  );

  const [
    pickedUri,
    setPickedUri,
  ] = useState<string | null>(null);

  const [
    bio,
    setBio,
  ] = useState(user?.bio ?? '');

  const [
    phone,
    setPhone,
  ] = useState(user?.phone ?? '');

  const [
    avatarFrame,
    setAvatarFrame,
  ] = useState<FrameType>(user?.avatarFrame ?? 'none');

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [spinAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
        useNativeDriver: true,
      }),
    ).start();
  }, [spinAnim]);

  const cleanUsername = username.trim().replace(/^@/, '');

  const handleBack = () => {
    // little tap feedback before leaving
    Haptics.selectionAsync();
    router.back();
  };

  const handleUpload = async () => {
    Haptics.selectionAsync();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      setPickedUri(uri);
      setAvatar({ uri: uri });
    }
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError(null);
    setSaving(true);

    try {
      await updateProfile({
        username: cleanUsername,
        bio: bio.trim(),
        phone: phone.trim(),
        avatarFrame: avatarFrame,
        // only touch the avatar when a new one was picked
        ...(pickedUri ? { avatarUri: pickedUri } : {}),
      });

      if (editing) {
        router.back();
      } else {
        router.push('/welcome');
      }
    } catch {
      // save failed, keep them here to try again
      setError('could not save, try again');
    } finally {
      setSaving(false);
    }
  };

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
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={handleBack}
          style={styles.back}
        >
          <Text style={styles.backText}>
            ← Back
          </Text>
        </Pressable>

        <Text style={styles.title}>
          {editing ? 'Edit your profile' : 'Add a Profile Photo'}
        </Text>

        <Pressable
          onPress={handleUpload}
          style={styles.avatarWrapper}
        >
          <Animated.View
            style={[
              styles.orbitContainer,
              rotateStyles,
            ]}
          >
            {Array.from({ length: DOT_COUNT }, (_, index) => {
              const angle = (2 * Math.PI * index) / DOT_COUNT;
              const x = ORBIT_RADIUS * Math.cos(angle);
              const y = ORBIT_RADIUS * Math.sin(angle);

              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      left: x + AVATAR_SIZE / 2 - DOT_SIZE / 2,
                      top: y + AVATAR_SIZE / 2 - DOT_SIZE / 2,
                    },
                  ]}
                />
              );
            })}
          </Animated.View>

          <Image
            source={avatar}
            style={styles.avatar}
          />
        </Pressable>

        <Text style={styles.subtitle}>
          {editing ? 'Your username' : 'Choose your Username!'}
        </Text>

        <View style={styles.usernameWrapper}>
          <Text style={styles.usernamePrefix}>
            @
          </Text>

          <TextInput
            style={styles.usernameInput}
            value={username}
            onChangeText={setUsername}
            maxLength={32}
            placeholder="_ _ _ _ _ _ _"
            placeholderTextColor="#89710c"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={!editing}
          />
        </View>

        {editing && (
          <>
            <Text style={styles.subtitle}>
              Frame
            </Text>

            <View style={styles.frameRow}>
              {FRAMES.map((frame) => (
                <Pressable
                  key={frame}
                  style={[
                    styles.frameChip,
                    avatarFrame === frame && styles.frameChipActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAvatarFrame(frame);
                  }}
                >
                  <Text style={styles.frameChipText}>
                    {frame}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.field}
              value={bio}
              onChangeText={setBio}
              placeholder="a line about you"
              placeholderTextColor="#b9a55a"
              maxLength={120}
            />

            <TextInput
              style={styles.field}
              value={phone}
              onChangeText={setPhone}
              placeholder="phone (optional)"
              placeholderTextColor="#b9a55a"
              keyboardType="phone-pad"
              maxLength={24}
            />
          </>
        )}

        {error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        {cleanUsername.length > 0 && (
          <Pressable
            style={styles.nextButton}
            onPress={handleNext}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#f9efc9" />
            ) : (
              <Text style={styles.nextText}>
                {editing ? 'Save' : 'Next'}
              </Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// avatar screen styling
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

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
    color: '#6d5909',
  },

  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    position: 'relative',
    marginBottom: 60,
  },

  orbitContainer: {
    position: 'absolute',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },

  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#8a7211',
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },

  subtitle: {
    fontSize: 26,
    fontFamily: 'Gaegu-Regular',
    marginBottom: 10,
    color: '#6d5909',
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
    marginRight: 6,
  },

  usernameInput: {
    fontSize: 36,
    fontFamily: 'Gaegu-Regular',
    letterSpacing: 2,
    color: '#89710c',
    flex: 1,
    padding: 0,
  },

  frameRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },

  frameChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D2BF71',
  },

  frameChipActive: {
    backgroundColor: '#b7931d',
    borderColor: '#b7931d',
  },

  frameChipText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    color: '#6d5909',
  },

  field: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontFamily: 'Gaegu-Regular',
    fontSize: 18,
    color: '#6d5909',
  },

  error: {
    marginTop: 16,
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#a83232',
  },

  nextButton: {
    backgroundColor: '#b7931d',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 24,
    minWidth: 110,
    alignItems: 'center',
  },

  nextText: {
    color: '#f9efc9',
    fontFamily: 'Gaegu-Light',
    fontSize: 24,
  },
});

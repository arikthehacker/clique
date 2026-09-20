/**
 * ==============================
 * FILE: app/questions.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Three short questions at the end of onboarding, saved to the profile.
 * Also reachable from the profile drawer to change the answers.
 *
 * Includes:
 * - Three answers, prefilled from the saved ones
 * - Continue (Save when editing), once all three are filled
 * - Skip during onboarding, Cancel when editing
 * - Back button
 *
 * Notes:
 * - ?from=profile returns to the drawer instead of going to /home.
 */

import { useState } from 'react';

import {
  ActivityIndicator,
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
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import BackButton from '../src/components/BackButton';
import { useAuth } from '../src/context/AuthContext';

export default function Questions() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const {
    user,
    updateProfile,
  } = useAuth();

  const editing = from === 'profile';

  const [
    vibe,
    setVibe,
  ] = useState(user?.answers?.vibe ?? '');

  const [
    love,
    setLove,
  ] = useState(user?.answers?.love ?? '');

  const [
    connect,
    setConnect,
  ] = useState(user?.answers?.connect ?? '');

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const allFilled = Boolean(vibe.trim() && love.trim() && connect.trim());

  const finish = () => {
    if (editing) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setError(null);
    setSaving(true);

    try {
      await updateProfile({
        answers: {
          vibe: vibe.trim(),
          love: love.trim(),
          connect: connect.trim(),
        },
      });

      finish();
    } catch {
      // save failed, answers stay put so they can retry
      setError('could not save, try again');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    finish();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <BackButton />

        <Text style={styles.title}>
          {editing ? 'Update your answers:' : 'Let’s learn more about you:'}
        </Text>

        <TextInput
          placeholder="What's your vibe today?"
          placeholderTextColor="#999"
          value={vibe}
          onChangeText={setVibe}
          style={styles.input}
        />

        <TextInput
          placeholder="One thing you love?"
          placeholderTextColor="#999"
          value={love}
          onChangeText={setLove}
          style={styles.input}
        />

        <TextInput
          placeholder="Favorite way to connect?"
          placeholderTextColor="#999"
          value={connect}
          onChangeText={setConnect}
          style={styles.input}
        />

        {error && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        <View style={styles.buttons}>
          <Pressable
            style={[
              styles.continueBtn,
              (!allFilled || saving) && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
            disabled={!allFilled || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueText}>
                {editing ? 'Save' : 'Continue'}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>
              {editing ? 'Cancel' : 'Skip'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// questions screen styling
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    backgroundColor: '#F6E49C',
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },

  title: {
    fontSize: 26,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
    color: '#856d0f',
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontFamily: 'Gaegu-Light',
    fontSize: 26,
  },

  error: {
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    color: '#a83232',
    textAlign: 'center',
  },

  buttons: {
    alignItems: 'center',
    marginTop: 20,
  },

  continueBtn: {
    backgroundColor: '#8e7107',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 12,
    minWidth: 140,
    alignItems: 'center',
  },

  continueBtnDisabled: {
    opacity: 0.5,
  },

  continueText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Gaegu-Regular',
  },

  skipText: {
    color: '#ab912f',
    textDecorationLine: 'underline',
    fontFamily: 'Gaegu-Regular',
    fontSize: 20,
  },
});

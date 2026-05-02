/**
 * ===============================
 * FILE: app/questions.tsx
 * Last Updated: 2025-03-28
 * ===============================
 *
 * PURPOSE:
 * This page collects 3 short personal questions as part of the Clique onboarding.
 * It includes:
 *   - 3 free-response text inputs
 *   - "Continue" button (only active if all fields are filled)
 *   - "Skip" button (always available)
 *   - Back button at the top
 *   - Haptic feedback for all interactions
 *   - KeyboardAvoidingView to prevent keyboard overlap
 *
 * COMPONENTS & LOGIC:
 * - Local state tracks all 3 answers
 * - `allFilled` controls whether Continue is enabled
 * - Continue/Skip buttons both give haptic feedback
 * - BackButton navigates back to previous screen
 *
 * CUSTOMIZATION NOTES:
 * - Update questions by changing the placeholder text
 * - Style tweaks in StyleSheet below
 * - To route somewhere on submit: edit `handleContinue` or `handleSkip`
 *
 * FUTURE IDEAS:
 * - Save answers to Firebase
 * - Add animated transitions for input appearance
 */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import BackButton from './components/BackButton';

export default function Questions() {
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const router = useRouter();
  const allFilled = q1 && q2 && q3;
  const handleContinue = () => {
    Haptics.selectionAsync();
    router.push('/home');
    // route somewhere later
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    console.log('Skipped!');
    // route somewhere later
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <BackButton />

        <Text style={styles.title}>Let’s learn more about you:</Text>

        <TextInput
          placeholder="What's your vibe today?"
          value={q1}
          onChangeText={setQ1}
          style={styles.input}
          placeholderTextColor="#999"
        />
        <TextInput
          placeholder="One thing you love?"
          value={q2}
          onChangeText={setQ2}
          style={styles.input}
          placeholderTextColor="#999"
        />
        <TextInput
          placeholder="Favorite way to connect?"
          value={q3}
          onChangeText={setQ3}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <View style={styles.buttons}>
          <Pressable
            style={[styles.continueBtn, { opacity: allFilled ? 1 : 0.5 }]}
            onPress={handleContinue}
            disabled={!allFilled}
          >
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>

          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  buttons: {
    alignItems: 'center',
    marginTop: 20,
    fontFamily: 'Gaegu-Light',
  },
  continueBtn: {
    backgroundColor: '#8e7107',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 12,
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


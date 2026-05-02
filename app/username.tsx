/**
 * ==============================
 * FILE: app/username.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen lets the user choose their Clique username before moving
 * into the profile questions flow.
 *
 * Includes:
 * - Back button
 * - Username input field
 * - Next button routing to /questions
 * - Basic warm Clique styling
 *
 * Notes:
 * - This screen is currently UI-only for demo/MVP purposes.
 * - The username is not being saved yet.
 * - Later, this should store the username in Context, Firebase Auth user data,
 *   or a Firestore user profile document.
 */

import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from './components/BackButton';

export default function UsernameScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* back button so the user is not trapped here lol */}
      <BackButton />

      {/* this is where the user picks their @ name */}
      <Text style={styles.title}>Choose Your Username</Text>

      {/* todo: save this value instead of leaving it as display-only */}
      <TextInput placeholder="@username" style={styles.input} />

      {/* sends user to the little setup questions page */}
      <Button title="Next" onPress={() => router.push('/questions')} />
    </View>
  );
}

// basic screen styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6E49C',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 24,
    padding: 12,
  },
});

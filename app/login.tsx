/**
 * ==============================
 * FILE: app/login.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen handles the prototype login flow for Clique.
 * Users enter an email and password, then continue into the home screen.
 *
 * Includes:
 * - Back button
 * - Email + password inputs
 * - Hidden password text
 * - Continue button routing to /home
 * - Simple warm Clique styling
 *
 * Notes:
 * - This screen is currently UI-only for demo/MVP purposes.
 * - Firebase Auth can be connected here later.
 */

import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from './components/BackButton';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Log In</Text>
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />
      <Button title="Continue" onPress={() => router.push('/home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6E49C',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Outfit-Regular',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 12,
    fontFamily: 'Outfit-Regular',
    padding: 12,
  },
});

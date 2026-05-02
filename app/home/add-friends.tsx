/**
 * ===============================
 * FILE: app/add-friends.tsx
 * Last Updated: 2025-03-28
 * ===============================
 *
 * PURPOSE:
 * "Add Friends" screen for searching usernames.
 * Accessed via the SettingsSidebar (not from home header).
 *
 * FEATURES:
 *  - Handwritten-style “Add Friends!” title
 *  - Rounded search input
 *  - Fake username entry (placeholder for future logic)
 *  - Haptic feedback on tap
 *
 * CUSTOMIZATION NOTES:
 *  - Hook this up to Firebase search later
 *  - Add actual friend list / results below if needed
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function AddFriends() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>✧ Add Friends!</Text>

      <TextInput
        style={styles.input}
        placeholder="type a username..."
        placeholderTextColor="#aaa"
        onChangeText={setUsername}
        value={username}
      />

      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          // add logic here to search or invite
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          router.back();
        }}
        style={styles.back}
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Courier New',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#b7931d',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  back: {
    paddingVertical: 6,
  },
  backText: {
    fontSize: 16,
    color: '#555',
  },
});


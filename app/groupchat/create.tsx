/**
 * ==============================
 * FILE: app/groupchat/create.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen lets the user create a new group chat from the app flow.
 * It collects a group name, builds a temporary group object, and sends it
 * back to the home screen through route params.
 *
 * Includes:
 * - Group chat name input
 * - Create button
 * - Empty-name guard so blank groups are not created
 * - Temporary local group object
 * - Route back to /home with the new group data
 * - Cancel button
 *
 * Notes:
 * - This is currently front-end/demo logic.
 * - The new group is passed through route params instead of saved permanently.
 * - Later, this should create a Firestore group document and attach it to the
 *   current user's group list.
 * - Image support is scaffolded with image: null and can connect to an image
 *   picker or Firebase Storage later.
 */

import React, {
  useState,
} from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

type NewGroup = {
  id: string;
  name: string;
  image: string | null;
};

export default function CreateGroupChat() {
  const router = useRouter();

  const [
    name,
    setName,
  ] = useState('');

  const handleCreate = () => {
    // no blank group chat names, because chaos
    if (!name.trim()) {
      return;
    }

    const newGroup: NewGroup = {
      id: Date.now().toString(),
      name: name.trim(),
      image: null,
    };

    // sends the temporary group back home for the current demo flow
    router.replace({
      pathname: '/home',
      params: {
        newGroup: JSON.stringify(newGroup),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create a New Group Chat!
      </Text>

      {/* group name for the new chat */}
      <TextInput
        placeholder="What's your group chat name?"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
      >
        <Text style={styles.buttonText}>
          Create
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// simple create-screen styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
    padding: 50,
    justifyContent: 'center',
  },

  title: {
    fontSize: 32,
    color: '#614e26',
    fontFamily: 'Gaegu-Regular',
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#fff',
    padding: 14,
    fontFamily: 'Gaegu-Light',
    fontSize: 18,
    color: '#614e26',
    borderRadius: 12,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#b7931d',
    padding: 5,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 14,
  },

  buttonText: {
    color: '#fff',
    fontSize: 25,
    fontFamily: 'Gaegu-Light',
    fontWeight: '600',
  },

  cancel: {
    textAlign: 'center',
    color: '#614e26',
    fontFamily: 'Gaegu-Light',
    fontSize: 18,
  },
});

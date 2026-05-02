/**
 * ==============================
 * FILE: app/signup.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen handles the early prototype sign-up flow for Clique.
 * Users pick a username, optionally add a profile picture placeholder,
 * and then continue into the app with that basic profile data.
 *
 * Includes:
 * - Username input
 * - Profile picture upload placeholder
 * - Default avatar preview
 * - Temporary GLOBAL_USER object for demo data
 * - Route into the app with username + profile picture params
 * - Warm Clique styling
 *
 * Notes:
 * - This is currently a front-end prototype screen.
 * - GLOBAL_USER is temporary and should be replaced later with Context,
 *   Firebase Auth, or Firestore user profiles.
 * - The image upload logic is currently a placeholder.
 * - MaterialIcons is imported but not used yet, so it can be removed
 *   or used later for an upload/edit icon.
 */

import { MaterialIcons } from '@expo/vector-icons';
// or Ionicons, Feather, FontAwesome, etc.
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';

// will store user data in a global object or context for now:
let GLOBAL_USER = {
  username: '',
  pfp: '' // path or URI
};

const defaultAvatar = require('../assets/images/default-avatar.png');

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleUploadPic = () => {
    // placeholder logic: in real usage, pick from library or camera
    setProfilePic('../assets/images/default-avatar.png');
  };

  const handleSignUp = () => {
    if (!username) return;
    // store globally
    GLOBAL_USER.username = username;
    GLOBAL_USER.pfp = profilePic || '';
    // route to home
    router.push({
      pathname: '/index',
      params: { user: username, pfp: GLOBAL_USER.pfp }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      
      <TouchableOpacity style={styles.avatarUpload} onPress={handleUploadPic}>
        {profilePic ? (
          <Image
            source={defaultAvatar}
            style={styles.avatar}
          />
        ) : (
          <Text style={styles.avatarLabel}>Upload Picture</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Let's go!</Text>
      </TouchableOpacity>
    </View>
  );
}

// BASIC STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: '600'
  },
  avatarUpload: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarLabel: {
    color: '#999'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  input: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16
  },
  button: {
    backgroundColor: '#b7931d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Gaegu-Light',
  }
});

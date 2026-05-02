
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

// We'll store user data in a global object or context for now:
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
    // Placeholder logic - in real usage, pick from library or camera
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

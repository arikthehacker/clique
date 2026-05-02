/**
 * ===============================
 * FILE: app/auth.tsx
 * Last Updated: 2025-03-28
 * ===============================
 *
 * PURPOSE:
 * This file handles the Sign Up and Log In screen for the Clique app.
 * It contains:
 *   - Toggle tabs for switching between Login and Signup modes
 *   - Input fields for Email/Username and Password
 *   - Conditional extra field for Confirm Password in Sign Up mode
 *   - A smaller Submit button that navigates to /avatar
 *
 * COMPONENTS & LOGIC:
 * - `BackButton`: small component to navigate back
 * - `mode`: state to determine if we're in signup or login
 * - Input fields are rendered conditionally depending on mode
 * - Submit button text changes dynamically
 * - All buttons and toggles have haptic feedback
 * 
 * CUSTOMIZATION NOTES:
 * - To change form layout, update input styles
 * - To change button size/position, adjust `submit` in StyleSheet
 * - Navigation destination is set in `handleSubmit()`
 *     → Can be routed elsewhere if flow changes
 *
 * FUTURE IDEAS:
 * - Connect to Firebase for real authentication
 * - Add error handling + validation
 * - Add password visibility toggle
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from './components/BackButton';
import { MaterialIcons, FontAwesome, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = () => {
    Haptics.selectionAsync();
    if (mode === 'signup') {
      router.push('/avatar');
    } else {
      router.push('/home');
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />

      <Text style={styles.title}>Welcome to Clique</Text>
      <Text style={styles.subtitle}>Where memories meet moments.</Text>

      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggle, mode === 'login' && styles.activeToggle]}
          onPress={() => {
            Haptics.selectionAsync();
            setMode('login');
          }}
        >
          <Text style={[styles.toggleText, mode === 'login' && styles.activeToggleText]}>
            Log In
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggle, mode === 'signup' && styles.activeToggle]}
          onPress={() => {
            Haptics.selectionAsync();
            setMode('signup');
          }}
        >
          <Text style={[styles.toggleText, mode === 'signup' && styles.activeToggleText]}>
            Sign Up
          </Text>
        </Pressable>
      </View>

      <View style={styles.inputWrapper}>
        
  
{mode === 'signup' ? (
  <MaterialIcons name="mail" size={18} color="#b7931d" style={styles.icon} />
) : (
  <Feather name="user" size={18} color="#b7931d" style={styles.icon} />
)}

      <TextInput
          placeholder={mode === 'signup' ? 'Email' : 'Username'}
          placeholderTextColor="#999"
          value={emailOrUser}
          onChangeText={setEmailOrUser}
          style={styles.input}
        />
      </View>

      <View style={styles.inputWrapper}>
           
      <Feather name="lock" size={18} color="#b7931d" style={styles.icon} />

      <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      {mode === 'signup' && (
        <View style={styles.inputWrapper}>
          
<FontAwesome name="check-square" size={18} color="#b7931d" style={styles.icon} />

        <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            style={styles.input}
          />
        </View>
      )}

      <Pressable style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>
          {mode === 'signup' ? "Let's Get Started!" : 'Log In'}
          
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6E49C',
    padding: 37.5,
    justifyContent: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Gaegu-Regular',
    color: '#8f741d',
  },
  subtitle: {
    fontStyle: 'italic',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Figtree-Light',
    color: '#a98100',
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggle: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 12,
    //backgroundColor: '#eee',
  },
  activeToggle: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  toggleText: {
    color: '#8f741d',
    fontWeight: '500',
    fontFamily: 'Gaegu-Light',  
  },
  activeToggleText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 22,
    fontFamily: 'Gaegu-Light',
    color: '#333',
  },
 submit: {
  backgroundColor: '#b7931d',
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 30,
  alignSelf: 'center',
  marginTop: 10,
},
 
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Figtree-Regular',
    fontSize: 16,
  },
});



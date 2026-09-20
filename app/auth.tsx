/**
 * ==============================
 * FILE: app/auth.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Sign up or log in, then on to profile setup or home.
 *
 * Includes:
 * - Log In / Sign Up toggle
 * - Email, password, and confirm password on sign up
 * - Error line under the form
 * - Spinner on the button while it works
 * - A small note when the account is phone-only
 *
 * Notes:
 * - Sign up goes to /avatar. Log in goes straight to /home.
 * - Validation rules live in src/lib/validation.ts.
 */

import { useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Feather,
  FontAwesome,
  MaterialIcons,
} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import BackButton from '../src/components/BackButton';
import { useAuth } from '../src/context/AuthContext';
import {
  mapAuthError,
  validateSignIn,
  validateSignUp,
} from '../src/lib/validation';

type Mode = 'login' | 'signup';

export default function AuthScreen() {
  const router = useRouter();

  const {
    signUp,
    signIn,
    isDemo,
  } = useAuth();

  const [
    mode,
    setMode,
  ] = useState<Mode>('signup');

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    confirm,
    setConfirm,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const switchMode = (nextMode: Mode) => {
    // little tap feedback when flipping modes
    Haptics.selectionAsync();
    setMode(nextMode);
    setError(null);
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // no half-filled forms
    const problem =
      mode === 'signup'
        ? validateSignUp({
            email: email,
            password: password,
            confirm: confirm,
          })
        : validateSignIn({
            email: email,
            password: password,
          });

    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password);
        router.replace('/avatar');
      } else {
        await signIn(email.trim(), password);
        router.replace('/home');
      }
    } catch (submitError) {
      setError(mapAuthError(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton />

      <Text style={styles.title}>
        Welcome to Clique
      </Text>

      <Text style={styles.subtitle}>
        Where memories meet moments.
      </Text>

      {/* log in / sign up toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggle,
            mode === 'login' && styles.activeToggle,
          ]}
          onPress={() => switchMode('login')}
        >
          <Text
            style={[
              styles.toggleText,
              mode === 'login' && styles.activeToggleText,
            ]}
          >
            Log In
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.toggle,
            mode === 'signup' && styles.activeToggle,
          ]}
          onPress={() => switchMode('signup')}
        >
          <Text
            style={[
              styles.toggleText,
              mode === 'signup' && styles.activeToggleText,
            ]}
          >
            Sign Up
          </Text>
        </Pressable>
      </View>

      <View style={styles.inputWrapper}>
        <MaterialIcons
          name="mail"
          size={18}
          color="#b7931d"
          style={styles.icon}
        />

        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <View style={styles.inputWrapper}>
        <Feather
          name="lock"
          size={18}
          color="#b7931d"
          style={styles.icon}
        />

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
          <FontAwesome
            name="check-square"
            size={18}
            color="#b7931d"
            style={styles.icon}
          />

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

      {/* what went wrong */}
      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <Pressable
        style={[
          styles.submit,
          submitting && styles.submitBusy,
        ]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            {mode === 'signup' ? "Let's Get Started!" : 'Log In'}
          </Text>
        )}
      </Pressable>

      {isDemo && (
        <Text style={styles.demoNote}>
          your account lives on this phone
        </Text>
      )}
    </View>
  );
}

// auth screen styling
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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

  error: {
    color: '#a83232',
    fontFamily: 'Figtree-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
  },

  submit: {
    backgroundColor: '#b7931d',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    alignSelf: 'center',
    marginTop: 10,
    minWidth: 160,
    alignItems: 'center',
  },

  submitBusy: {
    opacity: 0.7,
  },

  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Figtree-Regular',
    fontSize: 16,
  },

  demoNote: {
    marginTop: 18,
    textAlign: 'center',
    fontFamily: 'Gaegu-Light',
    fontSize: 15,
    color: '#a98100',
  },
});

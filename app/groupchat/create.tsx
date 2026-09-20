/**
 * ==============================
 * FILE: app/groupchat/create.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Creates a new group chat. Takes a name, saves the group through
 * GroupContext, and goes back to the home screen.
 *
 * Includes:
 * - Group name input
 * - Create button with a spinner while saving
 * - Validation message for blank or too-long names
 * - Free plan group cap, with a link to plans
 * - Cancel
 *
 * Notes:
 * - Group photos are not supported yet.
 */

import { useState } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useAuth } from '../../src/context/AuthContext';
import { useGroups } from '../../src/context/GroupContext';
import {
  canCreateGroup,
  effectivePlan,
  FREE_GROUP_LIMIT,
} from '../../src/lib/plans';
import { validateGroupName } from '../../src/lib/validation';

export default function CreateGroupChat() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    groups,
    createGroup,
  } = useGroups();

  const plan = user ? effectivePlan(user.plan, user.trialStartedAt) : 'free';
  const capped = !canCreateGroup(plan, groups.length);

  const [
    name,
    setName,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const handleCreate = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const problem = validateGroupName(name);

    if (problem) {
      setError(problem);
      return;
    }

    // free plan caps how many groups you get
    if (capped) {
      setError(`the free plan tops out at ${FREE_GROUP_LIMIT} groups`);
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await createGroup(name.trim());
      router.back();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Could not create the group.');
      setSaving(false);
    }
  };

  const openPlans = () => {
    Haptics.selectionAsync();
    router.push('/plan');
  };

  const handleCancel = () => {
    Haptics.selectionAsync();
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create a New Group Chat!
      </Text>

      {/* group name for the new chat */}
      <TextInput
        placeholder="What's your group chat name?"
        placeholderTextColor="#9a8a5a"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoFocus
      />

      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            Create
          </Text>
        )}
      </TouchableOpacity>

      {capped && (
        <TouchableOpacity onPress={openPlans}>
          <Text style={styles.planLink}>
            see plans
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleCancel}>
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

  error: {
    color: '#a83232',
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },

  button: {
    backgroundColor: '#b7931d',
    padding: 5,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 14,
    minHeight: 44,
    justifyContent: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 25,
    fontFamily: 'Gaegu-Light',
    fontWeight: '600',
  },

  planLink: {
    textAlign: 'center',
    color: '#b7931d',
    fontFamily: 'Gaegu-Bold',
    fontSize: 18,
    marginBottom: 10,
  },

  cancel: {
    textAlign: 'center',
    color: '#614e26',
    fontFamily: 'Gaegu-Light',
    fontSize: 18,
  },
});

/**
 * ==============================
 * FILE: app/privacy.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * What happens to your data, in plain words.
 *
 * Includes:
 * - One short section per kind of data
 * - A different intro when the account is phone-only
 *
 * Notes:
 * - If what groups can read changes, this page has to change with it.
 */

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useAuth } from '../src/context/AuthContext';

const SECTIONS = [
  {
    title: 'Only on your phone',
    body: 'Your synced calendar (just busy times, never what the events are) and your step count.',
  },
  {
    title: 'Your groups can see',
    body: 'Your username, photo, bio, and phone if you added one. What you post in the chat, memories you share with the group, polls, to-dos, expenses, the free times you share, and your RSVPs.',
  },
  {
    title: 'Nobody else can see',
    body: 'Anything in a group you are not in.',
  },
  {
    title: 'Blocking',
    body: 'Blocking hides someone\'s messages from you everywhere. They are not told.',
  },
  {
    title: 'Off the grid',
    body: 'Pauses nudges and memory reminders. Your groups still work, you just will not get poked.',
  },
  {
    title: 'No ads, no tracking',
    body: 'Clique has no ads and no analytics. If that ever changes, you will hear it here first.',
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const { isDemo } = useAuth();

  const handleBack = () => {
    // little tap feedback before leaving
    Haptics.selectionAsync();
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.back}
      >
        <Text style={styles.link}>
          ← back
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Your data
      </Text>

      <Text style={styles.intro}>
        {isDemo
          ? 'Your account lives on this phone, so nothing you do here leaves it.'
          : 'Here is what stays with you and what your groups can see.'}
      </Text>

      {SECTIONS.map((section) => (
        <Text
          key={section.title}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>
            {section.title}
            {'\n'}
          </Text>
          {section.body}
        </Text>
      ))}
    </ScrollView>
  );
}

// privacy screen styling
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F1E3C0',
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },

  back: {
    marginBottom: 8,
  },

  link: {
    fontFamily: 'Gaegu-Light',
    fontSize: 20,
    color: '#b7931d',
  },

  title: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 34,
    color: '#5a4400',
    marginBottom: 6,
  },

  intro: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 17,
    color: '#785c10',
    marginBottom: 16,
  },

  section: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 17,
    color: '#5a4400',
    lineHeight: 24,
    marginBottom: 14,
  },

  sectionTitle: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 20,
  },
});

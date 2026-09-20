/**
 * ==============================
 * FILE: app/help.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Short answers to the questions people hit in their first week.
 *
 * Includes:
 * - A list of questions, tap one to open it
 *
 * Notes:
 * - When a feature changes, its answer here changes too.
 */

import { useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const QUESTIONS = [
  {
    q: 'How do I add someone to a group?',
    a: 'Open the group, tap its name, and add their @username under People. If they are not on Clique yet, they join as soon as they sign up.',
  },
  {
    q: 'What is a memory?',
    a: 'A photo you take from the Memory tab or a chat\'s palette. Add a frame, stickers and a caption, then keep it or share it with a group.',
  },
  {
    q: 'What does "whatcha up to?" do?',
    a: 'It nudges everyone in the chat to snap a memory. Turn on Memory reminders in a group\'s settings to get nudged on a schedule.',
  },
  {
    q: 'How do polls work?',
    a: 'Open the palette and tap Poll. Ask a question with two to six options. Everyone gets one vote and can change it until you close the poll.',
  },
  {
    q: 'How does "find a time" work?',
    a: 'In Calendar, tap find a time. Pick a group and a day, share when you are free, and you will see when everyone overlaps. Sync your calendar first and your busy hours are skipped for you.',
  },
  {
    q: 'Who can see my synced calendar?',
    a: 'Nobody. It stays on your phone. Only the free times you choose to share go to the group.',
  },
  {
    q: 'How do I split a bill?',
    a: 'Open the palette and tap Split. Add what was paid, who paid, and who it was for. You will see who owes who and the easiest way to settle up.',
  },
  {
    q: 'What is the streak?',
    a: 'Days in a row you hit your step goal. Longer streaks unlock more stickers for your memories. Steps stay on your phone.',
  },
  {
    q: 'What is off the grid?',
    a: 'A switch in your profile. It pauses nudges and memory reminders while your social battery recharges.',
  },
  {
    q: 'Something is broken.',
    a: 'Open Settings, tap Reports, and tell us what happened.',
  },
];

export default function HelpScreen() {
  const router = useRouter();

  const [
    open,
    setOpen,
  ] = useState<number | null>(null);

  const handleBack = () => {
    // little tap feedback before leaving
    Haptics.selectionAsync();
    router.back();
  };

  const toggle = (index: number) => {
    Haptics.selectionAsync();
    setOpen((current) => (current === index ? null : index));
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
        Help
      </Text>

      {QUESTIONS.map((item, index) => (
        <TouchableOpacity
          key={item.q}
          style={styles.item}
          onPress={() => toggle(index)}
        >
          <Text style={styles.question}>
            {item.q}
          </Text>

          {open === index && (
            <Text style={styles.answer}>
              {item.a}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// help screen styling
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
    marginBottom: 12,
  },

  item: {
    backgroundColor: '#fffef2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },

  question: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 18,
    color: '#5a4400',
  },

  answer: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    color: '#5a4400',
    lineHeight: 22,
    marginTop: 6,
  },
});

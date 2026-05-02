/**
 * ===============================
 * FILE: app/settings.tsx
 * Last Updated: 2025-03-28
 * ===============================
 *
 * PURPOSE:
 * This is the slide-out settings panel for the app.
 * It matches the sidebar you sketched, with:
 *  - User, Memories, Blocked, Notifications, Reports, Questions
 *  - App info footer
 *
 * COMPONENTS:
 *  - Pressable rows (no routing yet)
 *  - Clean layout with simple styling
 *  - Top sticky title + bottom sticky footer
 *
 * CUSTOMIZATION NOTES:
 *  - Add routing to each item using router.push()
 *  - Replace emoji icons with real SVGs/icons later
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function Settings() {
  const router = useRouter();

  const menuItems = [
    { label: 'User', icon: 'user' },
    { label: 'Memories', icon: 'image' },
    { label: 'Blocked', icon: 'slash' },
    { label: 'Notifications', icon: 'bell' },
    { label: 'Reports', icon: 'alert-triangle' },
    { label: 'Questions', icon: 'help-circle' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <ScrollView style={styles.menu}>
        {menuItems.map((item, i) => (
          <Pressable key={i} style={styles.row}>
            <Feather name={item.icon} size={20} color="#333" style={styles.icon} />
            <Text style={styles.label}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable>
        </Pressable>
        <Text style={styles.about}>About Clique</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
    paddingTop: 60,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 34,
    fontFamily: 'Outfit-Regular',
    marginBottom: 24,
  },
  menu: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.6,
  },
  icon: {
    marginRight: 16,
  },
  label: {
    fontSize: 28,
    fontFamily: 'Gaegu-Regular',
  },
  footer: {
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  info: {
    color: '#b7931d',
    marginBottom: 6,
    fontFamily: 'Gaegu-Regular',
  },
  about: {
    fontSize: 24,
    color: '#444',
    fontFamily: 'Outfit-Light',
    marginBottom: 25,
  },
});

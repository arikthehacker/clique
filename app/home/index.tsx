
/**
 * ===============================
 * 📄 FILE: app/home/index.tsx
 * 🗓️ Last Updated: 2025-03-28
 * ===============================
 *
 * 🏠 PURPOSE:
 * Main home screen with header, memories preview, group chats,
 * and true sidebar overlay for settings.
 *
 * 🧠 COMPONENTS:
 *  - Header with icons
 *  - Memory placeholder box
 *  - Group chat cards (static for now)
 *  - Bottom tab bar
 *  - SettingsSidebar overlay
 *
 * 🛠 CUSTOMIZATION NOTES:
 *  - Add navigation to chat pages or add-friend page
 *  - Replace fake group chat data later
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import SettingsSidebar from './SettingsSidebar';
import UserProfileSidebar from './UserProfileSidebar';

export default function HomeScreen() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setSettingsOpen(true);
          }}
        >
          <Text style={styles.icon}>⚙️</Text>
        </Pressable>

        <Text style={styles.title}>Clique</Text>

        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setProfileOpen(true);
          }}
        >
          <Text style={styles.icon}>👤</Text>
        </Pressable>
      </View>

      {/* Memories placeholder */}
      <View style={styles.memoryBox}>
        <Text style={styles.memoryText}>
          recent memories will show up here
        </Text>
      </View>

      {/* Group chats */}
      <Text style={styles.sectionTitle}>Group Chats</Text>
      <ScrollView style={styles.chatList}>
        {[1, 2, 3].map((item, idx) => (
          <View key={idx} style={styles.chatCard}>
            {idx < 2 ? (
              <Image
                source={{
                  uri: `https://source.unsplash.com/random/60x60?sig=${idx}`,
                }}
                style={styles.chatAvatar}
              />
            ) : (
              <View style={styles.chatAvatarPlaceholder} />
            )}
            <Text style={styles.chatName}>Group Chat Name</Text>
            <Text style={styles.more}>⋮</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.navbar}>
        <Text style={styles.navIcon}>💬</Text>
        <Text style={styles.navIcon}>🎁</Text>
        <Text style={styles.navIcon}>📅</Text>
      </View>

      {/* Sidebars */}
      {settingsOpen && (
        <SettingsSidebar onClose={() => setSettingsOpen(false)} />
      )}
      {profileOpen && (
        <UserProfileSidebar onClose={() => setProfileOpen(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    fontFamily: 'Cochin',
  },
  memoryBox: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fefefe',
    borderRadius: 12,
    alignItems: 'center',
  },
  memoryText: {
    fontStyle: 'italic',
    color: '#777',
  },
  sectionTitle: {
    marginLeft: 20,
    marginTop: 12,
    fontSize: 18,
    fontWeight: '500',
  },
  chatList: {
    marginHorizontal: 16,
  },
  chatCard: {
    backgroundColor: '#eee',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  chatAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  chatName: {
    flex: 1,
  },
  more: {
    fontSize: 18,
    color: '#888',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#f5e8c5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navIcon: {
    fontSize: 22,
  },
});


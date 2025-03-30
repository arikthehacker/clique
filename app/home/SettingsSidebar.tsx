

/**
 * ===============================
 * 📄 FILE: app/home/SettingsSidebar.tsx
 * 🗓️ Last Updated: 2025-03-28
 * ===============================
 *
 * 🎯 PURPOSE:
 * Full settings sidebar overlay with built-in sections
 * instead of routed screens. Everything appears inside the drawer.
 *
 * 🧠 EMBEDDED SECTIONS:
 * - Add Friends
 * - Memories
 * - Blocked
 * - Notifications
 * - Reports
 * - Questions
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function SettingsSidebar({ onClose }) {
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const [activeScreen, setActiveScreen] = useState(null); // which panel is open
  const [friendName, setFriendName] = useState('');

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const menuItems = [
    { label: 'Add Friends', icon: '➕', key: 'add' },
    { label: 'Memories', icon: '🧠', key: 'memories' },
    { label: 'Blocked', icon: '🚫', key: 'blocked' },
    { label: 'Notifications', icon: '🔔', key: 'notifications' },
    { label: 'Reports', icon: '❗', key: 'reports' },
    { label: 'Questions', icon: '❓', key: 'questions' },
  ];

  const renderScreen = () => {
    switch (activeScreen) {
      case 'add':
        return (
          <>
            <Text style={styles.header}>Add Friends ✧</Text>
            <TextInput
              style={styles.input}
              placeholder="type a username..."
              placeholderTextColor="#aaa"
              value={friendName}
              onChangeText={setFriendName}
            />
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
              }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Send Request</Text>
            </Pressable>
          </>
        );
      case 'memories':
        return <Text style={styles.placeholder}>✨ Your saved memories will appear here ✨</Text>;
      case 'blocked':
        return <Text style={styles.placeholder}>🚫 You haven’t blocked anyone... yet 😅</Text>;
      case 'notifications':
        return <Text style={styles.placeholder}>🔔 No notifications right now.</Text>;
      case 'reports':
        return <Text style={styles.placeholder}>📄 You haven’t filed any reports.</Text>;
      case 'questions':
        return <Text style={styles.placeholder}>❓ Questions you’ve submitted will show here.</Text>;
      default:
        return (
          <>
            <Text style={styles.header}>Settings ⚙️</Text>
            {menuItems.map((item, i) => (
              <Pressable
                key={i}
                style={styles.row}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveScreen(item.key);
                }}
              >
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.label}>{item.label}</Text>
              </Pressable>
            ))}
            <View style={styles.footer}>
              <Text style={styles.info}>🔮 app information</Text>
              <Text style={styles.about}>About Clique</Text>
            </View>
          </>
        );
    }
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        {renderScreen()}

        {activeScreen && (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setActiveScreen(null);
            }}
            style={styles.back}
          >
            <Text style={styles.backText}>← Back to Settings</Text>
          </Pressable>
        )}
      </Animated.View>

      <Pressable style={styles.backdrop} onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: 'row',
  },
  sidebar: {
    width: SCREEN_WIDTH * 0.7,
    backgroundColor: '#F1E3C0',
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 0.5,
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  label: {
    fontSize: 18,
  },
  footer: {
    marginTop: 30,
  },
  info: {
    color: '#b7931d',
    marginBottom: 6,
  },
  about: {
    fontSize: 14,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#b7931d',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  back: {
    marginTop: 20,
  },
  backText: {
    color: '#555',
    fontSize: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#444',
    fontStyle: 'italic',
    paddingTop: 10,
  },
});


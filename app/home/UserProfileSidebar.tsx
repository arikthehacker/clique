/**
 * ===============================
 * 📄 FILE: app/home/UserProfileSidebar.tsx
 * 🗓️ Last Updated: 2025-03-28
 * ===============================
 *
 * 🎯 PURPOSE:
 * A sidebar overlay that appears from the right when the user taps
 * the profile button. Mimics the style of the Settings sidebar but
 * appears on the opposite side. Displays:
 *
 * - Dotted avatar with border
 * - Display name and @username
 * - Customizable frame preview
 * - Handwriting-style font for username tag
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function UserProfileSidebar({ onClose }) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.overlay}>
      {/* Sidebar content */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
      >
        <Text style={styles.header}>Your Profile</Text>

        <View style={styles.avatarWrapper}>
          <View style={styles.dottedCircle}>
            <Image
              source={require('../../assets/images/default-avatar.png')}
              style={styles.avatar}
            />
          </View>
        </View>

        <Text style={styles.username}>Arik</Text>
        <Text style={styles.handle}>@username</Text>

        <View style={styles.framePreview}>
          <Text style={styles.frameLabel}>🎨 customizable frame preview</Text>
        </View>

        <Pressable onPress={onClose} style={styles.backBtn}>
          <Text style={styles.backText}>← Close</Text>
        </Pressable>
      </Animated.View>

      {/* Dim background */}
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
    flexDirection: 'row-reverse',
    zIndex: 999,
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dottedCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  username: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  handle: {
    fontFamily: 'Cochin', // or swap with handwritten Google Font later
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  framePreview: {
    backgroundColor: '#fff',
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  frameLabel: {
    color: '#777',
    fontStyle: 'italic',
  },
  backBtn: {
    marginTop: 20,
  },
  backText: {
    color: '#555',
    fontSize: 16,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});


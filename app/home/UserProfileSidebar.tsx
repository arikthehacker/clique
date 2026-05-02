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


// FILE: app/home/UserProfileSidebar.tsx

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
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const defaultAvatar = require('../../assets/images/default-avatar.png');
const recentMemoryImg   = require('../../assets/images/recent-memory.png');
const groupChatPhotoImg = require('../../assets/images/groupchat-photo.png');
const yingPfp           = require('../../assets/images/ying-pfp.png');
const jenniferPfp       = require('../../assets/images/jennifer-pfp.png');
const jennPfp           = require('../../assets/images/jenn-pfp.png');
const arikPfp           = require('../../assets/images/arik-pfp.png');
const groupPhoto1       = require('../../assets/images/group-photo1.png');


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
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <Text style={styles.header}>Your Profile</Text>

        <View style={styles.avatarWrapper}>
          <View style={styles.dottedCircle}>
            <Image source={arikPfp} style={styles.avatar} />
          </View>
        </View>

        <Text style={styles.handle}>@arik</Text>

        <Pressable onPress={onClose} style={styles.backBtn}>
          <Text style={styles.backText}>← Close</Text>
        </Pressable>
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
    flexDirection: 'row-reverse',
    zIndex: 999,
  },
  sidebar: {
    width: SCREEN_WIDTH * 0.7,
    backgroundColor: '#f6e49b',
    paddingTop: 60,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    fontSize: 40,
    color: "#5f480d",
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Gaegu-Regular',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 8,
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
  handle: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 30,
    color: "#5f480d",
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtn: {
    marginTop: 500,
    marginLeft: 40
  },
  backText: {
    color: "#5f480d",
    fontFamily: 'Gaegu-Light',
    fontSize: 30,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

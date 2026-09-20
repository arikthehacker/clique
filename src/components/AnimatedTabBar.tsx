/**
 * ==============================
 * FILE: src/components/AnimatedTabBar.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The bottom tab bar with a bubble that springs to the active tab, whether
 * the user tapped it or swiped to it.
 *
 * Includes:
 * - Three icons: group chat, memories, calendar
 * - Animated bubble under the active one
 * - Haptics on tap
 *
 * Notes:
 * - activeTab comes from the home TabView, so swipes move the bubble too.
 */

import { useEffect } from 'react';

import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useAuth } from '../context/AuthContext';
import { scaled } from '../lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const ICONS: IconName[] = [
  'chatbubble-outline',
  'albums-outline',
  'calendar-outline',
];

const screenWidth = Dimensions.get('window').width;
const tabWidth = screenWidth / ICONS.length;

type AnimatedTabBarProps = {
  activeTab: number;
  setActiveTab: (index: number) => void;
};

export default function AnimatedTabBar({
  activeTab,
  setActiveTab,
}: AnimatedTabBarProps) {
  const { user } = useAuth();
  const simple = user?.simpleMode ?? false;

  const translateX = useSharedValue(activeTab * tabWidth);

  useEffect(() => {
    translateX.value = withSpring(activeTab * tabWidth, {
      damping: 12,
      stiffness: 180,
    });
  }, [
    activeTab,
    translateX,
  ]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = (index: number) => {
    // little tap feedback when switching tabs
    Haptics.selectionAsync();
    setActiveTab(index);
  };

  return (
    <View style={styles.navbar}>
      <Animated.View
        style={[
          styles.bubble,
          bubbleStyle,
        ]}
      />

      {ICONS.map((icon, index) => (
        <TouchableOpacity
          key={icon}
          style={styles.iconWrapper}
          onPress={() => handlePress(index)}
        >
          <Ionicons
            name={icon}
            size={scaled(36, simple)}
            color="#70520c"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// tab bar styling
const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5e8c5',
    paddingVertical: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },

  iconWrapper: {
    flex: 1,
    alignItems: 'center',
    zIndex: 2,
  },

  bubble: {
    position: 'absolute',
    width: tabWidth - 32,
    height: 40,
    top: 8,
    left: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 1,
  },
});

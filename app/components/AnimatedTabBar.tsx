
// ===============================
// 📄 FILE: app/components/AnimatedTabBar.tsx
// 🗓️ Last Updated: 2025-03-30
// ===============================
//
// PURPOSE:
// Bottom tab bar with animated bubble that updates
// on tap AND swipe via `activeTab` prop



import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';


const icons = ['chatbubble-outline', 'albums-outline', 'calendar-outline'];
const screenWidth = Dimensions.get('window').width;
const tabWidth = screenWidth / icons.length;

export default function AnimatedTabBar({ activeTab, setActiveTab }: any) {
  const translateX = useSharedValue(activeTab * tabWidth);

  useEffect(() => {
    translateX.value = withSpring(activeTab * tabWidth, {
      damping: 12,
      stiffness: 180,
    });
  }, [activeTab]);

  const bubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.navbar}>
      <Animated.View style={[styles.bubble, bubbleStyle]} />
      {icons.map((icon, i) => (
        <TouchableOpacity
          key={i}
          style={styles.iconWrapper}
          onPress={() => setActiveTab(i)}
        >
         
        <Ionicons name={icon} size={36} color="#70520c" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

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
  icon: {
    fontSize: 24,
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

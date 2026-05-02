/**
 * ==============================
 * FILE: app/home/index.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This file controls the main logged-in home layout for Clique.
 * It uses a swipeable tab view to switch between the Group, Memory,
 * and Calendar sections while keeping the custom animated tab bar visible.
 *
 * Includes:
 * - Main home TabView
 * - Group tab
 * - Memory tab
 * - Calendar tab
 * - Custom AnimatedTabBar
 * - Haptic feedback when switching tabs
 * - Settings sidebar overlay
 * - User profile sidebar overlay
 * - Route-param check for newly created groups
 *
 * Notes:
 * - This screen acts like the main shell of the app after onboarding/login.
 * - GroupChatScreen manages the group chat home view.
 * - MemoryIndex is rendered directly inside the Memory tab.
 * - MasterCalendar is rendered directly inside the Calendar tab.
 * - Sidebars open as overlays instead of separate screens, which keeps the
 *   home experience feeling more like one connected app space.
 * - Some large comments are intentionally kept because they document feature
 *   swaps made during development.
 */

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';

import {
  useLocalSearchParams,
} from 'expo-router';

import {
  SceneMap,
  TabView,
} from 'react-native-tab-view';

import AnimatedTabBar from '../components/AnimatedTabBar';
import GroupChatScreen from './GroupChatScreen';
import SettingsSidebar from './SettingsSidebar';
import UserProfileSidebar from './UserProfileSidebar';

// ======= BIGG ASS COMMENT: ADDED IMPORT FOR MASTER CALENDAR =======
import MasterCalendar from '../calendar';
// ======= END BIGG ASS COMMENT =======

// ======= BIGG ASS COMMENT: ADDED MEMORY INDEX IMPORT SO MEMORY TAB SHOWS ACTUAL MEMORY SCREEN =======
import MemoryIndex from '../memory';
// ======= END BIGG ASS COMMENT =======

const screenWidth = Dimensions.get('window').width;

type HomeRoute = {
  key: 'group' | 'memory' | 'calendar';
  title: string;
};

const routes: HomeRoute[] = [
  {
    key: 'group',
    title: 'Group',
  },
  {
    key: 'memory',
    title: 'Memory',
  },
  {
    key: 'calendar',
    title: 'Calendar',
  },
];

// ======= BIGG ASS COMMENT: NEW CALENDARSCREEN RENDERS YOUR MASTER CALENDAR =======
const CalendarScreen = () => {
  return <MasterCalendar />;
};
// ======= END BIGG ASS COMMENT =======

// ======= BIGG ASS COMMENT: DELETE OLD MEMORYSCREEN W/ TAKE-A-MEMORY BUTTON =======
/*
const MemoryScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.page}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/memory');
        }}
        style={styles.memoryButton}
      >
        <Text style={styles.memoryText}>
          Take a Memory
        </Text>
      </TouchableOpacity>
    </View>
  );
};
*/
// ======= END BIGG ASS COMMENT =======

// ======= BIGG ASS COMMENT: MEMORY TAB NOW RENDERS MEMORY INDEX SCREEN DIRECTLY =======
const MemoryScreen = () => {
  return <MemoryIndex />;
};
// ======= END BIGG ASS COMMENT =======

export default function HomeTabs() {
  const params = useLocalSearchParams();

  const position = useRef(new Animated.Value(0)).current;

  const [
    index,
    setIndex,
  ] = useState(0);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  useEffect(() => {
    // checks for a new group coming back from the create screen
    if (params?.newGroup) {
      const parsed = JSON.parse(params.newGroup as string);

      // keeping this log while the route-param flow is still being tested
      console.log('loaded new group!!', parsed);
    }
  }, [params?.newGroup]);

  const renderScene = SceneMap({
    group: () => (
      <GroupChatScreen
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />
    ),

    // ======= BIGG ASS COMMENT: MEMORY TAB NOW RENDERS MemoryScreen (YOUR MEMORY GALLERY) =======
    memory: MemoryScreen,
    // ======= END BIGG ASS COMMENT =======

    calendar: CalendarScreen,
  });

  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);

    // little tap feedback when switching tabs
    Haptics.selectionAsync();
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <TabView
          navigationState={{
            index: index,
            routes: routes,
          }}
          renderScene={renderScene}
          onIndexChange={handleIndexChange}
          initialLayout={{
            width: screenWidth,
          }}
          renderTabBar={() => null}
          position={position}
        />

        <AnimatedTabBar
          activeTab={index}
          setActiveTab={setIndex}
        />

        {settingsOpen && (
          <SettingsSidebar onClose={() => setSettingsOpen(false)} />
        )}

        {profileOpen && (
          <UserProfileSidebar onClose={() => setProfileOpen(false)} />
        )}
      </View>
    </SafeAreaView>
  );
}

// main home shell styling
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F1E3C0',
  },

  container: {
    flex: 1,
  },

  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ======= BIGG ASS COMMENT: REMOVE UNUSED styles.memoryButton & memoryText =======
  /*
  memoryButton: {
    backgroundColor: '#b7931d',
    padding: 14,
    borderRadius: 12,
  },

  memoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  */
  // ======= END BIGG ASS COMMENT =======
});

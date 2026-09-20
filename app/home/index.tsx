/**
 * ==============================
 * FILE: app/home/index.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The main logged-in shell. A swipeable tab view for Group, Memory and
 * Calendar with the custom animated tab bar underneath.
 *
 * Includes:
 * - Group tab (GroupChatScreen)
 * - Memory tab (MemoryIndex)
 * - Calendar tab (MasterCalendar)
 * - AnimatedTabBar, in sync with swipes
 * - Haptics on tab change
 * - Settings and profile sidebars as overlays
 * - Yellow gradient background
 *
 * Notes:
 * - Other screens can open a tab with ?tab=memory or ?tab=calendar.
 */

import { useState } from 'react';

import {
  Dimensions,
  StyleSheet,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SceneRendererProps,
  TabView,
} from 'react-native-tab-view';

import MasterCalendar from '../calendar';
import AnimatedTabBar from '../../src/components/AnimatedTabBar';
import MemoryIndex from '../memory';
import GroupChatScreen from './GroupChatScreen';
import SettingsSidebar from './SettingsSidebar';
import UserProfileSidebar from './UserProfileSidebar';

const screenWidth = Dimensions.get('window').width;

type TabKey = 'group' | 'memory' | 'calendar';

type HomeRoute = {
  key: TabKey;
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

export default function HomeTabs() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();

  // start on whichever tab the caller asked for, group by default
  const initialIndex = Math.max(
    0,
    routes.findIndex((route) => route.key === tab),
  );

  const [
    index,
    setIndex,
  ] = useState(initialIndex);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const renderScene = ({ route }: SceneRendererProps & { route: HomeRoute }) => {
    if (route.key === 'memory') {
      return <MemoryIndex />;
    }

    if (route.key === 'calendar') {
      return <MasterCalendar />;
    }

    return (
      <GroupChatScreen
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />
    );
  };

  const handleIndexChange = (newIndex: number) => {
    // little tap feedback when switching tabs
    Haptics.selectionAsync();
    setIndex(newIndex);
  };

  // jumps from the settings drawer to the memory tab
  const openMemories = () => {
    setSettingsOpen(false);
    setIndex(routes.findIndex((route) => route.key === 'memory'));
  };

  return (
    <LinearGradient
      colors={[
        '#FFE873',
        '#F6E49B',
        '#F1E3C0',
      ]}
      style={styles.safeContainer}
    >
      <SafeAreaView style={styles.container}>
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
        />

        <AnimatedTabBar
          activeTab={index}
          setActiveTab={setIndex}
        />

        {settingsOpen && (
          <SettingsSidebar
            onClose={() => setSettingsOpen(false)}
            onOpenMemories={openMemories}
          />
        )}

        {profileOpen && (
          <UserProfileSidebar onClose={() => setProfileOpen(false)} />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

// main home shell styling
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
  },
});


// FILE: app/home/index.tsx
// PURPOSE: Swipeable main layout with animated raindrop tab bar, integrating Group, Memory, and Master Calendar screens
//


// FILE: app/home/index.tsx
// PURPOSE: Swipeable main layout with animated raindrop tab bar, integrating Group, Memory, and Master Calendar screens

import { StyleSheet } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { TabView, SceneMap } from 'react-native-tab-view';
import { useRouter, useLocalSearchParams } from 'expo-router';

import AnimatedTabBar from '../components/AnimatedTabBar';
import SettingsSidebar from './SettingsSidebar';
import UserProfileSidebar from './UserProfileSidebar';
import GroupChatScreen from './GroupChatScreen';

// ======= BIGG ASS COMMENT: ADDED IMPORT FOR MASTER CALENDAR =======
import MasterCalendar from '../calendar';
// ======= END BIGG ASS COMMENT =======

// ======= BIGG ASS COMMENT: NEW CalendarScreen RENDERS YOUR MASTER CALENDAR =======
const CalendarScreen = () => <MasterCalendar />;
// ======= END BIGG ASS COMMENT =======

const screenWidth = Dimensions.get('window').width;

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
        <Text style={styles.memoryText}>Take a Memory</Text>
      </TouchableOpacity>
    </View>
  );
};
*/
// ======= END BIGG ASS COMMENT =======

// ======= BIGG ASS COMMENT: ADDED MemoryScreen TO RENDER MEMORY INDEX SCREEN DIRECTLY =======
import MemoryIndex from '../memory';
const MemoryScreen = () => <MemoryIndex />;
// ======= END BIGG ASS COMMENT =======

export default function HomeTabs() {
  const [index, setIndex] = useState(0);
  const position = useRef(new Animated.Value(0)).current;
  const params = useLocalSearchParams();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (params?.newGroup) {
      const parsed = JSON.parse(params.newGroup);
      console.log('loaded new group!!', parsed);
    }
  }, [params?.newGroup]);

  const routes = [
    { key: 'group', title: 'Group' },
    { key: 'memory', title: 'Memory' },
    { key: 'calendar', title: 'Calendar' },
  ];

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

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={(i) => {
            setIndex(i);
            Haptics.selectionAsync();
          }}
          initialLayout={{ width: screenWidth }}
          renderTabBar={() => null}
          position={position}
        />

        <AnimatedTabBar activeTab={index} setActiveTab={setIndex} />

        {settingsOpen && <SettingsSidebar onClose={() => setSettingsOpen(false)} />}
        {profileOpen && <UserProfileSidebar onClose={() => setProfileOpen(false)} />}
      </View>
    </SafeAreaView>
  );
}

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

/**
 * ==============================
 * FILE: app/home/SettingsSidebar.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The settings drawer that slides in from the left, with each section
 * opening inside the drawer.
 *
 * Includes:
 * - People you share a group with
 * - Memory count and a jump to the Memory tab
 * - Blocked users, block and unblock
 * - Notification permission
 * - File a report, see past reports
 * - Onboarding answers
 * - Plan, Privacy and Help links
 * - Log out
 *
 * Notes:
 * - People are added inside a group's settings, not here.
 */

import {
  useEffect,
  useState,
} from 'react';

import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

import { useAuth } from '../../src/context/AuthContext';
import { useGroups } from '../../src/context/GroupContext';
import { useMemory } from '../../src/context/MemoryContext';
import { peopleAcrossGroups } from '../../src/lib/groups';

const SCREEN_WIDTH = Dimensions.get('window').width;

const defaultAvatar = require('../../assets/images/default-avatar.png');

type ScreenPath = '/plan' | '/privacy' | '/help';

type MenuKey = 'people' | 'memories' | 'blocked' | 'notifications' | 'reports' | 'questions';

type MenuItem = {
  key: MenuKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'people',
    label: 'People',
    icon: 'users',
  },
  {
    key: 'memories',
    label: 'Memories',
    icon: 'image',
  },
  {
    key: 'blocked',
    label: 'Blocked',
    icon: 'slash',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: 'bell',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: 'alert-triangle',
  },
  {
    key: 'questions',
    label: 'Questions',
    icon: 'help-circle',
  },
];

type LinkItem = {
  path: ScreenPath;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

const LINK_ITEMS: LinkItem[] = [
  {
    path: '/plan',
    label: 'Plan & referrals',
    icon: 'star',
  },
  {
    path: '/privacy',
    label: 'Privacy',
    icon: 'shield',
  },
  {
    path: '/help',
    label: 'Help',
    icon: 'life-buoy',
  },
];

type PermissionState = 'unknown' | 'granted' | 'denied';

type SettingsSidebarProps = {
  onClose: () => void;
  onOpenMemories: () => void;
};

export default function SettingsSidebar({
  onClose,
  onOpenMemories,
}: SettingsSidebarProps) {
  const router = useRouter();

  const {
    user,
    reports,
    signOut,
    blockUser,
    unblockUser,
    fileReport,
  } = useAuth();

  const { groups } = useGroups();
  const { memories } = useMemory();

  const [slideAnim] = useState(() => new Animated.Value(-SCREEN_WIDTH));

  const [
    activeScreen,
    setActiveScreen,
  ] = useState<MenuKey | null>(null);

  const [
    blockName,
    setBlockName,
  ] = useState('');

  const [
    reportAbout,
    setReportAbout,
  ] = useState('');

  const [
    reportReason,
    setReportReason,
  ] = useState('');

  const [
    reportNote,
    setReportNote,
  ] = useState<string | null>(null);

  const [
    permission,
    setPermission,
  ] = useState<PermissionState>('unknown');

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  useEffect(() => {
    Notifications.getPermissionsAsync().then((result) => {
      setPermission(result.granted ? 'granted' : 'denied');
    });
  }, []);

  const people = user ? peopleAcrossGroups(groups, user.uid) : [];

  const openSection = (key: MenuKey) => {
    Haptics.selectionAsync();
    setActiveScreen(key);
  };

  const handleClose = () => {
    Haptics.selectionAsync();
    onClose();
  };

  const backToMenu = () => {
    Haptics.selectionAsync();
    setActiveScreen(null);
  };

  const handleLogOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await signOut();
  };

  const goToMemories = () => {
    Haptics.selectionAsync();
    onOpenMemories();
  };

  const openScreen = (path: ScreenPath) => {
    Haptics.selectionAsync();
    onClose();
    router.push(path);
  };

  const goToQuestions = () => {
    Haptics.selectionAsync();
    onClose();

    router.push({
      pathname: '/questions',
      params: {
        from: 'profile',
      },
    });
  };

  const handleBlock = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!blockName.trim()) {
      return;
    }

    await blockUser(blockName);
    setBlockName('');
  };

  const handleUnblock = async (username: string) => {
    Haptics.selectionAsync();
    await unblockUser(username);
  };

  const requestNotifications = async () => {
    Haptics.selectionAsync();

    const result = await Notifications.requestPermissionsAsync();

    setPermission(result.granted ? 'granted' : 'denied');
  };

  const handleReport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!reportAbout.trim() || !reportReason.trim()) {
      setReportNote('say who and what');
      return;
    }

    try {
      await fileReport(reportAbout, reportReason);
    } catch {
      setReportNote('could not file that, try again');
      return;
    }

    setReportAbout('');
    setReportReason('');
    setReportNote('filed, thank you');
  };

  const renderScreen = () => {
    if (activeScreen === 'people') {
      return (
        <>
          <Text style={styles.header}>
            People
          </Text>

          {people.length === 0 && (
            <Text style={styles.placeholder}>
              Nobody yet. Add people inside a group’s settings.
            </Text>
          )}

          {people.map((person) => (
            <View
              key={person.key}
              style={styles.personRow}
            >
              <Image
                source={person.avatarUri ? { uri: person.avatarUri } : defaultAvatar}
                style={styles.personAvatar}
              />

              <Text style={styles.personName}>
                @{person.username}
              </Text>

              {person.invited && (
                <Text style={styles.personTag}>
                  invited
                </Text>
              )}
            </View>
          ))}
        </>
      );
    }

    if (activeScreen === 'memories') {
      return (
        <>
          <Text style={styles.header}>
            Memories
          </Text>

          <Text style={styles.placeholder}>
            {memories.length === 0
              ? 'No memories saved yet.'
              : `${memories.length} ${memories.length === 1 ? 'memory' : 'memories'} saved.`}
          </Text>

          <Pressable
            onPress={goToMemories}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              Open Memories
            </Text>
          </Pressable>
        </>
      );
    }

    if (activeScreen === 'blocked') {
      const blocked = user?.blocked ?? [];

      return (
        <>
          <Text style={styles.header}>
            Blocked
          </Text>

          {blocked.length === 0 && (
            <Text style={styles.placeholder}>
              You haven’t blocked anyone.
            </Text>
          )}

          {blocked.map((name) => (
            <View
              key={name}
              style={styles.personRow}
            >
              <Text style={styles.personName}>
                @{name}
              </Text>

              <Pressable onPress={() => handleUnblock(name)}>
                <Text style={styles.inlineLink}>
                  unblock
                </Text>
              </Pressable>
            </View>
          ))}

          <TextInput
            style={styles.input}
            placeholder="block a @username"
            placeholderTextColor="#aaa"
            value={blockName}
            onChangeText={setBlockName}
            autoCapitalize="none"
            onSubmitEditing={handleBlock}
            returnKeyType="done"
          />

          <Pressable
            onPress={handleBlock}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              Block
            </Text>
          </Pressable>
        </>
      );
    }

    if (activeScreen === 'notifications') {
      return (
        <>
          <Text style={styles.header}>
            Notifications
          </Text>

          <Text style={styles.placeholder}>
            {permission === 'granted'
              ? 'Reminders are on. Turn one on when you add a calendar event.'
              : permission === 'denied'
                ? 'Reminders are off. Allow notifications to get one before an event.'
                : 'Checking...'}
          </Text>

          {permission !== 'granted' && (
            <Pressable
              onPress={requestNotifications}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                Allow notifications
              </Text>
            </Pressable>
          )}
        </>
      );
    }

    if (activeScreen === 'reports') {
      return (
        <>
          <Text style={styles.header}>
            Reports
          </Text>

          <TextInput
            style={styles.input}
            placeholder="who, as @username"
            placeholderTextColor="#aaa"
            value={reportAbout}
            onChangeText={setReportAbout}
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              styles.inputTall,
            ]}
            placeholder="what happened"
            placeholderTextColor="#aaa"
            value={reportReason}
            onChangeText={setReportReason}
            multiline
          />

          <Pressable
            onPress={handleReport}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              File report
            </Text>
          </Pressable>

          {reportNote && (
            <Text style={styles.note}>
              {reportNote}
            </Text>
          )}

          {reports.length > 0 && (
            <Text style={styles.subheader}>
              Filed
            </Text>
          )}

          {reports.map((report) => (
            <Text
              key={report.id}
              style={styles.placeholder}
            >
              @{report.about}: {report.reason}
            </Text>
          ))}
        </>
      );
    }

    if (activeScreen === 'questions') {
      const answers = user?.answers ?? null;

      return (
        <>
          <Text style={styles.header}>
            Questions
          </Text>

          <Text style={styles.placeholder}>
            {answers
              ? `vibe: ${answers.vibe}\nloves: ${answers.love}\nconnects by: ${answers.connect}`
              : 'You skipped these during onboarding.'}
          </Text>

          <Pressable
            onPress={goToQuestions}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {answers ? 'Edit answers' : 'Answer now'}
            </Text>
          </Pressable>
        </>
      );
    }

    return (
      <>
        <Text style={styles.header}>
          Settings
        </Text>

        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.key}
            style={styles.row}
            onPress={() => openSection(item.key)}
          >
            <Feather
              name={item.icon}
              size={20}
              color="#725206"
              style={styles.icon}
            />

            <Text style={styles.label}>
              {item.label}
            </Text>
          </Pressable>
        ))}

        {LINK_ITEMS.map((item) => (
          <Pressable
            key={item.path}
            style={styles.row}
            onPress={() => openScreen(item.path)}
          >
            <Feather
              name={item.icon}
              size={20}
              color="#725206"
              style={styles.icon}
            />

            <Text style={styles.label}>
              {item.label}
            </Text>
          </Pressable>
        ))}

        <View style={styles.footer}>
          <Text style={styles.info}>
            App Info
          </Text>

          <Text style={styles.about}>
            Clique, a space for your close friend groups.
          </Text>

          <Pressable
            onPress={handleLogOut}
            style={styles.logout}
          >
            <Text style={styles.logoutText}>
              Log out
            </Text>
          </Pressable>
        </View>
      </>
    );
  };

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.sidebarScroll}
          keyboardShouldPersistTaps="handled"
        >
          {renderScreen()}

          {activeScreen && (
            <Pressable
              onPress={backToMenu}
              style={styles.back}
            >
              <Text style={styles.backText}>
                ← Back to Settings
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </Animated.View>

      <Pressable
        style={styles.backdrop}
        onPress={handleClose}
      />
    </View>
  );
}

// settings drawer styling
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
    backgroundColor: '#f6e49b',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },

  sidebarScroll: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  header: {
    fontSize: 46,
    color: '#725206',
    fontFamily: 'Gaegu-Regular',
    marginBottom: 20,
  },

  subheader: {
    fontSize: 20,
    color: '#725206',
    fontFamily: 'Gaegu-Bold',
    marginTop: 20,
    marginBottom: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#e1c45a',
    borderBottomWidth: 0.5,
  },

  icon: {
    marginRight: 15,
  },

  label: {
    fontSize: 18,
    fontFamily: 'Gaegu-Regular',
    color: '#5f480d',
  },

  footer: {
    marginTop: 30,
  },

  info: {
    color: '#b7931d',
    marginBottom: 6,
    fontFamily: 'Gaegu-Regular',
  },

  about: {
    fontSize: 14,
    color: '#725206',
    fontFamily: 'Gaegu-Regular',
  },

  logout: {
    marginTop: 24,
    alignSelf: 'flex-start',
  },

  logoutText: {
    fontSize: 18,
    fontFamily: 'Gaegu-Regular',
    color: '#a83232',
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontFamily: 'Gaegu-Regular',
    marginTop: 8,
  },

  inputTall: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: '#b7931d',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },

  buttonText: {
    color: '#fff',
    fontFamily: 'Figtree-SemiBold',
  },

  note: {
    marginTop: 10,
    fontFamily: 'Gaegu-Light',
    fontSize: 15,
    color: '#725206',
  },

  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },

  personName: {
    flex: 1,
    fontFamily: 'Gaegu-Regular',
    fontSize: 18,
    color: '#5f480d',
  },

  personTag: {
    fontFamily: 'Gaegu-Light',
    fontSize: 14,
    color: '#8a7a55',
  },

  inlineLink: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    color: '#b7931d',
  },

  back: {
    marginTop: 20,
  },

  backText: {
    color: '#555',
    fontSize: 16,
    fontFamily: 'Gaegu-Regular',
  },

  placeholder: {
    fontSize: 16,
    color: '#444',
    paddingTop: 10,
    fontFamily: 'Gaegu-Regular',
    lineHeight: 24,
  },
});

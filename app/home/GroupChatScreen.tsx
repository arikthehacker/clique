/**
 * ==============================
 * FILE: app/home/GroupChatScreen.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The Group tab. App header, a recent memory preview, and the user's
 * group chats.
 *
 * Includes:
 * - Settings and profile buttons
 * - Updates card: newest memory, next event, steps and streak
 * - Group chat list with the last message under each name
 * - Loading, error, and empty states
 * - Plus button to create a group
 *
 * Notes:
 * - Steps need a pedometer; phones without one show a short note instead.
 */

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useAuth } from '../../src/context/AuthContext';
import { useCalendar } from '../../src/context/CalendarContext';
import { useGroups } from '../../src/context/GroupContext';
import { useMemory } from '../../src/context/MemoryContext';
import { useSteps } from '../../src/context/StepsContext';
import {
  DATE_FORMAT,
  formatTime12,
} from '../../src/lib/calendar';
import { scaled } from '../../src/lib/theme';

const defaultMemory = require('../../assets/images/default-memory.png');

type GroupChatScreenProps = {
  onOpenSettings: () => void;
  onOpenProfile: () => void;
};

export default function GroupChatScreen({
  onOpenSettings,
  onOpenProfile,
}: GroupChatScreenProps) {
  const router = useRouter();

  const {
    groups,
    loading,
    error,
    messagesFor,
  } = useGroups();

  const { memories } = useMemory();
  const { events } = useCalendar();
  const { user } = useAuth();

  const {
    steps,
    available,
    refresh,
  } = useSteps();

  const latestMemory = memories[0] ?? null;
  const simple = user?.simpleMode ?? false;

  // the soonest event from today on, any calendar
  const todayKey = dayjs().format(DATE_FORMAT);
  const nextEvent = events.find((event) => event.date >= todayKey) ?? null;

  const nextEventLine = nextEvent
    ? [
      dayjs(nextEvent.date).format('MMM D'),
      formatTime12(nextEvent.time),
      nextEvent.title,
    ].filter(Boolean).join(' ')
    : 'nothing coming up';

  const groupLabel = (groupId: string | null) =>
    groupId ? (groups.find((group) => group.id === groupId)?.name ?? 'a group') : 'just me';

  // what the list shows under each group name
  const lastLine = (groupId: string) => {
    const last = messagesFor(groupId).slice(-1)[0];

    if (!last) {
      return 'no messages yet';
    }

    if (last.kind === 'photo') {
      return `${last.senderName} shared a photo`;
    }

    if (last.kind === 'poll') {
      return `${last.senderName} started a poll`;
    }

    return `${last.senderName}: ${last.text}`;
  };

  const openSettings = () => {
    Haptics.selectionAsync();
    onOpenSettings();
  };

  const openProfile = () => {
    Haptics.selectionAsync();
    onOpenProfile();
  };

  // taps the steps line to recount
  const refreshSteps = () => {
    Haptics.selectionAsync();
    refresh();
  };

  const openCreate = () => {
    Haptics.selectionAsync();
    router.push('/groupchat/create');
  };

  const openGroup = (groupId: string) => {
    Haptics.selectionAsync();

    router.push({
      pathname: '/groupchat/[id]',
      params: {
        id: groupId,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* top home header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openSettings}>
          <Ionicons
            name="settings-sharp"
            size={32}
            color="#725206"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Clique
        </Text>

        <TouchableOpacity onPress={openProfile}>
          <Ionicons
            name="person-circle-outline"
            size={36}
            color="#725206"
          />
        </TouchableOpacity>
      </View>

      {/* updates card */}
      <View style={styles.memoryBox}>
        <View style={styles.updatesRow}>
          <Image
            source={latestMemory ? { uri: latestMemory.uri } : defaultMemory}
            style={styles.memoryImage}
          />

          <View style={styles.updatesText}>
            <View style={styles.updateRow}>
              <Ionicons
                name="camera-outline"
                size={scaled(16, simple)}
                color="#8f741d"
              />

              <Text
                style={[
                  styles.updateLine,
                  { fontSize: scaled(14, simple) },
                ]}
                numberOfLines={2}
              >
                {latestMemory ? `${latestMemory.caption || 'a new memory'} · ${groupLabel(latestMemory.groupId)}` : 'no memories yet'}
              </Text>
            </View>

            <View style={styles.updateRow}>
              <Ionicons
                name="calendar-outline"
                size={scaled(16, simple)}
                color="#8f741d"
              />

              <Text
                style={[
                  styles.updateLine,
                  { fontSize: scaled(14, simple) },
                ]}
                numberOfLines={2}
              >
                {nextEventLine}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.updateRow}
              onPress={refreshSteps}
            >
              <Ionicons
                name="footsteps-outline"
                size={scaled(16, simple)}
                color="#8f741d"
              />

              <Text
                style={[
                  styles.updateLine,
                  { fontSize: scaled(14, simple) },
                ]}
              >
                {available === false ? 'steps not available on this phone' : `${steps.stepsToday.toLocaleString()} steps · streak ${steps.streak}`}
              </Text>

              {available !== false && steps.streak >= 3 && (
                <Ionicons
                  name="flame"
                  size={scaled(14, simple)}
                  color="#d9822b"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* group chat section header */}
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>
          Group Chats
        </Text>

        <TouchableOpacity onPress={openCreate}>
          <Ionicons
            name="add"
            size={24}
            color="#725206"
          />
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator
          color="#b7931d"
          style={styles.spinner}
        />
      )}

      {error && (
        <Text style={styles.error}>
          could not load your groups: {error}
        </Text>
      )}

      {/* empty state */}
      {!loading && !error && groups.length === 0 && (
        <Text style={styles.empty}>
          no group chats yet!
        </Text>
      )}

      {groups.length > 0 && (
        <ScrollView style={styles.chatList}>
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.chatCard}
              onPress={() => openGroup(group.id)}
            >
              {group.imageUri ? (
                <Image
                  source={{ uri: group.imageUri }}
                  style={styles.chatAvatar}
                />
              ) : (
                <View style={styles.chatAvatarPlaceholder}>
                  <Text style={styles.chatAvatarLetter}>
                    {group.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.chatText}>
                <Text
                  style={[
                    styles.chatName,
                    { fontSize: scaled(22, simple) },
                  ]}
                >
                  {group.name}
                </Text>

                <Text
                  style={styles.chatPreview}
                  numberOfLines={1}
                >
                  {lastLine(group.id)}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#725206"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// home screen styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 20,
  },

  title: {
    fontSize: 50,
    fontWeight: '600',
    fontFamily: 'Gaegu-Bold',
    color: '#594005',
  },

  memoryBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#d4c098',
    shadowColor: '#013',
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 3,
    elevation: 2,
  },

  updatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  updatesText: {
    flex: 1,
  },

  memoryImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    resizeMode: 'cover',
  },

  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },

  updateLine: {
    flexShrink: 1,
    fontFamily: 'Gaegu-Regular',
    fontSize: 14,
    color: '#555',
  },

  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  chatTitle: {
    fontSize: 40,
    color: '#70520c',
    fontWeight: '500',
    fontFamily: 'Gaegu-Regular',
  },

  spinner: {
    marginTop: 40,
  },

  error: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
    color: '#a83232',
  },

  empty: {
    fontSize: 20,
    fontFamily: 'Gaegu-Light',
    textAlign: 'center',
    marginTop: 180,
    color: '#70520c',
  },

  chatList: {
    flex: 1,
  },

  chatCard: {
    backgroundColor: 'rgba(255,255,255,0.55)',
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
    backgroundColor: '#e8dab9',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chatAvatarLetter: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 22,
    color: '#8f741d',
  },

  chatText: {
    flex: 1,
  },

  chatName: {
    fontSize: 22,
    fontFamily: 'Outfit-Light',
    color: '#6d500c',
  },

  chatPreview: {
    fontSize: 13,
    fontFamily: 'Gaegu-Light',
    color: '#8a7a55',
  },
});

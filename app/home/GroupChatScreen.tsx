/**
 * ==============================
 * FILE: app/home/GroupChatScreen.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen is the main home view for Clique's group chat experience.
 * It shows the app header, a recent memory preview, and the user's current
 * group chats.
 *
 * Includes:
 * - Settings button callback
 * - Profile button callback
 * - Recent memory preview card
 * - Group chat list
 * - Empty-state message when no groups exist yet
 * - Plus button route to group chat creation
 * - Route into an individual group chat room
 * - Temporary route-param handling for newly created groups
 *
 * Notes:
 * - This screen currently stores group chats in local component state.
 * - New groups are received through route params from app/groupchat/create.tsx.
 * - Later, this should load the user's groups from Firestore instead.
 * - The recent memory card is currently static demo content.
 * - onOpenSettings and onOpenProfile are passed in from the home layout so the
 *   sidebar overlays can open without routing away from the home screen.
 */

import React, {
  useEffect,
  useState,
} from 'react';

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

const defaultAvatar = require('../../assets/images/default-avatar.png');
const defaultMemory = require('../../assets/images/default-memory.png');

type GroupChat = {
  id: string;
  name: string;
  image: string | null;
};

type GroupChatScreenProps = {
  onOpenSettings: () => void;
  onOpenProfile: () => void;
};

export default function GroupChatScreen({
  onOpenSettings,
  onOpenProfile,
}: GroupChatScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [
    groupChats,
    setGroupChats,
  ] = useState<GroupChat[]>([]);

  useEffect(() => {
    // grabs a newly created group from the create screen
    if (params?.newGroup) {
      const parsed = JSON.parse(params.newGroup as string);

      setGroupChats((prevGroups) => [
        ...prevGroups,
        parsed,
      ]);
    }
  }, [params?.newGroup]);

  return (
    <View style={styles.container}>
      {/* top home header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onOpenSettings}>
          <Ionicons
            name="settings-sharp"
            size={32}
            color="#725206"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Clique
        </Text>

        <TouchableOpacity onPress={onOpenProfile}>
          <Ionicons
            name="person-circle-outline"
            size={36}
            color="#725206"
          />
        </TouchableOpacity>
      </View>

      {/* recent memory preview, static for now but visually important */}
      <View style={styles.memoryBox}>
        <Image
          source={defaultMemory}
          style={styles.memoryImage}
        />

        <Text style={styles.memoryText}>
          @arik    5m ago
        </Text>
      </View>

      {/* group chat section header */}
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>
          Group Chats
        </Text>

        {/* opens the group creation flow */}
        <TouchableOpacity onPress={() => router.push('/groupchat/create')}>
          <Ionicons
            name="add"
            size={24}
            color="#725206"
          />
        </TouchableOpacity>
      </View>

      {/* empty state keeps the screen from looking broken before groups exist */}
      {groupChats.length === 0 ? (
        <Text style={styles.empty}>
          no group chats yet!
        </Text>
      ) : (
        <ScrollView style={styles.chatList}>
          {groupChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() =>
                router.push({
                  pathname: `/groupchat/${chat.id}`,
                  params: {
                    name: chat.name,
                  },
                })
              }
            >
              {chat.image ? (
                <Image
                  source={{ uri: chat.image }}
                  style={styles.chatAvatar}
                />
              ) : (
                <View style={styles.chatAvatarPlaceholder} />
              )}

              <Text style={styles.chatName}>
                {chat.name}
              </Text>

              <Ionicons
                name="ellipsis-vertical"
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
    backgroundColor: '#f6e49b',
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
    alignItems: 'flex-start',
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

  memoryImage: {
    width: 160,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
  },

  memoryText: {
    fontFamily: 'Gaegu-Regular',
    marginLeft: 35,
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

  empty: {
    fontStyle: 'italic',
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
    backgroundColor: '#fcf0d4',
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
  },

  chatName: {
    flex: 1,
    fontSize: 22,
    fontFamily: 'Outfit-Light',
    color: '#6d500c',
  },
});

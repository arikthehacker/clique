/**
 * ==============================
 * FILE: app/groupchat/[id].tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen is the main group chat room for Clique.
 * It gives each group a shared chat space with message bubbles, group settings,
 * quick tool buttons, calendar preview, recent memories, and small profile peeks.
 *
 * Includes:
 * - Group chat header with editable group name
 * - Sender/receiver message alignment
 * - Message input bar
 * - Local message sending for demo/MVP use
 * - Magic tools bar for future features like camera, polls, widgets, and calendar
 * - Group settings modal
 * - Group photo and calendar preview
 * - Recent memories preview
 * - Profile peek modal
 * - KeyboardAvoidingView for better typing behavior on iOS
 *
 * Notes:
 * - This screen currently uses local state and hardcoded demo assets.
 * - Messages are not persisted yet.
 * - Later, this should connect to Firestore using groupId from the route params.
 * - Group settings, members, memories, and messages should eventually come from
 *   Firebase instead of local placeholder data.
 * - This file is intentionally visual because the group chat is one of Clique's
 *   main product demo screens.
 */

import { Ionicons } from '@expo/vector-icons';

import React, {
  useState,
} from 'react';

import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

const {
  width,
} = Dimensions.get('window');

const defaultAvatar = require('../../assets/images/basic-selfie2.png');
const defaultAvatar2 = require('../../assets/images/basic-selfie.png');
const defaultAvatar3 = require('../../assets/images/default-avatar.png');
const defaultCalendar = require('../../assets/images/default-calendar.png');
const recentMemoryImg = require('../../assets/images/recent-memory.png');
const groupChatPhotoImg = require('../../assets/images/groupchat-photo.png');
const yingPfp = require('../../assets/images/ying-pfp.png');
const jenniferPfp = require('../../assets/images/jennifer-pfp.png');
const jennPfp = require('../../assets/images/jenn-pfp.png');
const arikPfp = require('../../assets/images/arik-pfp.png');
const groupPhoto1 = require('../../assets/images/group-photo1.png');

type Message = {
  id: string;
  sender: string;
  text: string;
  time: string;
};

type ToolItem = {
  name: keyof typeof Ionicons.glyphMap;
  label: string;
};

const MAGIC_TOOLS: ToolItem[] = [
  {
    name: 'camera',
    label: 'Camera',
  },
  {
    name: 'images',
    label: 'Photos/Videos',
  },
  {
    name: 'videocam',
    label: 'Facetime',
  },
  {
    name: 'grid',
    label: 'Widget',
  },
  {
    name: 'calendar',
    label: 'Shared Calendar',
  },
  {
    name: 'stats-chart',
    label: 'Poll',
  },
];

export default function GroupChatRoom() {
  const router = useRouter();

  // route id is ready for future firestore group lookup
  const {
    id,
  } = useLocalSearchParams();

  const [
    groupName,
    setGroupName,
  ] = useState('Picnic Club');

  const [
    text,
    setText,
  ] = useState('');

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const [
    profileModalUser,
    setProfileModalUser,
  ] = useState<string | null>(null);

  const [
    magicOpen,
    setMagicOpen,
  ] = useState(false);

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([
    {
      id: '1',
      sender: 'Ying',
      text: 'Hellooooooooo :)',
      time: '3:45 PM',
    },
    {
      id: '2',
      sender: 'me',
      text: 'HIIIIIIIIIIIIIIIIIIIIIIII',
      time: '3:47 PM',
    },
  ]);

  const sendMessage = () => {
    // no empty messages allowed, bestie
    if (!text.trim()) {
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: text,
      time: new Date().toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      ),
    };

    // local-only message add for the current MVP
    setMessages((prevMessages) => [
      ...prevMessages,
      newMessage,
    ]);

    setText('');
  };

  const openProfilePeek = (username: string) => {
    setProfileModalUser(username);
  };

  const closeProfilePeek = () => {
    setProfileModalUser(null);
    setSettingsOpen(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* chat header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerIcon}>
            ←
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSettingsOpen(true)}
          style={styles.headerTitleWrap}
        >
          <Image
            source={arikPfp}
            style={styles.groupAvatar}
          />

          <Text style={styles.headerTitle}>
            {groupName}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSettingsOpen(true)}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Text style={styles.headerIcon}>
            ⋮
          </Text>
        </TouchableOpacity>
      </View>

      {/* message list */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatArea}
        renderItem={({ item }) => {
          const isMe = item.sender === 'me';

          return (
            <View
              style={[
                styles.messageWrap,
                isMe ? styles.alignEnd : styles.alignStart,
              ]}
            >
              {!isMe && (
                <TouchableOpacity onPress={() => openProfilePeek(item.sender)}>
                  <Image
                    source={yingPfp}
                    style={styles.msgAvatar}
                  />
                </TouchableOpacity>
              )}

              <View
                style={[
                  styles.msgBubble,
                  isMe ? styles.myBubble : styles.theirBubble,
                ]}
              >
                <Text style={styles.msgSender}>
                  {item.sender}
                </Text>

                <Text style={styles.messageText}>
                  {item.text}
                </Text>

                <Text style={styles.msgMeta}>
                  {item.time} · ✓ sent
                </Text>
              </View>

              {isMe && (
                <TouchableOpacity onPress={() => openProfilePeek(item.sender)}>
                  <Image
                    source={arikPfp}
                    style={styles.msgAvatar}
                  />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      {/* magic tools bar */}
      {magicOpen && (
        <View style={styles.magicBar}>
          {MAGIC_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.label}
              style={styles.toolButton}
              onPress={() => {
                // placeholder for future tool actions
              }}
            >
              <Ionicons
                name={tool.name}
                size={24}
                color="#b7931d"
              />

              <Text style={styles.toolLabel}>
                {tool.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* message input bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.starButton}
          onPress={() => setMagicOpen(!magicOpen)}
        >
          <Ionicons
            name="color-palette-sharp"
            size={22}
            color="#b7931d"
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
        />

        <TouchableOpacity onPress={sendMessage}>
          <Text style={styles.send}>
            ➤
          </Text>
        </TouchableOpacity>
      </View>

      {/* group settings modal */}
      <Modal
        transparent
        visible={settingsOpen}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={groupPhoto1}
              style={styles.modalBanner}
            />

            <TextInput
              style={styles.modalTitle}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name"
            />

            {/* calendar preview lives here for now */}
            <Image
              source={defaultCalendar}
              style={styles.modalCalendar}
            />

            {/* member/profile shortcut row */}
            <ScrollView
              horizontal
              contentContainerStyle={styles.modalFrames}
            >
              {[1, 2, 3, 4].map((memberNumber) => (
                <TouchableOpacity
                  key={memberNumber}
                  onPress={() => {
                    setSettingsOpen(false);

                    setTimeout(() => {
                      setProfileModalUser(`user${memberNumber}`);
                    }, 250);
                  }}
                >
                  <View style={styles.frameBox}>
                    <Image
                      source={groupChatPhotoImg}
                      style={styles.modalFrame}
                    />

                    <Text>
                      User {memberNumber}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>
              Recent Memories
            </Text>

            {/* recent memory previews */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {[1, 2, 3].map((memoryNumber) => (
                <View
                  key={memoryNumber}
                  style={styles.memoryBox}
                >
                  <Text style={styles.memoryCaption}>
                    @user{memoryNumber} · 1h ago
                  </Text>

                  <Image
                    source={jennPfp}
                    style={styles.memoryPreview}
                  />
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setSettingsOpen(false)}>
              <Text style={styles.closeButton}>
                ✖ close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* profile peek modal */}
      <Modal
        transparent
        visible={!!profileModalUser}
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={closeProfilePeek}
          activeOpacity={1}
        >
          <View
            style={[
              styles.modalContent,
              styles.profilePeekContent,
            ]}
          >
            <Image
              source={arikPfp}
              style={styles.modalBanner}
            />

            <Text style={styles.modalTitle}>
              @{profileModalUser}
            </Text>

            <Text style={styles.profilePeekText}>
              bio & details coming soon ! !
            </Text>

            <TouchableOpacity onPress={closeProfilePeek}>
              <Text style={styles.closeButton}>
                ✖ close
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// expanded styles so this file stays readable instead of turning into soup
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },

  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  groupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 70,
  },

  headerTitle: {
    fontSize: 36,
    fontWeight: '600',
    fontFamily: 'Gaegu-Regular',
    color: '#644400',
  },

  headerIcon: {
    fontSize: 30,
    color: '#785c10',
  },

  chatArea: {
    paddingHorizontal: 12,
    paddingBottom: 60,
  },

  messageWrap: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },

  alignStart: {
    justifyContent: 'flex-start',
  },

  alignEnd: {
    justifyContent: 'flex-end',
  },

  msgAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 8,
  },

  msgBubble: {
    borderRadius: 10,
    padding: 10,
    maxWidth: '70%',
  },

  myBubble: {
    backgroundColor: '#e0c465',
  },

  theirBubble: {
    backgroundColor: '#fffef2',
  },

  msgSender: {
    fontFamily: 'Figtree-SemiBold',
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#644400',
  },

  messageText: {
    fontSize: 15,
    color: '#644400',
    fontFamily: 'Outfit-Light',
  },

  msgMeta: {
    fontSize: 14,
    marginTop: 4,
    color: '#785c10',
    fontFamily: 'Gaegu-Light',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#efd575',
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: '#fff',
  },

  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
    fontFamily: 'Gaegu-Light',
    fontSize: 22,
  },

  send: {
    fontSize: 20,
    color: '#b7931d',
    fontFamily: 'Gaegu-Light',
  },

  starButton: {
    paddingHorizontal: 6,
  },

  magicBar: {
    backgroundColor: '#fffef2',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },

  toolButton: {
    alignItems: 'center',
    marginVertical: 6,
  },

  toolLabel: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 14,
    color: '#644400',
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: width * 0.9,
    backgroundColor: '#fffef2',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    maxHeight: '90%',
  },

  profilePeekContent: {
    alignItems: 'center',
  },

  modalBanner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 4,
  },

  modalCalendar: {
    width: 300,
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },

  modalFrames: {
    gap: 16,
    paddingHorizontal: 10,
  },

  frameBox: {
    alignItems: 'center',
  },

  modalFrame: {
    width: 80,
    height: 80,
    borderRadius: 14,
    marginBottom: 4,
  },

  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 10,
  },

  memoryBox: {
    marginRight: 12,
  },

  memoryCaption: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  memoryPreview: {
    width: 140,
    height: 100,
    borderRadius: 12,
  },

  profilePeekText: {
    marginTop: 8,
    color: '#666',
  },

  closeButton: {
    fontSize: 16,
    color: '#b7931d',
    marginTop: 16,
  },
});

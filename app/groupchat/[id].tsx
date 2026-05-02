// FILE: app/groupchat/[id].tsx
// PURPOSE: Whimsical group chat UI with message alignment, editable GC name, calendar preview, and profile peeks


import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');
const defaultAvatar = require('../../assets/images/basic-selfie2.png');
const defaultAvatar2 = require('../../assets/images/basic-selfie.png');
const defaultAvatar3 = require('../../assets/images/default-avatar.png');
const defaultCalendar = require('../../assets/images/default-calendar.png');
const recentMemoryImg   = require('../../assets/images/recent-memory.png');
const groupChatPhotoImg = require('../../assets/images/groupchat-photo.png');
const yingPfp           = require('../../assets/images/ying-pfp.png');
const jenniferPfp       = require('../../assets/images/jennifer-pfp.png');
const jennPfp           = require('../../assets/images/jenn-pfp.png');
const arikPfp           = require('../../assets/images/arik-pfp.png');
const groupPhoto1       = require('../../assets/images/group-photo1.png');

export default function GroupChatRoom() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [groupName, setGroupName] = useState('Picnic Club');
  const [text, setText] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [magicOpen, setMagicOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Ying', text: 'Hellooooooooo :)', time: '3:45 PM' },
    { id: '2', sender: 'me', text: 'HIIIIIIIIIIIIIIIIIIIIIIII', time: '3:47 PM' },
  ]);

  const sendMessage = () => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'me',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSettingsOpen(true)} style={styles.headerTitleWrap}>
          <Image source={arikPfp} style={styles.groupAvatar} />
          <Text style={styles.headerTitle}>{groupName}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSettingsOpen(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.headerIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatArea}
        renderItem={({ item }) => {
          const isMe = item.sender === 'me';
          return (
            <View style={[styles.messageWrap, isMe ? styles.alignEnd : styles.alignStart]}>
              {!isMe && (
                <TouchableOpacity onPress={() => setProfileModalUser(item.sender)}>
                  <Image source={yingPfp} style={styles.msgAvatar} />
                </TouchableOpacity>
              )}
              <View style={[styles.msgBubble, isMe ? styles.myBubble : styles.theirBubble]}>
                <Text style={styles.msgSender}>{item.sender}</Text>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.msgMeta}>{item.time} · ✓ sent</Text>
              </View>
              {isMe && (
                <TouchableOpacity onPress={() => setProfileModalUser(item.sender)}>
                  <Image source={arikPfp} style={styles.msgAvatar} />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />

      {/* Magic Tools Bar */}
       {/* I PUT THIS HEREEEEEE: add function icons toolbar */}
      {magicOpen && (
        <View style={styles.magicBar}>
          {[
            { name: 'camera', label: 'Camera' },
            { name: 'images', label: 'Photos/Videos' },
            { name: 'videocam', label: 'Facetime' },
            { name: 'grid', label: 'Widget' },
            { name: 'calendar', label: 'Shared Calendar' },
            { name: 'stats-chart', label: 'Poll' },
          ].map((tool, i) => (
            <TouchableOpacity key={i} style={styles.toolButton} onPress={() => {}}>
              <Ionicons name={tool.name} size={24} color="#b7931d" fontFamily="Gaegu-Regular" />
              <Text style={styles.toolLabel}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}


      {/*
      {magicOpen && (
        <View style={styles.magicBar}>
          <Text style={{ fontStyle: 'italic', fontFamily: 'Gaegu-Light', fontSize: 16, color: '#666' }}>toolbar coming soon hehe :-)</Text>
        </View>
      )}   */}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.starButton} onPress={() => setMagicOpen(!magicOpen)}>
         <Ionicons name="color-palette-sharp" size={22} color = "#b7931d" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
        />
        <TouchableOpacity onPress={sendMessage}>
          <Text style={styles.send}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal transparent visible={settingsOpen} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image source={groupPhoto1} style={styles.modalBanner} />
            <TextInput
              style={styles.modalTitle}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name"
            />

            {/* CALENDAR GOES HERE */}

            <Image source={defaultCalendar} style={styles.modalCalendar} />

            <ScrollView horizontal contentContainerStyle={styles.modalFrames}>
              {[1, 2, 3, 4].map((i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setSettingsOpen(false);
                    setTimeout(() => {
                      setProfileModalUser(`user${i}`);
                    }, 250);
                  }}
                >
                  <View style={styles.frameBox}>
                    <Image source={groupChatPhotoImg} style={styles.modalFrame} />
                    <Text>User {i}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Recent Memories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.memoryBox}>
                  <Text style={styles.memoryCaption}>@user{i} · 1h ago</Text>
                  <Image source={jennPfp} style={styles.memoryPreview} />
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setSettingsOpen(false)}>
              <Text style={styles.closeButton}>✖ close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Profile Peek Modal */}
      <Modal transparent visible={!!profileModalUser} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => {
            setProfileModalUser(null);
            setSettingsOpen(true);
          }}
          activeOpacity={1}
        >
          <View style={[styles.modalContent, { alignItems: 'center' }]}>
            <Image source={arikPfp} style={styles.modalBanner} />
            <Text style={styles.modalTitle}>@{profileModalUser}</Text>
            <Text style={{ marginTop: 8, color: '#666' }}>
              bio & details coming soon ! !
            </Text>
            <TouchableOpacity onPress={() => {
              setProfileModalUser(null);
              setSettingsOpen(true);
            }}>
              <Text style={styles.closeButton}>✖ close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1E3C0' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12,
  },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 70, },
  headerTitle: { fontSize: 36, fontWeight: '600', fontFamily: 'Gaegu-Regular', color: '#644400', },
  headerIcon: { fontSize: 30, color: '#785c10', },
  chatArea: { paddingHorizontal: 12, paddingBottom: 60 },
  messageWrap: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  alignStart: { justifyContent: 'flex-start' },
  alignEnd: { justifyContent: 'flex-end' },
  msgAvatar: { width: 36, height: 36, borderRadius: 18, marginHorizontal: 8 },
  msgBubble: { borderRadius: 10, padding: 10, maxWidth: '70%' },
  myBubble: { backgroundColor: '#e0c465' },
  theirBubble: { backgroundColor: '#fffef2' },
  msgSender: { fontFamily: 'Figtree-SemiBold', fontWeight: 'bold', marginBottom: 6, color: "#644400", },
  messageText: { fontSize: 15, color: '#644400', fontFamily: 'Outfit-Light', },
 

  msgMeta: { fontSize: 14, marginTop: 4, color: '#785c10', fontFamily: 'Gaegu-Light', }, 
  

  inputBar: {

    fontFamily: 'Gaegu-Light', flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#efd575',
    paddingHorizontal: 10, paddingBottom: 10, paddingTop: 6, backgroundColor: '#fff',
  },


  input: { flex: 1, padding: 10, backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 10, fontFamily: 'Gaegu-Light', fontSize: 22, },

  send: { fontSize: 20, color: '#b7931d', fontFamily: 'Gaegu-Light', },

  starButton: { paddingHorizontal: 6 },

  star: { fontSize: 18 },

  magicBar: {
    backgroundColor: '#fffef2', padding: 10, borderTopWidth: 1, borderColor: '#ccc',
  },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },

  modalContent: {
    width: width * 0.9, backgroundColor: '#fffef2', padding: 20, borderRadius: 16,
    alignItems: 'center', maxHeight: '90%',
  },

  modalBanner: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },

  modalTitle: {
    fontSize: 22, fontWeight: '600', marginBottom: 16, borderBottomWidth: 1, borderColor: '#ccc',
    textAlign: 'center', width: '100%', paddingVertical: 4,
  },

  modalCalendar: { width: 300, height: 200, borderRadius: 16, marginBottom: 20 },

  modalFrames: { gap: 16, paddingHorizontal: 10 },

  frameBox: { alignItems: 'center' },
  modalFrame: { width: 80, height: 80, borderRadius: 14, marginBottom: 4 },
  sectionLabel: { fontSize: 16, fontWeight: '500', marginTop: 20, marginBottom: 10 },
  memoryBox: { marginRight: 12 },
  memoryCaption: { fontSize: 12, color: '#666', marginBottom: 4 },
  memoryPreview: { width: 140, height: 100, borderRadius: 12 },
  closeButton: { fontSize: 16, color: '#b7931d', marginTop: 16 },
});


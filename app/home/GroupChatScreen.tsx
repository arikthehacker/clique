
// FILE: app/home/GroupChatScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const defaultAvatar = require('../../assets/images/default-avatar.png');
const defaultMemory = require('../../assets/images/default-memory.png');

export default function GroupChatScreen({ onOpenSettings, onOpenProfile }) {
  const [groupChats, setGroupChats] = useState([]);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params?.newGroup) {
      const parsed = JSON.parse(params.newGroup);
      setGroupChats((prev) => [...prev, parsed]);
    }
  }, [params?.newGroup]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onOpenSettings}>
          <Ionicons name="settings-sharp" size={32} color="#725206" />
        </TouchableOpacity>

        <Text style={styles.title}>Clique</Text>

        <TouchableOpacity onPress={onOpenProfile}>
          <Ionicons name="person-circle-outline" size={36} color="#725206" />
        </TouchableOpacity>
      </View>

      {/* I PUT THIS HEREEEEEE — memory preview frame with pinned picture */}
      <View style={styles.memoryBox}>
        <Image
          source={defaultMemory}
          style={styles.memoryImage}
        />
        <Text style={styles.memoryText}>@arik    5m ago</Text>
      </View>

      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Group Chats</Text>

        {/* I PUT THIS HEREEEEEE — working plus button to route to groupchat creation */}
        <TouchableOpacity onPress={() => router.push('/groupchat/create')}>
          <Ionicons name="add" size={24} color="#725206" />
        </TouchableOpacity>
      </View>

      {groupChats.length === 0 ? (
        <Text style={styles.empty}>no group chats yet!</Text>
      ) : (
        <ScrollView style={styles.chatList}>
          {groupChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() =>
                router.push({ pathname: `/groupchat/${chat.id}`, params: { name: chat.name } })
              }
            >
              {chat.image ? (
                <Image source={{ uri: chat.image }} style={styles.chatAvatar} />
              ) : (
                <View style={styles.chatAvatarPlaceholder} />
              )}
              <Text style={styles.chatName}>{chat.name}</Text>
              <Ionicons name="ellipsis-vertical" size={18} color="#725206" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

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
    color: "#594005",
  },
  memoryBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 14,
    alignItems: 'left',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#d4c098',
    shadowColor: '#013',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
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
    color: "#70520c",
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
    color: "#725206",
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
    fontFamily: "Outfit-Light",
    color: "#6d500c",
  },
});

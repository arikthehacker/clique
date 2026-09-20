/**
 * ==============================
 * FILE: app/memory/[id].tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * One memory, full size. React to it, reply under it, save it to the
 * phone's photo library, share it with a group, or delete it.
 *
 * Includes:
 * - The photo in its frame with its stickers
 * - Reaction bar, one reaction per person, tap again to remove
 * - Replies and a reply input
 * - Save to photos, stickers included
 * - Share with a group, which posts it into that chat
 * - Delete, with confirm
 *
 * Notes:
 * - Reactions and replies live on the owner's copy of the memory, so other
 *   group members cannot react here yet.
 */

import {
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library/legacy';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { captureRef } from 'react-native-view-shot';

import MemoryFrame from '../../src/components/MemoryFrame';
import { useAuth } from '../../src/context/AuthContext';
import { useGroups } from '../../src/context/GroupContext';
import { useMemory } from '../../src/context/MemoryContext';
import {
  addReply,
  reactionCounts,
  REACTIONS,
  toggleReaction,
} from '../../src/lib/memories';

const frameWidth = Dimensions.get('window').width * 0.78;

export default function MemoryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const {
    memories,
    updateMemory,
    deleteMemory,
  } = useMemory();

  const {
    groups,
    sendMessage,
  } = useGroups();

  const memory = memories.find((candidate) => candidate.id === id) ?? null;

  const [
    replyText,
    setReplyText,
  ] = useState('');

  const [
    note,
    setNote,
  ] = useState<string | null>(null);

  const [
    sharing,
    setSharing,
  ] = useState(false);

  const shotRef = useRef<View | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNote = (text: string) => {
    if (noteTimer.current) {
      clearTimeout(noteTimer.current);
    }

    setNote(text);
    noteTimer.current = setTimeout(() => setNote(null), 2200);
  };

  const goBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  if (!memory) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>
          this memory is gone
        </Text>

        <TouchableOpacity onPress={goBack}>
          <Text style={styles.link}>
            ← back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupName = memory.groupId
    ? (groups.find((group) => group.id === memory.groupId)?.name ?? 'a group')
    : 'just me';

  const mine = user ? memory.reactions[user.uid] : undefined;
  const counts = reactionCounts(memory);

  const react = async (reaction: string) => {
    if (!user) {
      return;
    }

    Haptics.selectionAsync();

    try {
      await updateMemory(memory.id, {
        reactions: toggleReaction(memory, user.uid, reaction).reactions,
      });
    } catch {
      showNote('could not save that reaction');
    }
  };

  const reply = async () => {
    // no empty replies
    if (!user || !replyText.trim()) {
      return;
    }

    Haptics.selectionAsync();

    const next = addReply(memory, user.uid, user.username || 'me', replyText);

    try {
      await updateMemory(memory.id, {
        replies: next.replies,
      });

      setReplyText('');
    } catch {
      showNote('could not send that reply');
    }
  };

  const saveToPhotos = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        showNote('photo library access was not allowed');
        return;
      }

      const uri = await captureRef(shotRef, {
        format: 'jpg',
        quality: 0.9,
      });

      await MediaLibrary.saveToLibraryAsync(uri);
      showNote('saved to your photos');
    } catch {
      showNote('could not save that one');
    }
  };

  const toggleSharing = () => {
    Haptics.selectionAsync();
    setSharing((open) => !open);
  };

  const shareWith = async (groupId: string) => {
    Haptics.selectionAsync();
    setSharing(false);

    try {
      await sendMessage(groupId, memory.caption || 'shared a memory', {
        imageUri: memory.uri,
        kind: 'photo',
      });
    } catch {
      showNote('could not share that one');
      return;
    }

    router.replace({
      pathname: '/groupchat/[id]',
      params: {
        id: groupId,
      },
    });
  };

  const confirmDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert('Delete this memory?', 'Photos already shared in a chat stay there.', [
      {
        text: 'Keep',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMemory(memory.id);
            router.back();
          } catch {
            showNote('could not delete that one');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        onPress={goBack}
        style={styles.back}
      >
        <Text style={styles.link}>
          ← back
        </Text>
      </TouchableOpacity>

      {/* the framed photo, saved as one image */}
      {/* padding keeps the shadow and tilt inside the saved picture */}
      <View
        ref={shotRef}
        collapsable={false}
        style={styles.shot}
      >
        <MemoryFrame
          uri={memory.uri}
          frame={memory.frame}
          width={frameWidth}
          stickers={memory.stickers}
          caption={memory.caption}
          tilt={-1.5}
        />
      </View>

      <Text style={styles.meta}>
        {dayjs(memory.createdAt).format('MMM D')} · {groupName}
      </Text>

      {/* reactions */}
      <View style={styles.reactionRow}>
        {REACTIONS.map((reaction) => {
          const count = counts.find((row) => row.reaction === reaction)?.count ?? 0;

          return (
            <TouchableOpacity
              key={reaction}
              style={[
                styles.reaction,
                mine === reaction && styles.reactionMine,
              ]}
              onPress={() => react(reaction)}
            >
              <Ionicons
                name={mine === reaction ? reaction : `${reaction}-outline`}
                size={22}
                color={mine === reaction ? '#b7931d' : '#8f741d'}
              />

              {count > 0 && (
                <Text style={styles.reactionCount}>
                  {count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* replies */}
      <Text style={styles.sectionLabel}>
        Replies
      </Text>

      {memory.replies.length === 0 && (
        <Text style={styles.empty}>
          nothing yet
        </Text>
      )}

      {memory.replies.map((entry) => (
        <Text
          key={entry.id}
          style={styles.replyText}
        >
          <Text style={styles.replyName}>
            {entry.uid === user?.uid ? 'you' : entry.name}:{' '}
          </Text>
          {entry.text}
        </Text>
      ))}

      <View style={styles.replyRow}>
        <TextInput
          style={styles.replyInput}
          value={replyText}
          onChangeText={setReplyText}
          placeholder="say something about it"
          placeholderTextColor="#999"
          onSubmitEditing={reply}
          returnKeyType="send"
        />

        <TouchableOpacity onPress={reply}>
          <Ionicons
            name="arrow-up-circle"
            size={32}
            color="#b7931d"
          />
        </TouchableOpacity>
      </View>

      {/* actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={saveToPhotos}
        >
          <Text style={styles.actionText}>
            Save to photos
          </Text>
        </TouchableOpacity>

        {groups.length > 0 && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={toggleSharing}
          >
            <Text style={styles.actionText}>
              Share with a group
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {sharing && (
        <View style={styles.shareRow}>
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.chip}
              onPress={() => shareWith(group.id)}
            >
              <Text style={styles.chipText}>
                {group.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {note && (
        <Text style={styles.note}>
          {note}
        </Text>
      )}

      <TouchableOpacity onPress={confirmDelete}>
        <Text style={styles.delete}>
          Delete memory
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// memory detail styling
const styles = StyleSheet.create({
  shot: {
    padding: 18,
    alignItems: 'center',
  },

  container: {
    flexGrow: 1,
    backgroundColor: '#F1E3C0',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 16,
  },

  missing: {
    flex: 1,
    backgroundColor: '#F1E3C0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  missingText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 22,
    color: '#5a4400',
    marginBottom: 12,
  },

  back: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  link: {
    fontFamily: 'Gaegu-Light',
    fontSize: 20,
    color: '#b7931d',
  },

  meta: {
    fontFamily: 'Gaegu-Light',
    fontSize: 14,
    color: '#8a7a55',
    marginBottom: 12,
  },

  reactionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#fffef2',
    borderWidth: 1,
    borderColor: '#e8dab9',
  },

  reactionMine: {
    borderColor: '#b7931d',
    backgroundColor: '#fff',
  },

  reactionCount: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
    color: '#5a4400',
  },

  sectionLabel: {
    alignSelf: 'flex-start',
    fontFamily: 'Gaegu-Bold',
    fontSize: 20,
    color: '#5a4400',
    marginTop: 20,
    marginBottom: 6,
  },

  empty: {
    alignSelf: 'flex-start',
    fontFamily: 'Gaegu-Light',
    fontSize: 15,
    color: '#8a7a55',
  },

  replyText: {
    alignSelf: 'flex-start',
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    color: '#5a4400',
    marginBottom: 4,
  },

  replyName: {
    fontFamily: 'Gaegu-Bold',
  },

  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 8,
    gap: 8,
  },

  replyInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },

  actionBtn: {
    backgroundColor: '#b7931d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  actionText: {
    color: '#fff',
    fontFamily: 'Gaegu-Bold',
    fontSize: 15,
  },

  shareRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    justifyContent: 'center',
  },

  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#fffef2',
    borderWidth: 1,
    borderColor: '#b7931d',
  },

  chipText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 15,
    color: '#5a4400',
  },

  note: {
    marginTop: 12,
    fontFamily: 'Gaegu-Light',
    fontSize: 15,
    color: '#785c10',
  },

  delete: {
    marginTop: 28,
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
    color: '#a83232',
  },
});

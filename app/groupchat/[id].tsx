/**
 * ==============================
 * FILE: app/groupchat/[id].tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The chat room for one group: messages, today's question, and a tools bar
 * for planning things together.
 *
 * Includes:
 * - Header with group photo, name, and member count
 * - Today's question with everyone's answers
 * - Messages, shared photos, poll cards, and nudges
 * - Pull down to load older messages
 * - Tools bar: camera, photos, poll, to-do, split, nudge, calendar, widget
 * - Settings: photo, rename, people, invites, reminders, events, memories
 * - Long press a photo to save or report it
 * - Profile peek with block and unblock
 *
 * Notes:
 * - A nudge only pings your own phone until push notifications exist.
 * - Facetime is not built yet.
 */

import {
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library/legacy';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { useAuth } from '../../src/context/AuthContext';
import { useCalendar } from '../../src/context/CalendarContext';
import { useGroups } from '../../src/context/GroupContext';
import { useMemory } from '../../src/context/MemoryContext';
import { usePlanning } from '../../src/context/PlanningContext';
import {
  balances,
  formatAmount,
  parseAmount,
  settleUp,
} from '../../src/lib/expenses';
import {
  AmPm,
  DATE_FORMAT,
  formatTime12,
  to24Hour,
  upcomingEvents,
} from '../../src/lib/calendar';
import {
  memberRows,
  normalizeUsername,
  visibleMessages,
} from '../../src/lib/groups';
import { notifyNow } from '../../src/lib/notifications';
import {
  MAX_OPTIONS,
  tally,
  votedOption,
} from '../../src/lib/polls';
import { scaled } from '../../src/lib/theme';
import { validateMessage } from '../../src/lib/validation';
import {
  MemorySchedule,
  Message,
  Poll,
} from '../../src/types';

const { width } = Dimensions.get('window');

const defaultAvatar = require('../../assets/images/default-avatar.png');
const groupChatPhotoImg = require('../../assets/images/groupchat-photo.png');

type ToolKey = 'camera' | 'photos' | 'poll' | 'todo' | 'split' | 'nudge' | 'calendar' | 'facetime' | 'widget';

type ToolItem = {
  key: ToolKey;
  name: keyof typeof Ionicons.glyphMap;
  label: string;
};

const MAGIC_TOOLS: ToolItem[] = [
  {
    key: 'camera',
    name: 'camera',
    label: 'Camera',
  },
  {
    key: 'photos',
    name: 'images',
    label: 'Photos',
  },
  {
    key: 'poll',
    name: 'stats-chart',
    label: 'Poll',
  },
  {
    key: 'todo',
    name: 'checkbox-outline',
    label: 'To-do',
  },
  {
    key: 'split',
    name: 'cash-outline',
    label: 'Split',
  },
  {
    key: 'nudge',
    name: 'sparkles',
    label: 'Whatcha up to?',
  },
  {
    key: 'calendar',
    name: 'calendar',
    label: 'Calendar',
  },
  {
    key: 'facetime',
    name: 'videocam',
    label: 'Facetime',
  },
  {
    key: 'widget',
    name: 'grid',
    label: 'Widget',
  },
];

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
const NUDGE_TEXT = 'whatcha up to? take a memory';

export default function GroupChatRoom() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    user,
    blockUser,
    unblockUser,
    fileReport,
  } = useAuth();

  const {
    groups,
    messagesFor,
    sendMessage,
    renameGroup,
    setGroupImage,
    setSchedule,
    leaveGroup,
    inviteMember,
    loadOlderMessages,
  } = useGroups();

  const {
    pollsFor,
    createPoll,
    vote,
    closePoll,
    todosFor,
    addTodo,
    toggleTodo,
    removeTodo,
    questionFor,
    askQuestion,
    answerQuestion,
    expensesFor,
    addExpense,
    removeExpense,
  } = usePlanning();

  const { memories } = useMemory();
  const { events } = useCalendar();

  const today = dayjs().format(DATE_FORMAT);

  const group = groups.find((candidate) => candidate.id === id) ?? null;
  const messages = visibleMessages(messagesFor(id), user?.blocked ?? []);
  const polls = pollsFor(id);
  const todos = todosFor(id);
  const expenses = expensesFor(id);
  const owed = balances(expenses);
  const simple = user?.simpleMode ?? false;
  const question = questionFor(id, today);
  const groupMemories = memories.filter((memory) => memory.groupId === id);
  const todaysMemory = groupMemories.find((memory) => dayjs(memory.createdAt).format(DATE_FORMAT) === today) ?? null;
  const nextEvents = upcomingEvents(events, id, dayjs(), 3);
  const members = group && user ? memberRows(group, user.uid) : [];
  const joined = members.filter((member) => !member.invited);

  const [
    groupName,
    setGroupName,
  ] = useState('');

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
    toolNote,
    setToolNote,
  ] = useState<string | null>(null);

  const [
    inviteName,
    setInviteName,
  ] = useState('');

  const [
    inviteNote,
    setInviteNote,
  ] = useState<string | null>(null);

  const [
    loadingOlder,
    setLoadingOlder,
  ] = useState(false);

  // poll modal
  const [
    pollOpen,
    setPollOpen,
  ] = useState(false);

  const [
    pollQuestion,
    setPollQuestion,
  ] = useState('');

  const [
    pollOptions,
    setPollOptions,
  ] = useState<string[]>(['', '']);

  const [
    pollError,
    setPollError,
  ] = useState<string | null>(null);

  // to-do modal
  const [
    todoOpen,
    setTodoOpen,
  ] = useState(false);

  const [
    todoText,
    setTodoText,
  ] = useState('');

  const [
    todoAssignee,
    setTodoAssignee,
  ] = useState<string | null>(null);

  // split modal
  const [
    splitOpen,
    setSplitOpen,
  ] = useState(false);

  const [
    expenseTitle,
    setExpenseTitle,
  ] = useState('');

  const [
    expenseAmount,
    setExpenseAmount,
  ] = useState('');

  const [
    expensePaidBy,
    setExpensePaidBy,
  ] = useState<string | null>(null);

  const [
    expenseSplit,
    setExpenseSplit,
  ] = useState<string[]>([]);

  const [
    expenseNote,
    setExpenseNote,
  ] = useState<string | null>(null);

  // daily question
  const [
    answerText,
    setAnswerText,
  ] = useState('');

  const [
    askingOwn,
    setAskingOwn,
  ] = useState(false);

  const [
    ownPrompt,
    setOwnPrompt,
  ] = useState('');

  // memory reminders
  const [
    scheduleOn,
    setScheduleOn,
  ] = useState(false);

  const [
    scheduleHour,
    setScheduleHour,
  ] = useState(4);

  const [
    scheduleAmPm,
    setScheduleAmPm,
  ] = useState<AmPm>('PM');

  const [
    scheduleDays,
    setScheduleDays,
  ] = useState<number[]>([1, 3, 5]);

  const [
    scheduleNote,
    setScheduleNote,
  ] = useState<string | null>(null);

  const listRef = useRef<FlatList<Message> | null>(null);

  const handleSend = async () => {
    const clean = validateMessage(text);

    if (!clean) {
      return;
    }

    Haptics.selectionAsync();
    setText('');

    await sendMessage(id, clean);

    listRef.current?.scrollToEnd({ animated: true });
  };

  const handleLoadOlder = async () => {
    if (loadingOlder) {
      return;
    }

    setLoadingOlder(true);

    try {
      await loadOlderMessages(id);
    } finally {
      setLoadingOlder(false);
    }
  };

  const showToolNote = (note: string) => {
    setToolNote(note);
    setTimeout(() => setToolNote(null), 2200);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const handleTool = async (key: ToolKey) => {
    Haptics.selectionAsync();

    if (key === 'camera') {
      router.push({
        pathname: '/memory/camera',
        params: {
          groupId: id,
        },
      });
      return;
    }

    if (key === 'photos') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled) {
        router.push({
          pathname: '/memory/post',
          params: {
            uri: result.assets[0].uri,
            groupId: id,
          },
        });
      }
      return;
    }

    if (key === 'poll') {
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollError(null);
      setPollOpen(true);
      return;
    }

    if (key === 'todo') {
      setTodoOpen(true);
      return;
    }

    if (key === 'split') {
      // you paid, split with everyone who joined
      setExpensePaidBy(user?.uid ?? null);
      setExpenseSplit(joined.map((member) => member.key));
      setExpenseNote(null);
      setSplitOpen(true);
      return;
    }

    if (key === 'widget') {
      router.push('/widget');
      return;
    }

    if (key === 'nudge') {
      // no nudging while off the grid
      if (user?.offGrid) {
        showToolNote('you are off the grid, nudges are paused');
        return;
      }

      await sendMessage(id, NUDGE_TEXT, { kind: 'nudge' });
      await notifyNow(group?.name ?? 'Clique', NUDGE_TEXT);
      showToolNote('nudge sent');
      return;
    }

    if (key === 'calendar') {
      router.replace({
        pathname: '/home',
        params: {
          tab: 'calendar',
        },
      });
      return;
    }

    showToolNote('facetime is coming soon');
  };

  const handleCreatePoll = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = await createPoll(id, pollQuestion, pollOptions);

    if (typeof result === 'string') {
      setPollError(result);
      return;
    }

    await sendMessage(id, result.question, {
      kind: 'poll',
      refId: result.id,
    });

    setPollOpen(false);
    listRef.current?.scrollToEnd({ animated: true });
  };

  const setPollOption = (index: number, value: string) => {
    setPollOptions((current) => current.map((option, at) => (at === index ? value : option)));
  };

  const addPollOption = () => {
    Haptics.selectionAsync();
    setPollOptions((current) => (current.length < MAX_OPTIONS ? [...current, ''] : current));
  };

  const handleVote = async (pollId: string, optionId: string) => {
    Haptics.selectionAsync();
    await vote(pollId, optionId);
  };

  const handleClosePoll = async (poll: Poll) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await closePoll(poll.id);
  };

  const handleAddTodo = async () => {
    if (!todoText.trim()) {
      return;
    }

    Haptics.selectionAsync();
    await addTodo(id, todoText, todoAssignee);
    setTodoText('');
  };

  const handleAddExpense = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const cents = parseAmount(expenseAmount);

    if (!expensePaidBy) {
      return;
    }

    if (!expenseTitle.trim()) {
      setExpenseNote('what was it for?');
      return;
    }

    if (cents === null) {
      setExpenseNote('amount like 12.50');
      return;
    }

    if (expenseSplit.length === 0) {
      setExpenseNote('pick who it was for');
      return;
    }

    await addExpense(id, expenseTitle, cents, expensePaidBy, expenseSplit);
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNote(null);
  };

  const toggleSplitMember = (uid: string) => {
    Haptics.selectionAsync();
    setExpenseSplit((current) =>
      current.includes(uid) ? current.filter((entry) => entry !== uid) : [...current, uid],
    );
  };

  const handleAnswer = async () => {
    // needs words or today's memory
    if (!answerText.trim() && !todaysMemory) {
      return;
    }

    Haptics.selectionAsync();
    await answerQuestion(id, today, answerText, todaysMemory?.uri ?? null);
    setAnswerText('');
  };

  const handleAskOwn = async () => {
    if (!ownPrompt.trim()) {
      return;
    }

    Haptics.selectionAsync();
    await askQuestion(id, today, ownPrompt);
    setOwnPrompt('');
    setAskingOwn(false);
  };

  const openSettings = () => {
    Haptics.selectionAsync();

    setGroupName(group?.name ?? '');
    setInviteNote(null);
    setScheduleNote(null);

    const saved = group?.schedule ?? null;

    setScheduleOn(Boolean(saved));
    setScheduleHour(saved ? (saved.hour % 12 === 0 ? 12 : saved.hour % 12) : 4);
    setScheduleAmPm(saved ? (saved.hour < 12 ? 'AM' : 'PM') : 'PM');
    setScheduleDays(saved ? saved.weekdays : [1, 3, 5]);
    setSettingsOpen(true);
  };

  const closeSettings = async () => {
    Haptics.selectionAsync();
    setSettingsOpen(false);

    const trimmed = groupName.trim();

    if (group && trimmed && trimmed !== group.name) {
      await renameGroup(id, trimmed);
    }
  };

  const toggleScheduleDay = (weekday: number) => {
    Haptics.selectionAsync();
    setScheduleDays((current) =>
      current.includes(weekday) ? current.filter((day) => day !== weekday) : [...current, weekday].sort((a, b) => a - b),
    );
  };

  const saveSchedule = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (scheduleOn && scheduleDays.length === 0) {
      setScheduleNote('pick at least one day');
      return;
    }

    const schedule: MemorySchedule | null = scheduleOn
      ? {
          hour: to24Hour(scheduleHour, scheduleAmPm),
          minute: 0,
          weekdays: scheduleDays,
        }
      : null;

    const granted = await setSchedule(id, schedule);

    setScheduleNote(
      !scheduleOn
        ? 'reminders off'
        : granted
          ? 'reminders set on this phone'
          : 'saved, but notifications are not allowed on this phone',
    );
  };

  const handlePhotoLongPress = (uri: string, senderName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert('This photo', undefined, [
      {
        text: 'Save to photos',
        onPress: async () => {
          const permission = await MediaLibrary.requestPermissionsAsync();

          if (!permission.granted) {
            showToolNote('photo library access was not allowed');
            return;
          }

          try {
            await MediaLibrary.saveToLibraryAsync(uri);
            showToolNote('saved to your photos');
          } catch {
            showToolNote('could not save that one');
          }
        },
      },
      {
        text: 'Report',
        style: 'destructive',
        onPress: async () => {
          await fileReport(senderName, `photo in ${group?.name ?? 'a group'}`);
          showToolNote('reported, thank you');
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const pickGroupPhoto = async () => {
    Haptics.selectionAsync();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      await setGroupImage(id, result.assets[0].uri);
    }
  };

  const handleInvite = async () => {
    if (!inviteName.trim()) {
      return;
    }

    Haptics.selectionAsync();

    const name = normalizeUsername(inviteName);
    const result = await inviteMember(id, inviteName);

    setInviteNote(
      result === 'added'
        ? `@${name} is in`
        : result === 'invited'
          ? `@${name} is invited, they join when they sign up`
          : `@${name} is already here`,
    );

    setInviteName('');
  };

  const handleLeave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert('Leave this group?', 'You will stop seeing its messages.', [
      {
        text: 'Stay',
        style: 'cancel',
      },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setSettingsOpen(false);
          await leaveGroup(id);
          router.back();
        },
      },
    ]);
  };

  const openProfilePeek = (username: string) => {
    Haptics.selectionAsync();
    setProfileModalUser(username);
  };

  const closeProfilePeek = () => {
    Haptics.selectionAsync();
    setProfileModalUser(null);
  };

  const toggleMagic = () => {
    Haptics.selectionAsync();
    setMagicOpen((open) => !open);
  };

  const peekMember = members.find((member) => member.username === profileModalUser) ?? null;

  const peekIsMe =
    profileModalUser !== null &&
    normalizeUsername(profileModalUser) === normalizeUsername(user?.username ?? '');

  const peekBlocked =
    profileModalUser !== null &&
    (user?.blocked ?? []).includes(normalizeUsername(profileModalUser));

  const toggleBlock = async () => {
    if (!profileModalUser) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (peekBlocked) {
      await unblockUser(profileModalUser);
    } else {
      await blockUser(profileModalUser);
    }

    setProfileModalUser(null);
  };

  const nameFor = (uid: string) => (uid === user?.uid ? 'you' : (group?.profiles[uid]?.username ?? 'someone'));

  const renderPollCard = (poll: Poll) => {
    const mine = user ? votedOption(poll, user.uid) : null;
    const counts = tally(poll);

    return (
      <View style={styles.pollCard}>
        <Text style={styles.pollQuestion}>
          {poll.question}
        </Text>

        {poll.options.map((option, index) => {
          const row = counts.rows[index];

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.pollOption,
                mine === option.id && styles.pollOptionMine,
              ]}
              onPress={() => handleVote(poll.id, option.id)}
              disabled={poll.closed}
            >
              <View
                style={[
                  styles.pollBar,
                  { width: `${row.percent}%` },
                ]}
              />

              <Text style={styles.pollOptionText}>
                {option.text}
              </Text>

              <Text style={styles.pollCount}>
                {row.count}
              </Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.pollFooter}>
          <Text style={styles.pollMeta}>
            {counts.total} {counts.total === 1 ? 'vote' : 'votes'}
            {poll.closed ? ' · closed' : ''}
          </Text>

          {!poll.closed && poll.createdBy === user?.uid && (
            <TouchableOpacity onPress={() => handleClosePoll(poll)}>
              <Text style={styles.pollClose}>
                close poll
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderQuestion = () => {
    const answered = user ? question.answers[user.uid] : undefined;
    const answerList = Object.entries(question.answers);

    return (
      <View style={styles.questionCard}>
        <Text style={styles.questionLabel}>
          today&apos;s question
        </Text>

        <Text style={styles.questionPrompt}>
          {question.prompt}
        </Text>

        {question.askedBy && (
          <Text style={styles.questionBy}>
            asked by {nameFor(question.askedBy)}
          </Text>
        )}

        {answerList.map(([uid, answer]) => (
          <View
            key={uid}
            style={styles.answerRow}
          >
            {answer.memoryUri && (
              <Image
                source={{ uri: answer.memoryUri }}
                style={styles.answerImage}
              />
            )}

            <Text style={styles.answerText}>
              <Text style={styles.answerName}>
                {nameFor(uid)}:{' '}
              </Text>
              {answer.text || 'shared a memory'}
            </Text>
          </View>
        ))}

        {!answered && (
          <View style={styles.answerInputRow}>
            <TextInput
              style={styles.answerInput}
              value={answerText}
              onChangeText={setAnswerText}
              placeholder="your answer"
              placeholderTextColor="#999"
              onSubmitEditing={handleAnswer}
              returnKeyType="send"
            />

            <TouchableOpacity onPress={handleAnswer}>
              <Ionicons
                name="arrow-up-circle"
                size={30}
                color="#b7931d"
              />
            </TouchableOpacity>
          </View>
        )}

        {askingOwn ? (
          <View style={styles.answerInputRow}>
            <TextInput
              style={styles.answerInput}
              value={ownPrompt}
              onChangeText={setOwnPrompt}
              placeholder="ask the group something"
              placeholderTextColor="#999"
              onSubmitEditing={handleAskOwn}
              returnKeyType="done"
              autoFocus
            />

            <TouchableOpacity onPress={handleAskOwn}>
              <Ionicons
                name="arrow-up-circle"
                size={30}
                color="#b7931d"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setAskingOwn(true);
            }}
          >
            <Text style={styles.askOwn}>
              ask your own instead
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!group) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>
          this group is not here yet
        </Text>

        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.missingBack}>
            ← back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupImage = group.imageUri ? { uri: group.imageUri } : groupChatPhotoImg;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* chat header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.headerIcon}>
            ←
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openSettings}
          style={styles.headerTitleWrap}
        >
          <Image
            source={groupImage}
            style={styles.groupAvatar}
          />

          <View style={styles.headerText}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              {group.name}
            </Text>

            <Text style={styles.headerSub}>
              {joined.length} {joined.length === 1 ? 'person' : 'people'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openSettings}
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

      {/* messages, today's question on top */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatArea}
        refreshing={loadingOlder}
        onRefresh={handleLoadOlder}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={renderQuestion()}
        ListEmptyComponent={
          <Text style={styles.emptyChat}>
            say hi, nobody has yet
          </Text>
        }
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.uid;
          const avatarUri = group.profiles[item.senderId]?.avatarUri ?? null;
          const imageUri = item.imageUri;

          // nudges sit in the middle, no bubble
          if (item.kind === 'nudge' || item.kind === 'system') {
            return (
              <View style={styles.systemWrap}>
                <Text style={styles.systemText}>
                  {isMe ? 'you' : item.senderName}: {item.text}
                </Text>
              </View>
            );
          }

          const poll = item.kind === 'poll' ? polls.find((candidate) => candidate.id === item.refId) : null;

          return (
            <View
              style={[
                styles.messageWrap,
                isMe ? styles.alignEnd : styles.alignStart,
              ]}
            >
              {!isMe && (
                <TouchableOpacity onPress={() => openProfilePeek(item.senderName)}>
                  <Image
                    source={avatarUri ? { uri: avatarUri } : defaultAvatar}
                    style={styles.msgAvatar}
                  />
                </TouchableOpacity>
              )}

              <View
                style={[
                  styles.msgBubble,
                  isMe ? styles.myBubble : styles.theirBubble,
                  poll && styles.pollBubble,
                ]}
              >
                {!isMe && (
                  <Text style={styles.msgSender}>
                    {item.senderName}
                  </Text>
                )}

                {imageUri && (
                  <TouchableOpacity
                    onLongPress={() => handlePhotoLongPress(imageUri, item.senderName)}
                    delayLongPress={400}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.msgImage}
                    />
                  </TouchableOpacity>
                )}

                {poll ? (
                  renderPollCard(poll)
                ) : (
                  item.text.length > 0 && (
                    <Text
                      style={[
                        styles.messageText,
                        { fontSize: scaled(15, simple) },
                      ]}
                    >
                      {item.text}
                    </Text>
                  )
                )}

                <Text style={styles.msgMeta}>
                  {dayjs(item.createdAt).format('h:mm A')}
                </Text>
              </View>

            </View>
          );
        }}
      />

      {/* tools bar */}
      {magicOpen && (
        <View style={styles.magicBar}>
          <View style={styles.magicRow}>
            {MAGIC_TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.key}
                style={styles.toolButton}
                onPress={() => handleTool(tool.key)}
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
        </View>
      )}

      {toolNote && (
        <Text style={styles.toolNote}>
          {toolNote}
        </Text>
      )}

      {/* message input bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.starButton}
          onPress={toggleMagic}
        >
          <Ionicons
            name="color-palette-sharp"
            size={22}
            color="#b7931d"
          />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            { fontSize: scaled(22, simple) },
          ]}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        <TouchableOpacity onPress={handleSend}>
          <Ionicons
            name="arrow-up-circle"
            size={36}
            color="#b7931d"
          />
        </TouchableOpacity>
      </View>

      {/* new poll modal */}
      <Modal
        transparent
        visible={pollOpen}
        animationType="slide"
        onRequestClose={() => setPollOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalHeader}>
                New poll
              </Text>

              <TextInput
                style={styles.modalInput}
                value={pollQuestion}
                onChangeText={setPollQuestion}
                placeholder="What are we deciding?"
                placeholderTextColor="#999"
                autoFocus
              />

              {pollOptions.map((option, index) => (
                <TextInput
                  key={index}
                  style={styles.modalInput}
                  value={option}
                  onChangeText={(value) => setPollOption(index, value)}
                  placeholder={`option ${index + 1}`}
                  placeholderTextColor="#999"
                />
              ))}

              {pollOptions.length < MAX_OPTIONS && (
                <TouchableOpacity onPress={addPollOption}>
                  <Text style={styles.modalLink}>
                    + another option
                  </Text>
                </TouchableOpacity>
              )}

              {pollError && (
                <Text style={styles.modalError}>
                  {pollError}
                </Text>
              )}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCreatePoll}
              >
                <Text style={styles.modalButtonText}>
                  Post poll
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setPollOpen(false);
                }}
              >
                <Text style={styles.closeButton}>
                  cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* to-do list modal */}
      <Modal
        transparent
        visible={todoOpen}
        animationType="slide"
        onRequestClose={() => setTodoOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalHeader}>
                {group.name} to-do
              </Text>

              {todos.length === 0 && (
                <Text style={styles.emptySection}>
                  nothing on the list yet
                </Text>
              )}

              {todos.map((todo) => (
                <View
                  key={todo.id}
                  style={styles.todoRow}
                >
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      toggleTodo(todo.id);
                    }}
                    style={styles.todoCheck}
                  >
                    <Ionicons
                      name={todo.done ? 'checkbox' : 'square-outline'}
                      size={22}
                      color="#b7931d"
                    />
                  </TouchableOpacity>

                  <View style={styles.todoText}>
                    <Text
                      style={[
                        styles.todoLabel,
                        todo.done && styles.todoDone,
                      ]}
                    >
                      {todo.text}
                    </Text>

                    {todo.assignedTo && (
                      <Text style={styles.todoAssignee}>
                        {nameFor(todo.assignedTo)}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      removeTodo(todo.id);
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color="#8a7a55"
                    />
                  </TouchableOpacity>
                </View>
              ))}

              <TextInput
                style={styles.modalInput}
                value={todoText}
                onChangeText={setTodoText}
                placeholder="add something"
                placeholderTextColor="#999"
                onSubmitEditing={handleAddTodo}
                returnKeyType="done"
              />

              {/* who it's for */}
              <View style={styles.assignRow}>
                <TouchableOpacity
                  style={[
                    styles.assignChip,
                    todoAssignee === null && styles.assignChipActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setTodoAssignee(null);
                  }}
                >
                  <Text style={styles.assignText}>
                    anyone
                  </Text>
                </TouchableOpacity>

                {joined.map((member) => (
                  <TouchableOpacity
                    key={member.key}
                    style={[
                      styles.assignChip,
                      todoAssignee === member.key && styles.assignChipActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setTodoAssignee(member.key);
                    }}
                  >
                    <Text style={styles.assignText}>
                      {member.isYou ? 'me' : member.username}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddTodo}
              >
                <Text style={styles.modalButtonText}>
                  Add
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setTodoOpen(false);
                }}
              >
                <Text style={styles.closeButton}>
                  close
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* split the bill modal */}
      <Modal
        transparent
        visible={splitOpen}
        animationType="slide"
        onRequestClose={() => setSplitOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalHeader}>
                Split with {group.name}
              </Text>

              {/* who owes who */}
              {expenses.length > 0 && (
                <>
                  {Object.entries(owed).map(([uid, cents]) => (
                    <Text
                      key={uid}
                      style={styles.eventRow}
                    >
                      {nameFor(uid)}: {cents === 0 ? 'all square' : cents > 0 ? `is owed ${formatAmount(cents)}` : `owes ${formatAmount(-cents)}`}
                    </Text>
                  ))}

                  {settleUp(owed).map((transfer) => (
                    <Text
                      key={`${transfer.from}-${transfer.to}`}
                      style={styles.settleRow}
                    >
                      → {nameFor(transfer.from)} pays {nameFor(transfer.to)} {formatAmount(transfer.cents)}
                    </Text>
                  ))}
                </>
              )}

              <Text style={styles.sectionLabel}>
                Expenses
              </Text>

              {expenses.length === 0 && (
                <Text style={styles.emptySection}>
                  nothing yet
                </Text>
              )}

              {expenses.map((expense) => (
                <View
                  key={expense.id}
                  style={styles.todoRow}
                >
                  <View style={styles.todoText}>
                    <Text style={styles.todoLabel}>
                      {expense.title} · {formatAmount(expense.amountCents)}
                    </Text>

                    <Text style={styles.todoAssignee}>
                      {nameFor(expense.paidBy)} paid, split {expense.splitAmong.length} ways
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      removeExpense(expense.id);
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color="#8a7a55"
                    />
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.sectionLabel}>
                Add one
              </Text>

              <TextInput
                style={styles.modalInput}
                value={expenseTitle}
                onChangeText={setExpenseTitle}
                placeholder="what was it for"
                placeholderTextColor="#999"
              />

              <TextInput
                style={styles.modalInput}
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                placeholder="amount, like 12.50"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />

              <Text style={styles.emptySection}>
                paid by
              </Text>

              <View style={styles.assignRow}>
                {joined.map((member) => (
                  <TouchableOpacity
                    key={member.key}
                    style={[
                      styles.assignChip,
                      expensePaidBy === member.key && styles.assignChipActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setExpensePaidBy(member.key);
                    }}
                  >
                    <Text style={styles.assignText}>
                      {member.isYou ? 'me' : member.username}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.emptySection}>
                split among
              </Text>

              <View style={styles.assignRow}>
                {joined.map((member) => (
                  <TouchableOpacity
                    key={member.key}
                    style={[
                      styles.assignChip,
                      expenseSplit.includes(member.key) && styles.assignChipActive,
                    ]}
                    onPress={() => toggleSplitMember(member.key)}
                  >
                    <Text style={styles.assignText}>
                      {member.isYou ? 'me' : member.username}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {expenseNote && (
                <Text style={styles.modalError}>
                  {expenseNote}
                </Text>
              )}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddExpense}
              >
                <Text style={styles.modalButtonText}>
                  Add expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setSplitOpen(false);
                }}
              >
                <Text style={styles.closeButton}>
                  close
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* group settings modal */}
      <Modal
        transparent
        visible={settingsOpen}
        animationType="slide"
        onRequestClose={closeSettings}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity onPress={pickGroupPhoto}>
                <Image
                  source={groupImage}
                  style={styles.modalBanner}
                />

                <Text style={styles.bannerHint}>
                  tap to change photo
                </Text>
              </TouchableOpacity>

              <TextInput
                style={styles.modalTitle}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Group name"
                placeholderTextColor="#999"
              />

              {/* members and invites */}
              <Text style={styles.sectionLabel}>
                People
              </Text>

              {members.map((member) => (
                <TouchableOpacity
                  key={member.key}
                  style={styles.memberRow}
                  onPress={() => {
                    closeSettings();

                    setTimeout(() => {
                      setProfileModalUser(member.username);
                    }, 250);
                  }}
                >
                  <Image
                    source={member.avatarUri ? { uri: member.avatarUri } : defaultAvatar}
                    style={styles.memberAvatar}
                  />

                  <Text style={styles.memberName}>
                    @{member.username}
                    {member.isYou ? ' (you)' : ''}
                  </Text>

                  {member.invited && (
                    <Text style={styles.memberTag}>
                      invited
                    </Text>
                  )}
                </TouchableOpacity>
              ))}

              <View style={styles.inviteRow}>
                <TextInput
                  style={styles.inviteInput}
                  value={inviteName}
                  onChangeText={setInviteName}
                  placeholder="add by @username"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  onSubmitEditing={handleInvite}
                  returnKeyType="done"
                />

                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={handleInvite}
                >
                  <Text style={styles.inviteButtonText}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>

              {inviteNote && (
                <Text style={styles.inviteNote}>
                  {inviteNote}
                </Text>
              )}

              {/* memory reminders */}
              <View style={styles.scheduleHeader}>
                <Text style={styles.sectionLabel}>
                  Memory reminders
                </Text>

                <Switch
                  value={scheduleOn}
                  onValueChange={(value) => {
                    Haptics.selectionAsync();
                    setScheduleOn(value);
                  }}
                />
              </View>

              {scheduleOn && (
                <>
                  <View style={styles.scheduleRow}>
                    <Picker
                      style={styles.schedulePicker}
                      selectedValue={scheduleHour}
                      onValueChange={(value) => setScheduleHour(value)}
                    >
                      {HOUR_OPTIONS.map((hour) => (
                        <Picker.Item
                          key={hour}
                          label={`${hour}:00`}
                          value={hour}
                        />
                      ))}
                    </Picker>

                    <Picker
                      style={styles.schedulePickerSmall}
                      selectedValue={scheduleAmPm}
                      onValueChange={(value) => setScheduleAmPm(value)}
                    >
                      <Picker.Item
                        label="AM"
                        value="AM"
                      />

                      <Picker.Item
                        label="PM"
                        value="PM"
                      />
                    </Picker>
                  </View>

                  <View style={styles.dayRow}>
                    {WEEKDAY_LABELS.map((label, weekday) => (
                      <TouchableOpacity
                        key={weekday}
                        style={[
                          styles.dayChip,
                          scheduleDays.includes(weekday) && styles.dayChipActive,
                        ]}
                        onPress={() => toggleScheduleDay(weekday)}
                      >
                        <Text style={styles.dayChipText}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.inviteButton}
                onPress={saveSchedule}
              >
                <Text style={styles.inviteButtonText}>
                  {scheduleOn ? 'Save reminders' : 'Save'}
                </Text>
              </TouchableOpacity>

              {scheduleNote && (
                <Text style={styles.inviteNote}>
                  {scheduleNote}
                </Text>
              )}

              {/* upcoming events for this group */}
              <Text style={styles.sectionLabel}>
                Coming up
              </Text>

              {nextEvents.length === 0 && (
                <Text style={styles.emptySection}>
                  nothing planned, add one from the calendar
                </Text>
              )}

              {nextEvents.map((event) => (
                <Text
                  key={event.id}
                  style={styles.eventRow}
                >
                  {dayjs(event.date).format('MMM D')} {formatTime12(event.time)} · {event.title}
                </Text>
              ))}

              {/* memories posted to this group */}
              <Text style={styles.sectionLabel}>
                Memories
              </Text>

              {groupMemories.length === 0 && (
                <Text style={styles.emptySection}>
                  none yet, use the camera in the tools bar
                </Text>
              )}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.memoryStrip}
              >
                {groupMemories.map((memory) => (
                  <View
                    key={memory.id}
                    style={styles.memoryBox}
                  >
                    <Image
                      source={{ uri: memory.uri }}
                      style={styles.memoryPreview}
                    />

                    {memory.caption.length > 0 && (
                      <Text
                        style={styles.memoryCaption}
                        numberOfLines={1}
                      >
                        {memory.caption}
                      </Text>
                    )}
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity onPress={handleLeave}>
                <Text style={styles.leaveButton}>
                  Leave group
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={closeSettings}>
                <Text style={styles.closeButton}>
                  close
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* profile peek modal */}
      <Modal
        transparent
        visible={!!profileModalUser}
        animationType="fade"
        onRequestClose={closeProfilePeek}
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
              source={
                peekIsMe && user?.avatarUri
                  ? { uri: user.avatarUri }
                  : peekMember?.avatarUri
                    ? { uri: peekMember.avatarUri }
                    : defaultAvatar
              }
              style={styles.modalBanner}
            />

            <Text style={styles.peekName}>
              @{profileModalUser}
            </Text>

            <Text style={styles.profilePeekText}>
              {peekIsMe ? 'this is you' : `in ${group.name} with you`}
            </Text>

            {!peekIsMe && (
              <TouchableOpacity onPress={toggleBlock}>
                <Text style={styles.blockButton}>
                  {peekBlocked ? 'Unblock' : 'Block'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={closeProfilePeek}>
              <Text style={styles.closeButton}>
                close
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// group chat room styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
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
    color: '#644400',
    marginBottom: 12,
  },

  missingBack: {
    fontFamily: 'Gaegu-Light',
    fontSize: 20,
    color: '#b7931d',
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
  },

  headerText: {
    flex: 1,
  },

  groupAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Gaegu-Regular',
    color: '#644400',
    lineHeight: 34,
  },

  headerSub: {
    fontSize: 14,
    fontFamily: 'Gaegu-Light',
    color: '#785c10',
  },

  headerIcon: {
    fontSize: 30,
    color: '#785c10',
  },

  chatArea: {
    paddingHorizontal: 12,
    paddingBottom: 60,
    flexGrow: 1,
  },

  emptyChat: {
    marginTop: 40,
    textAlign: 'center',
    fontFamily: 'Gaegu-Light',
    fontSize: 18,
    color: '#785c10',
  },

  questionCard: {
    backgroundColor: '#fff8e8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#efd575',
  },

  questionLabel: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 13,
    color: '#b7931d',
    textTransform: 'lowercase',
  },

  questionPrompt: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 20,
    color: '#644400',
    marginTop: 2,
  },

  questionBy: {
    fontFamily: 'Gaegu-Light',
    fontSize: 13,
    color: '#8a7a55',
  },

  answerRow: {
    marginTop: 8,
  },

  answerImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 4,
  },

  answerText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    color: '#644400',
  },

  answerName: {
    fontFamily: 'Gaegu-Bold',
  },

  answerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },

  answerInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
  },

  answerSend: {
    fontSize: 20,
    color: '#b7931d',
  },

  askOwn: {
    marginTop: 8,
    fontFamily: 'Gaegu-Light',
    fontSize: 14,
    color: '#b7931d',
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

  systemWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },

  systemText: {
    fontFamily: 'Gaegu-Light',
    fontSize: 15,
    color: '#785c10',
    backgroundColor: '#fff8e8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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

  pollBubble: {
    maxWidth: '85%',
    minWidth: '70%',
  },

  myBubble: {
    backgroundColor: '#e0c465',
  },

  theirBubble: {
    backgroundColor: '#fffef2',
  },

  msgSender: {
    fontFamily: 'Figtree-SemiBold',
    marginBottom: 6,
    color: '#644400',
  },

  msgImage: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 8,
    marginBottom: 6,
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

  pollCard: {
    marginBottom: 4,
  },

  pollQuestion: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 18,
    color: '#644400',
    marginBottom: 6,
  },

  pollOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },

  pollOptionMine: {
    borderWidth: 2,
    borderColor: '#b7931d',
  },

  pollBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(183,147,29,0.25)',
  },

  pollOptionText: {
    flex: 1,
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    color: '#644400',
  },

  pollCount: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 14,
    color: '#785c10',
  },

  pollFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  pollMeta: {
    fontFamily: 'Gaegu-Light',
    fontSize: 13,
    color: '#785c10',
  },

  pollClose: {
    fontFamily: 'Gaegu-Light',
    fontSize: 13,
    color: '#a83232',
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

  magicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },

  toolButton: {
    alignItems: 'center',
    marginVertical: 6,
    width: '23%',
  },

  toolLabel: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 12,
    color: '#644400',
    marginTop: 2,
    textAlign: 'center',
  },

  toolNote: {
    textAlign: 'center',
    fontFamily: 'Gaegu-Light',
    fontSize: 15,
    color: '#785c10',
    marginTop: 4,
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
    borderRadius: 16,
    maxHeight: '90%',
  },

  modalScroll: {
    padding: 20,
    alignItems: 'center',
  },

  modalHeader: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 22,
    color: '#644400',
    marginBottom: 12,
  },

  modalInput: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    marginBottom: 8,
  },

  modalLink: {
    fontFamily: 'Gaegu-Light',
    fontSize: 15,
    color: '#b7931d',
    marginBottom: 8,
  },

  modalError: {
    fontFamily: 'Gaegu-Regular',
    color: '#a83232',
    marginBottom: 8,
  },

  modalButton: {
    backgroundColor: '#b7931d',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 8,
  },

  modalButtonText: {
    color: '#fff',
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
  },

  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 6,
  },

  todoCheck: {
    marginRight: 10,
  },

  todoText: {
    flex: 1,
  },

  todoLabel: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 17,
    color: '#644400',
  },

  todoDone: {
    textDecorationLine: 'line-through',
    color: '#8a7a55',
  },

  todoAssignee: {
    fontFamily: 'Gaegu-Light',
    fontSize: 13,
    color: '#8a7a55',
  },

  assignRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'stretch',
    gap: 6,
    marginBottom: 4,
  },

  assignChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8dab9',
    backgroundColor: '#fff',
  },

  assignChipActive: {
    borderColor: '#b7931d',
  },

  assignText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 14,
    color: '#644400',
  },

  profilePeekContent: {
    alignItems: 'center',
    padding: 20,
  },

  modalBanner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 4,
    alignSelf: 'center',
  },

  bannerHint: {
    fontFamily: 'Gaegu-Light',
    fontSize: 12,
    color: '#8a7a55',
    textAlign: 'center',
    marginBottom: 6,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Gaegu-Regular',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    width: '100%',
    paddingVertical: 4,
  },

  peekName: {
    fontSize: 24,
    fontFamily: 'Gaegu-Bold',
    color: '#644400',
  },

  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 18,
    fontFamily: 'Gaegu-Bold',
    color: '#644400',
    marginTop: 18,
    marginBottom: 6,
  },

  emptySection: {
    alignSelf: 'flex-start',
    fontFamily: 'Gaegu-Light',
    fontSize: 15,
    color: '#785c10',
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 6,
  },

  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },

  memberName: {
    flex: 1,
    fontFamily: 'Gaegu-Regular',
    fontSize: 18,
    color: '#644400',
  },

  memberTag: {
    fontFamily: 'Gaegu-Light',
    fontSize: 14,
    color: '#785c10',
  },

  inviteRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: 8,
    gap: 8,
  },

  inviteInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
  },

  inviteButton: {
    backgroundColor: '#b7931d',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },

  inviteButtonText: {
    color: '#fff',
    fontFamily: 'Gaegu-Bold',
  },

  inviteNote: {
    alignSelf: 'flex-start',
    marginTop: 6,
    fontFamily: 'Gaegu-Light',
    fontSize: 15,
    color: '#785c10',
  },

  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },

  scheduleRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
  },

  schedulePicker: {
    flex: 1,
    height: 40,
  },

  schedulePickerSmall: {
    width: 100,
    height: 40,
  },

  dayRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },

  dayChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8dab9',
  },

  dayChipActive: {
    backgroundColor: '#b7931d',
    borderColor: '#b7931d',
  },

  dayChipText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 14,
    color: '#644400',
  },

  eventRow: {
    alignSelf: 'flex-start',
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    color: '#644400',
    marginBottom: 2,
  },

  settleRow: {
    alignSelf: 'flex-start',
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
    color: '#b7931d',
    marginTop: 2,
  },

  memoryStrip: {
    alignSelf: 'stretch',
  },

  memoryBox: {
    marginRight: 12,
    width: 120,
  },

  memoryPreview: {
    width: 120,
    height: 90,
    borderRadius: 12,
  },

  memoryCaption: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Gaegu-Regular',
  },

  profilePeekText: {
    marginTop: 8,
    color: '#666',
    fontFamily: 'Gaegu-Regular',
  },

  blockButton: {
    marginTop: 14,
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
    color: '#a83232',
  },

  leaveButton: {
    marginTop: 22,
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
    color: '#a83232',
  },

  closeButton: {
    fontSize: 16,
    color: '#b7931d',
    marginTop: 16,
    fontFamily: 'Gaegu-Regular',
  },
});

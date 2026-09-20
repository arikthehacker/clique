/**
 * ==============================
 * FILE: app/calendar/index.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The Calendar tab. Shows your events and your groups' events, and helps a
 * group find a time that works for everyone.
 *
 * Includes:
 * - Month, week and day views
 * - Calendar chips to show or hide each calendar
 * - Busy time synced from the phone's calendar
 * - Day list, tap a group event to RSVP, hold to delete
 * - Add-event modal with templates and a reminder switch
 * - Find a time for a group
 *
 * Notes:
 * - Find a time is a Pro feature once the trial ends.
 * - Busy blocks stay on this phone; only shared slots leave it.
 */

import {
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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
import { useRouter } from 'expo-router';

import { useAuth } from '../../src/context/AuthContext';
import { useCalendar } from '../../src/context/CalendarContext';
import { useGroups } from '../../src/context/GroupContext';
import { usePlanning } from '../../src/context/PlanningContext';
import {
  freeWindows,
  subtractBusy,
  toClock,
  Window,
} from '../../src/lib/availability';
import {
  AmPm,
  buildEventDateTime,
  DATE_FORMAT,
  formatTime12,
  monthGrid,
  weekDays,
} from '../../src/lib/calendar';
import {
  effectivePlan,
  hasSharedCalendar,
} from '../../src/lib/plans';
import {
  EVENT_TEMPLATES,
  EventTemplate,
  templateById,
} from '../../src/lib/templates';
import {
  AvailabilitySlot,
  CalendarEvent,
  RsvpStatus,
} from '../../src/types';

const WEEK_DAYS = [
  'S',
  'M',
  'Tu',
  'W',
  'Th',
  'F',
  'Sa',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => index + 1);
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, index) => index * 5);
const SLOT_HOURS = Array.from({ length: 24 }, (_, index) => index);

const JUST_ME = '';
const MIN_WINDOW_MINUTES = 60;

type ViewMode = 'month' | 'week' | 'day';

const VIEW_MODES: ViewMode[] = [
  'month',
  'week',
  'day',
];

const RSVP_OPTIONS: { status: RsvpStatus; label: string }[] = [
  {
    status: 'going',
    label: 'going',
  },
  {
    status: 'maybe',
    label: 'maybe',
  },
  {
    status: 'no',
    label: "can't",
  },
];

function hourLabel(hour: number): string {
  return formatTime12(toClock(hour * 60));
}

export default function MasterCalendar() {
  const router = useRouter();
  const { user } = useAuth();

  const sharedAllowed = user ? hasSharedCalendar(effectivePlan(user.plan, user.trialStartedAt)) : false;

  const {
    events,
    loading,
    error,
    addEvent,
    deleteEvent,
    rsvp,
    busyBlocks,
    syncDeviceCalendar,
    availabilityFor,
    setMyAvailability,
  } = useCalendar();

  const { groups } = useGroups();
  const { addTodo } = usePlanning();

  const today = dayjs();

  const [
    currentMonth,
    setCurrentMonth,
  ] = useState(today);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(today);

  const [
    viewMode,
    setViewMode,
  ] = useState<ViewMode>('month');

  // calendars switched off with the chips
  const [
    hidden,
    setHidden,
  ] = useState<Set<string>>(new Set());

  const [
    showBusy,
    setShowBusy,
  ] = useState(true);

  const [
    busyNote,
    setBusyNote,
  ] = useState<string | null>(null);

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  // new event form state
  const [
    newMonth,
    setNewMonth,
  ] = useState(currentMonth.month());

  const [
    newDay,
    setNewDay,
  ] = useState(today.date());

  const [
    newHour,
    setNewHour,
  ] = useState(today.hour() % 12 || 12);

  const [
    newMinute,
    setNewMinute,
  ] = useState(0);

  const [
    newAmPm,
    setNewAmPm,
  ] = useState<AmPm>(today.hour() < 12 ? 'AM' : 'PM');

  const [
    newTitle,
    setNewTitle,
  ] = useState('');

  const [
    newGroupId,
    setNewGroupId,
  ] = useState<string>(JUST_ME);

  const [
    newTemplate,
    setNewTemplate,
  ] = useState<string | null>(null);

  const [
    reminder,
    setReminder,
  ] = useState(false);

  // rsvp sheet
  const [
    rsvpEvent,
    setRsvpEvent,
  ] = useState<CalendarEvent | null>(null);

  // find a time
  const [
    findOpen,
    setFindOpen,
  ] = useState(false);

  const [
    findGroupId,
    setFindGroupId,
  ] = useState<string | null>(null);

  const [
    slotStart,
    setSlotStart,
  ] = useState(9);

  const [
    slotEnd,
    setSlotEnd,
  ] = useState(17);

  const [
    findNote,
    setFindNote,
  ] = useState<string | null>(null);

  // the month grid, with blanks before the 1st
  const cells = useMemo(() => monthGrid(currentMonth), [currentMonth]);

  // the week the selected day sits in
  const week = useMemo(() => weekDays(selectedDate), [selectedDate]);

  // events from calendars that are switched on
  const shownEvents = useMemo(
    () => events.filter((event) => !hidden.has(event.groupId ?? JUST_ME)),
    [
      events,
      hidden,
    ],
  );

  // tracks which dates should show an event dot
  const daysWithEvents = useMemo(
    () =>
      shownEvents.reduce<Record<string, boolean>>((acc, event) => {
        acc[event.date] = true;
        return acc;
      }, {}),
    [shownEvents],
  );

  const eventsOn = (date: dayjs.Dayjs) =>
    shownEvents.filter((event) => event.date === date.format(DATE_FORMAT));

  const busyOn = (date: dayjs.Dayjs) =>
    showBusy ? busyBlocks.filter((block) => block.date === date.format(DATE_FORMAT)) : [];

  const selectedEvents = eventsOn(selectedDate);
  const selectedBusy = busyOn(selectedDate);

  const groupName = (groupId: string | null) =>
    groupId ? (groups.find((group) => group.id === groupId)?.name ?? 'a group') : null;

  // keeps the header month on the selected day
  const showDate = (date: dayjs.Dayjs) => {
    setSelectedDate(date);
    setCurrentMonth(date);
  };

  // arrows step a month, a week or a day, whichever view is on
  const step = (direction: number) => {
    Haptics.selectionAsync();

    if (viewMode === 'month') {
      setCurrentMonth(currentMonth.add(direction, 'month'));
      return;
    }

    showDate(selectedDate.add(direction, viewMode));
  };

  const pickDate = (date: dayjs.Dayjs) => {
    Haptics.selectionAsync();
    showDate(date);
  };

  const pickMode = (mode: ViewMode) => {
    Haptics.selectionAsync();
    setViewMode(mode);

    if (mode !== 'month') {
      setCurrentMonth(selectedDate);
    }
  };

  const toggleCalendar = (key: string) => {
    Haptics.selectionAsync();

    setHidden((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const syncBusy = async () => {
    Haptics.selectionAsync();

    const from = currentMonth.startOf('month').subtract(7, 'day').toDate();
    const to = currentMonth.endOf('month').add(7, 'day').toDate();

    try {
      const result = await syncDeviceCalendar(from, to);

      setBusyNote(
        !result.granted
          ? 'calendar access was not allowed'
          : result.calendars === 0
            ? 'no calendars on this phone'
            : `${result.blocks.length} busy ${result.blocks.length === 1 ? 'block' : 'blocks'} synced, names stay on your phone`,
      );
    } catch {
      setBusyNote('could not read your calendar');
    }
  };

  // the form starts on the selected day
  const openModal = () => {
    Haptics.selectionAsync();
    setNewMonth(selectedDate.month());
    setNewDay(selectedDate.date());
    setModalVisible(true);
  };

  const closeModal = () => {
    Haptics.selectionAsync();
    setModalVisible(false);
  };

  const pickTemplate = (template: EventTemplate) => {
    Haptics.selectionAsync();

    // a second tap on the same template clears it
    if (newTemplate === template.id) {
      setNewTemplate(null);
      setNewTitle('');
      return;
    }

    setNewTemplate(template.id);
    setNewTitle(template.title);
  };

  const saveEvent = async () => {
    const title = newTitle.trim();

    // an event needs a name to show up in the list
    if (!title) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);

    const when = buildEventDateTime(
      selectedDate.year(),
      newMonth,
      newDay,
      newHour,
      newMinute,
      newAmPm,
    );

    const groupId = newGroupId === JUST_ME ? null : newGroupId;

    try {
      await addEvent({
        groupId: groupId,
        title: title,
        date: when.date,
        time: when.time,
        reminder: reminder,
        color: null,
      });

      // a template's checklist lands in the group's to-do list
      const template = newTemplate ? templateById(newTemplate) : null;

      if (template && groupId) {
        for (const item of template.todos) {
          await addTodo(groupId, item, null);
        }
      }

      setNewTitle('');
      setNewTemplate(null);
      setReminder(false);
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (event: CalendarEvent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert('Delete this event?', event.title, [
      {
        text: 'Keep',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteEvent(event.id),
      },
    ]);
  };

  const openRsvp = (event: CalendarEvent) => {
    // rsvps only make sense on a group event
    if (!event.groupId) {
      return;
    }

    Haptics.selectionAsync();
    setRsvpEvent(event);
  };

  const answerRsvp = async (status: RsvpStatus) => {
    if (!rsvpEvent) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await rsvp(rsvpEvent.id, status);
    setRsvpEvent(null);
  };

  const rsvpSummary = (event: CalendarEvent) => {
    const values = Object.values(event.rsvps);

    if (values.length === 0) {
      return '';
    }

    const going = values.filter((status) => status === 'going').length;
    const maybe = values.filter((status) => status === 'maybe').length;

    return ` · ${going} going${maybe ? `, ${maybe} maybe` : ''}`;
  };

  const openFind = () => {
    Haptics.selectionAsync();

    // free plan goes to the upgrade screen
    if (!sharedAllowed) {
      router.push('/plan');
      return;
    }

    setFindGroupId(groups[0]?.id ?? null);
    setFindNote(null);
    setFindOpen(true);
  };

  const findDate = selectedDate.format(DATE_FORMAT);
  const findMembers = findGroupId ? availabilityFor(findGroupId) : [];
  const mySlots = findMembers.find((member) => member.uid === user?.uid)?.slots ?? [];
  const mySlotsToday = mySlots.filter((slot) => slot.date === findDate);

  // only shows overlaps once someone else has shared too
  const windows: Window[] =
    findMembers.length < 2
      ? []
      : subtractBusy(
          freeWindows(
            findMembers.map((member) => member.slots),
            findDate,
            MIN_WINDOW_MINUTES,
          ),
          busyBlocks,
          findDate,
        ).filter((window) => window.end - window.start >= MIN_WINDOW_MINUTES);

  const addSlot = async () => {
    Haptics.selectionAsync();

    if (!findGroupId) {
      return;
    }

    // a slot has to end after it starts
    if (slotEnd <= slotStart) {
      setFindNote('end has to be after start');
      return;
    }

    const slot: AvailabilitySlot = {
      date: findDate,
      start: toClock(slotStart * 60),
      end: toClock(slotEnd * 60),
    };

    await setMyAvailability(findGroupId, [
      ...mySlots,
      slot,
    ]);

    setFindNote(null);
  };

  const removeSlot = async (slot: AvailabilitySlot) => {
    if (!findGroupId) {
      return;
    }

    Haptics.selectionAsync();
    await setMyAvailability(
      findGroupId,
      mySlots.filter((candidate) => candidate !== slot),
    );
  };

  const proposeWindow = async (window: Window) => {
    if (!findGroupId) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // no double-booking on a double tap
    setFindOpen(false);

    await addEvent({
      groupId: findGroupId,
      title: 'Hang out',
      date: findDate,
      time: toClock(window.start),
      reminder: false,
      color: null,
    });
  };

  const closeFind = () => {
    Haptics.selectionAsync();
    setFindOpen(false);
  };

  const closeRsvp = () => {
    Haptics.selectionAsync();
    setRsvpEvent(null);
  };

  const toggleBusy = () => {
    Haptics.selectionAsync();
    setShowBusy((value) => !value);
  };

  const toggleReminder = (value: boolean) => {
    Haptics.selectionAsync();
    setReminder(value);
  };

  const renderEventLine = (event: CalendarEvent) => (
    <TouchableOpacity
      key={event.id}
      onPress={() => openRsvp(event)}
      onLongPress={() => confirmDelete(event)}
      delayLongPress={400}
    >
      <Text style={styles.eventItem}>
        • {formatTime12(event.time)} {event.title}
        {groupName(event.groupId) ? ` · ${groupName(event.groupId)}` : ''}
        {rsvpSummary(event)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* top calendar controls */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => step(-1)}>
          <Ionicons
            name="chevron-back"
            size={20}
            color="#5a4400"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {viewMode === 'day' ? selectedDate.format('ddd, MMMM D') : currentMonth.format('MMMM YYYY')}
        </Text>

        <TouchableOpacity onPress={() => step(1)}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#5a4400"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={openModal}>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color="#5a4400"
          />
        </TouchableOpacity>
      </View>

      {/* month / week / day, then which calendars are on */}
      <View style={styles.modeRow}>
        {VIEW_MODES.map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeChip,
              viewMode === mode && styles.modeChipActive,
            ]}
            onPress={() => pickMode(mode)}
          >
            <Text
              style={[
                styles.modeText,
                viewMode === mode && styles.modeTextActive,
              ]}
            >
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.calendarChips}
      >
        {[
          {
            key: JUST_ME,
            label: 'just me',
          },
          ...groups.map((group) => ({
            key: group.id,
            label: group.name,
          })),
        ].map((chip) => (
          <TouchableOpacity
            key={chip.key || 'me'}
            style={[
              styles.calChip,
              hidden.has(chip.key) && styles.calChipOff,
            ]}
            onPress={() => toggleCalendar(chip.key)}
          >
            <Text style={styles.calChipText}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.calChip,
            styles.busyChip,
            !showBusy && styles.calChipOff,
          ]}
          onPress={toggleBusy}
        >
          <Text style={styles.calChipText}>
            busy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.calChip,
            styles.syncChip,
          ]}
          onPress={syncBusy}
        >
          <Ionicons
            name="sync-outline"
            size={13}
            color="#5a4400"
          />

          <Text style={styles.calChipText}>
            sync my calendar
          </Text>
        </TouchableOpacity>

        {groups.length > 0 && (
          <TouchableOpacity
            style={[
              styles.calChip,
              styles.findChip,
            ]}
            onPress={openFind}
          >
            <Text style={styles.findChipText}>
              {sharedAllowed ? 'find a time' : 'find a time (Pro)'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {busyNote && (
        <Text style={styles.note}>
          {busyNote}
        </Text>
      )}

      {loading && (
        <ActivityIndicator
          color="#b7931d"
          style={styles.spinner}
        />
      )}

      {error && (
        <Text style={styles.errorText}>
          could not load events: {error}
        </Text>
      )}

      {/* weekday labels */}
      {viewMode !== 'day' && (
        <View style={styles.dayHeaderRow}>
          {WEEK_DAYS.map((day) => (
            <Text
              key={day}
              style={styles.dayHeader}
            >
              {day}
            </Text>
          ))}
        </View>
      )}

      {/* month grid */}
      {viewMode === 'month' && (
        <FlatList
          style={styles.monthList}
          data={cells}
          numColumns={7}
          scrollEnabled={false}
          keyExtractor={(item, index) => (item ? item.format(DATE_FORMAT) : `empty-${index}`)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dayBox,
                item && item.isSame(selectedDate, 'day') && styles.selectedDayBox,
              ]}
              disabled={!item}
              onPress={() => item && pickDate(item)}
            >
              <Text style={styles.dayText}>
                {item ? item.date() : ''}
              </Text>

              <View style={styles.dotRow}>
                {item && daysWithEvents[item.format(DATE_FORMAT)] && (
                  <View style={styles.dot} />
                )}

                {item && busyOn(item).length > 0 && (
                  <View style={styles.busyDot} />
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* week strip */}
      {viewMode === 'week' && (
        <View style={styles.weekRow}>
          {week.map((day) => {
            const dayEvents = eventsOn(day);

            return (
              <TouchableOpacity
                key={day.format(DATE_FORMAT)}
                style={[
                  styles.weekBox,
                  day.isSame(selectedDate, 'day') && styles.selectedDayBox,
                ]}
                onPress={() => pickDate(day)}
              >
                <Text style={styles.dayText}>
                  {day.date()}
                </Text>

                {dayEvents.slice(0, 3).map((event) => (
                  <Text
                    key={event.id}
                    style={styles.weekEvent}
                    numberOfLines={1}
                  >
                    {event.title}
                  </Text>
                ))}

                {dayEvents.length > 3 && (
                  <Text style={styles.weekEvent}>
                    +{dayEvents.length - 3}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* selected day preview */}
      <ScrollView style={styles.detailsScroll}>
        <View style={styles.detailsBox}>
          <Text style={styles.detailsText}>
            {selectedDate.format('dddd, MMMM D, YYYY')}
          </Text>

          {selectedEvents.length === 0 && selectedBusy.length === 0 && (
            <Text style={styles.emptyText}>
              nothing planned
            </Text>
          )}

          {selectedEvents.map(renderEventLine)}

          {selectedBusy.map((block) => (
            <Text
              key={block.id}
              style={styles.busyItem}
            >
              • busy {formatTime12(block.start)} to {formatTime12(block.end)}
            </Text>
          ))}

        </View>
      </ScrollView>

      {/* add event modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <TouchableOpacity
                style={styles.modalClose}
                onPress={closeModal}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#5a4400"
                />
              </TouchableOpacity>

              <Text style={styles.modalHeader}>
                Add Event
              </Text>

              {/* templates fill the title and bring a checklist */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.templateRow}
              >
                {EVENT_TEMPLATES.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.templateChip,
                      newTemplate === template.id && styles.templateChipActive,
                    ]}
                    onPress={() => pickTemplate(template)}
                  >
                    <Ionicons
                      name={template.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color="#8f741d"
                    />

                    <Text style={styles.templateText}>
                      {template.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.pickerRow}>
                <Picker
                  style={styles.picker}
                  selectedValue={newMonth}
                  onValueChange={(value) => setNewMonth(value)}
                >
                  {MONTH_NAMES.map((month, index) => (
                    <Picker.Item
                      key={month}
                      label={month}
                      value={index}
                    />
                  ))}
                </Picker>

                <Picker
                  style={styles.picker}
                  selectedValue={newDay}
                  onValueChange={(value) => setNewDay(value)}
                >
                  {DAY_OPTIONS.map((day) => (
                    <Picker.Item
                      key={day}
                      label={`${day}`}
                      value={day}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerRow}>
                <Picker
                  style={styles.picker}
                  selectedValue={newHour}
                  onValueChange={(value) => setNewHour(value)}
                >
                  {HOUR_OPTIONS.map((hour) => (
                    <Picker.Item
                      key={hour}
                      label={`${hour}`}
                      value={hour}
                    />
                  ))}
                </Picker>

                <Picker
                  style={styles.picker}
                  selectedValue={newMinute}
                  onValueChange={(value) => setNewMinute(value)}
                >
                  {MINUTE_OPTIONS.map((minute) => (
                    <Picker.Item
                      key={minute}
                      label={minute.toString().padStart(2, '0')}
                      value={minute}
                    />
                  ))}
                </Picker>

                <Picker
                  style={styles.pickerSmall}
                  selectedValue={newAmPm}
                  onValueChange={(value) => setNewAmPm(value)}
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

              {/* who the event is for */}
              <Picker
                style={styles.groupPicker}
                selectedValue={newGroupId}
                onValueChange={(value) => setNewGroupId(value)}
              >
                <Picker.Item
                  label="just me"
                  value={JUST_ME}
                />

                {groups.map((group) => (
                  <Picker.Item
                    key={group.id}
                    label={group.name}
                    value={group.id}
                  />
                ))}
              </Picker>

              <TextInput
                placeholder="Name of Event..."
                placeholderTextColor="#999"
                value={newTitle}
                onChangeText={setNewTitle}
                style={styles.modalInput}
              />

              {newTemplate && (
                <Text style={styles.templateNote}>
                  {newGroupId === JUST_ME
                    ? 'pick a group to get the checklist too'
                    : `the checklist goes to ${groupName(newGroupId)}'s to-do list`}
                </Text>
              )}

              <View style={styles.reminderRow}>
                <Switch
                  value={reminder}
                  onValueChange={toggleReminder}
                />

                <Text style={styles.reminderText}>
                  Remind me 30 min before
                </Text>

                <TouchableOpacity
                  onPress={saveEvent}
                  style={[
                    styles.saveButton,
                    (!newTitle.trim() || saving) && styles.saveButtonDisabled,
                  ]}
                  disabled={!newTitle.trim() || saving}
                >
                  <Text style={styles.saveText}>
                    {saving ? 'Saving' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* rsvp sheet */}
      <Modal
        transparent
        visible={rsvpEvent !== null}
        animationType="fade"
        onRequestClose={closeRsvp}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeRsvp}
        >
          {/* taps inside the card do not close it */}
          <View
            style={styles.rsvpContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalHeader}>
              {rsvpEvent?.title}
            </Text>

            <Text style={styles.rsvpMeta}>
              {rsvpEvent ? `${dayjs(rsvpEvent.date).format('MMM D')} ${formatTime12(rsvpEvent.time)} · ${groupName(rsvpEvent.groupId)}` : ''}
            </Text>

            <View style={styles.rsvpRow}>
              {RSVP_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.status}
                  style={[
                    styles.rsvpChip,
                    rsvpEvent && user && rsvpEvent.rsvps[user.uid] === option.status && styles.rsvpChipActive,
                  ]}
                  onPress={() => answerRsvp(option.status)}
                >
                  <Text style={styles.rsvpChipText}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {rsvpEvent && Object.keys(rsvpEvent.rsvps).length > 0 && (
              <Text style={styles.rsvpMeta}>
                {Object.entries(rsvpEvent.rsvps)
                  .map(([uid, status]) => `${uid === user?.uid ? 'you' : (groups.find((group) => group.id === rsvpEvent.groupId)?.profiles[uid]?.username ?? 'someone')}: ${status}`)
                  .join(' · ')}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* find a time */}
      <Modal
        transparent
        visible={findOpen}
        animationType="slide"
        onRequestClose={closeFind}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <TouchableOpacity
                style={styles.modalClose}
                onPress={closeFind}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#5a4400"
                />
              </TouchableOpacity>

              <Text style={styles.modalHeader}>
                Find a time
              </Text>

              <Text style={styles.rsvpMeta}>
                {selectedDate.format('dddd, MMMM D')}
              </Text>

              <View style={styles.templateRow}>
                {groups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.templateChip,
                      findGroupId === group.id && styles.templateChipActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setFindGroupId(group.id);
                    }}
                  >
                    <Text style={styles.templateText}>
                      {group.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.findLabel}>
                I&apos;m free
              </Text>

              <View style={styles.pickerRow}>
                <Picker
                  style={styles.picker}
                  selectedValue={slotStart}
                  onValueChange={(value) => setSlotStart(value)}
                >
                  {SLOT_HOURS.map((hour) => (
                    <Picker.Item
                      key={hour}
                      label={hourLabel(hour)}
                      value={hour}
                    />
                  ))}
                </Picker>

                <Text style={styles.findTo}>
                  to
                </Text>

                <Picker
                  style={styles.picker}
                  selectedValue={slotEnd}
                  onValueChange={(value) => setSlotEnd(value)}
                >
                  {SLOT_HOURS.map((hour) => (
                    <Picker.Item
                      key={hour}
                      label={hourLabel(hour)}
                      value={hour}
                    />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={addSlot}
              >
                <Text style={styles.saveText}>
                  Share this slot
                </Text>
              </TouchableOpacity>

              {findNote && (
                <Text style={styles.errorText}>
                  {findNote}
                </Text>
              )}

              {mySlotsToday.map((slot, index) => (
                <TouchableOpacity
                  key={`${slot.start}-${slot.end}-${index}`}
                  onPress={() => removeSlot(slot)}
                >
                  <Text style={styles.eventItem}>
                    • you: {formatTime12(slot.start)} to {formatTime12(slot.end)} (tap to remove)
                  </Text>
                </TouchableOpacity>
              ))}

              {findMembers
                .filter((member) => member.uid !== user?.uid)
                .map((member) => (
                  <Text
                    key={member.uid}
                    style={styles.eventItem}
                  >
                    • {member.username}: {member.slots.filter((slot) => slot.date === findDate).length} {member.slots.filter((slot) => slot.date === findDate).length === 1 ? 'slot' : 'slots'} shared
                  </Text>
                ))}

              <Text style={styles.findLabel}>
                Everyone is free
              </Text>

              {windows.length === 0 && (
                <Text style={styles.emptyText}>
                  {findMembers.length <= 1
                    ? 'waiting on the others to share'
                    : 'no window of an hour or more, try another day'}
                </Text>
              )}

              {windows.map((window) => (
                <TouchableOpacity
                  key={`${window.start}-${window.end}`}
                  style={styles.windowRow}
                  onPress={() => proposeWindow(window)}
                >
                  <Text style={styles.windowText}>
                    {formatTime12(toClock(window.start))} to {formatTime12(toClock(window.end))}
                  </Text>

                  <Text style={styles.windowAction}>
                    propose
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.hint}>
                your busy time is left out and stays private
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// calendar screen styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
    paddingTop: 40,
    paddingHorizontal: 12,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  headerTitle: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 20,
    color: '#5a4400',
  },

  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },

  modeChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#fffef2',
    borderWidth: 1,
    borderColor: '#e8dab9',
  },

  modeChipActive: {
    borderColor: '#b7931d',
    backgroundColor: '#b7931d',
  },

  modeText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 15,
    color: '#5a4400',
  },

  modeTextActive: {
    color: '#fffef2',
  },

  chipScroll: {
    flexGrow: 0,
    marginBottom: 10,
  },

  calendarChips: {
    alignItems: 'center',
    gap: 6,
  },

  calChip: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b7931d',
  },

  calChipOff: {
    opacity: 0.4,
    borderColor: '#e8dab9',
  },

  calChipText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 13,
    color: '#5a4400',
  },

  busyChip: {
    borderColor: '#9a9a9a',
  },

  syncChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  findChip: {
    backgroundColor: '#b7931d',
  },

  findChipText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 13,
    color: '#fff',
  },

  note: {
    fontFamily: 'Gaegu-Light',
    fontSize: 13,
    color: '#785c10',
    marginBottom: 4,
  },

  spinner: {
    marginVertical: 8,
  },

  errorText: {
    fontFamily: 'Gaegu-Regular',
    color: '#a83232',
    textAlign: 'center',
    marginBottom: 8,
  },

  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dayHeader: {
    padding: 0,
    width: '10%',
    textAlign: 'left',
    fontFamily: 'Gaegu-Bold',
    color: '#5a4400',
  },

  dayBox: {
    width: '13%',
    aspectRatio: 1.1,
    padding: 4,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginVertical: 0.8,
    marginHorizontal: 0.8,
    backgroundColor: '#fff8e8',
    borderRadius: 6,
    zIndex: 1,
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  weekBox: {
    width: '13%',
    minHeight: 110,
    padding: 4,
    marginHorizontal: 0.8,
    backgroundColor: '#fff8e8',
    borderRadius: 6,
  },

  weekEvent: {
    fontFamily: 'Gaegu-Light',
    fontSize: 11,
    color: '#5a4400',
  },

  selectedDayBox: {
    borderColor: '#b7931d',
    borderWidth: 2,
  },

  dayText: {
    fontFamily: 'Gaegu-Regular',
    color: '#5a4400',
    fontSize: 14,
  },

  dotRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    gap: 2,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#b7931d',
  },

  busyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9a9a9a',
  },

  monthList: {
    flexGrow: 0,
  },

  detailsScroll: {
    flex: 1,
  },

  detailsBox: {
    marginTop: 12,
    marginBottom: 90,
    padding: 12,
    backgroundColor: '#fffef2',
    borderRadius: 10,
  },

  detailsText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
    marginBottom: 4,
  },

  emptyText: {
    fontFamily: 'Gaegu-Light',
    fontSize: 14,
    color: '#8a7a55',
  },

  eventItem: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 14,
    color: '#5a4400',
    paddingVertical: 2,
  },

  busyItem: {
    fontFamily: 'Gaegu-Light',
    fontSize: 14,
    color: '#8a8a8a',
    paddingVertical: 2,
  },

  hint: {
    fontFamily: 'Gaegu-Light',
    fontSize: 12,
    color: '#8a7a55',
    marginTop: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '90%',
    maxHeight: '88%',
    backgroundColor: '#fffef2',
    borderRadius: 12,
    padding: 16,
  },

  modalClose: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },

  modalHeader: {
    textAlign: 'center',
    fontFamily: 'Gaegu-Bold',
    fontSize: 18,
    marginBottom: 12,
  },

  templateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },

  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8dab9',
  },

  templateChipActive: {
    borderColor: '#b7931d',
  },

  templateText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 14,
    color: '#5a4400',
  },

  templateNote: {
    fontFamily: 'Gaegu-Light',
    fontSize: 13,
    color: '#785c10',
    marginBottom: 8,
  },

  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  picker: {
    flex: 1,
    height: 40,
  },

  pickerSmall: {
    width: 90,
    height: 40,
  },

  groupPicker: {
    height: 40,
    marginBottom: 12,
  },

  modalInput: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    fontFamily: 'Gaegu-Regular',
  },

  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reminderText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
    marginLeft: 8,
  },

  saveButton: {
    backgroundColor: '#b7931d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  saveButtonDisabled: {
    opacity: 0.5,
  },

  saveText: {
    fontFamily: 'Gaegu-Bold',
    color: '#fff',
  },

  rsvpContent: {
    width: '85%',
    backgroundColor: '#fffef2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  rsvpMeta: {
    fontFamily: 'Gaegu-Light',
    fontSize: 14,
    color: '#785c10',
    textAlign: 'center',
    marginBottom: 10,
  },

  rsvpRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },

  rsvpChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8dab9',
  },

  rsvpChipActive: {
    borderColor: '#b7931d',
    backgroundColor: '#fff8e8',
  },

  rsvpChipText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
    color: '#5a4400',
  },

  findLabel: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
    color: '#5a4400',
    marginTop: 10,
    marginBottom: 4,
  },

  findTo: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 14,
    color: '#5a4400',
    marginHorizontal: 6,
  },

  windowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff8e8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },

  windowText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    color: '#5a4400',
  },

  windowAction: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 14,
    color: '#b7931d',
  },
});

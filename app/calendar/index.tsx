/**
 * ==============================
 * FILE: app/calendar/index.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen is the main calendar view for Clique.
 * It gives the user a month-style calendar, a selected-day preview,
 * and an add-event modal for creating simple events.
 *
 * Includes:
 * - Month calendar grid
 * - Month navigation with back/forward arrows
 * - Month / week / day view picker
 * - Selected day highlight
 * - Event dots on days that have events
 * - Day-at-a-glance event list
 * - Add-event modal with month/day/time picker controls
 * - Reminder toggle placeholder
 * - Calendar data pulled from CalendarContext
 *
 * Notes:
 * - This is currently an MVP calendar screen.
 * - Month view is the main implemented view.
 * - Week and day modes are scaffolded through the picker, but their layouts
 *   still need to be built.
 * - Events are stored through CalendarContext for now.
 * - Later, this should connect to Firestore so group events persist across users.
 * - The reminder switch is UI-only right now and can later connect to notifications.
 */

import React, {
  useEffect,
  useState,
} from 'react';

import {
  FlatList,
  Modal,
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

import {
  Event,
  useCalendar,
} from '../_context/CalendarContext';

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

type ViewMode = 'month' | 'week' | 'day';
type AmPm = 'AM' | 'PM';

export default function MasterCalendar() {
  const {
    events,
    addEvent,
  } = useCalendar();

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

  const [
    modalVisible,
    setModalVisible,
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
  ] = useState(today.hour());

  const [
    newMinute,
    setNewMinute,
  ] = useState(today.minute());

  const [
    newAmPm,
    setNewAmPm,
  ] = useState<AmPm>(
    today.hour() < 12 ? 'AM' : 'PM'
  );

  const [
    newTitle,
    setNewTitle,
  ] = useState('');

  const [
    reminder,
    setReminder,
  ] = useState(false);

  // builds the month grid
  const startOfMonth = currentMonth.startOf('month');
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayIndex = startOfMonth.day();

  const days = Array.from(
    { length: daysInMonth },
    (_, index) => startOfMonth.add(index, 'day')
  );

  // tracks which dates should show an event dot
  const daysWithEvents = events.reduce<Record<string, boolean>>(
    (
      acc,
      event,
    ) => {
      acc[event.date] = true;
      return acc;
    },
    {}
  );

  // month arrows
  const prevMonth = () => {
    setCurrentMonth((month) => month.subtract(1, 'month'));
  };

  const nextMonth = () => {
    setCurrentMonth((month) => month.add(1, 'month'));
  };

  // only show events for the selected day
  const selectedEvents = events.filter(
    (event) => event.date === selectedDate.format('YYYY-MM-DD')
  );

  const saveEvent = () => {
    // converts the modal's 12-hour picker into a 24-hour time
    const hour24 =
      newAmPm === 'PM' && newHour < 12
        ? newHour + 12
        : newAmPm === 'AM' && newHour === 12
          ? 0
          : newHour;

    const dateStr = dayjs()
      .year(currentMonth.year())
      .month(newMonth)
      .date(newDay)
      .hour(hour24)
      .minute(newMinute)
      .format('YYYY-MM-DD');

    addEvent({
      id: Date.now().toString(),
      groupId: '',
      title: newTitle,
      date: dateStr,
    });

    setModalVisible(false);
  };

  useEffect(() => {
    // keeps the modal's month lined up with the visible calendar month
    setNewMonth(currentMonth.month());
  }, [currentMonth]);

  return (
    <View style={styles.container}>
      {/* top calendar controls */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={prevMonth}>
          <Ionicons
            name="chevron-back"
            size={20}
            color="#5a4400"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {currentMonth.format('MMMM YYYY')}

          <Text style={styles.headerSub}>
            {' '}
            (
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
            )
          </Text>
        </Text>

        <TouchableOpacity onPress={nextMonth}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#5a4400"
          />
        </TouchableOpacity>

        {/* view picker is scaffolded, month view is the main working view rn */}
        <Picker
          selectedValue={viewMode}
          style={styles.modePicker}
          onValueChange={(value: ViewMode) => setViewMode(value)}
        >
          <Picker.Item
            label="Month"
            value="month"
          />

          <Picker.Item
            label="Week"
            value="week"
          />

          <Picker.Item
            label="Day"
            value="day"
          />
        </Picker>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color="#5a4400"
          />
        </TouchableOpacity>

        {/* filter button placeholder for group-specific calendars later */}
        <TouchableOpacity>
          <Ionicons
            name="filter-outline"
            size={24}
            color="#5a4400"
          />
        </TouchableOpacity>
      </View>

      {/* weekday labels */}
      {viewMode === 'month' && (
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
          data={[
            ...Array(firstDayIndex).fill(null),
            ...days,
          ]}
          numColumns={7}
          scrollEnabled={false}
          keyExtractor={(item, index) =>
            item
              ? item.format('YYYY-MM-DD')
              : `empty-${index}`
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dayBox,
                item &&
                  item.isSame(selectedDate, 'day') &&
                  styles.selectedDayBox,
              ]}
              disabled={!item}
              onPress={() => item && setSelectedDate(item)}
            >
              <Text style={styles.dayText}>
                {item ? item.date() : ''}
              </Text>

              {item && daysWithEvents[item.format('YYYY-MM-DD')] && (
                <View style={styles.dot} />
              )}
            </TouchableOpacity>
          )}
        />
      )}

      {/* week/day layouts will go here later */}
      {viewMode !== 'month' && (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsText}>
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view coming soon
          </Text>
        </View>
      )}

      {/* selected day preview */}
      <View style={styles.detailsBox}>
        <Text style={styles.detailsText}>
          {selectedDate.format('dddd, MMMM D, YYYY')}
        </Text>

        {selectedEvents.map((event: Event) => (
          <Text
            key={event.id}
            style={styles.eventItem}
          >
            • {event.title}
          </Text>
        ))}
      </View>

      {/* add event modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
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

            <View style={styles.pickerRow}>
              <Picker
                style={styles.picker}
                selectedValue={newMonth}
                onValueChange={(value: number) => setNewMonth(value)}
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
                onValueChange={(value: number) => setNewDay(value)}
              >
                {Array.from(
                  { length: 31 },
                  (_, index) => (
                    <Picker.Item
                      key={index + 1}
                      label={`${index + 1}`}
                      value={index + 1}
                    />
                  )
                )}
              </Picker>

              <Picker
                style={styles.picker}
                selectedValue={newHour}
                onValueChange={(value: number) => setNewHour(value)}
              >
                {Array.from(
                  { length: 12 },
                  (_, index) => (
                    <Picker.Item
                      key={index}
                      label={`${index || 12}`}
                      value={index || 12}
                    />
                  )
                )}
              </Picker>

              <Picker
                style={styles.pickerSmall}
                selectedValue={newAmPm}
                onValueChange={(value: AmPm) => setNewAmPm(value)}
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

            <TextInput
              placeholder="Name of Event..."
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.modalInput}
            />

            <View style={styles.reminderRow}>
              <Switch
                value={reminder}
                onValueChange={setReminder}
              />

              <Text style={styles.reminderText}>
                Set reminder
              </Text>

              <TouchableOpacity
                onPress={saveEvent}
                style={styles.saveButton}
              >
                <Text style={styles.saveText}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// styling kept expanded on purpose because this file is already logic-heavy
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

  // this hides the "(month)" label without deleting the structure yet
  headerSub: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 0,
    color: '#5a4400',
  },

  modePicker: {
    width: 150,
    height: 20,
    zIndex: 10,
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
    justifyContent: 'flex-start',
    marginVertical: 0.8,
    marginHorizontal: 0.8,
    backgroundColor: '#fff8e8',
    borderRadius: 6,
    zIndex: 1,
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

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#b7931d',
    alignSelf: 'flex-end',
    margin: 2,
  },

  detailsBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fffef2',
    borderRadius: 10,
  },

  detailsText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
    marginBottom: 4,
  },

  eventItem: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 14,
    color: '#5a4400',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '90%',
    backgroundColor: '#fffef2',
    borderRadius: 12,
    padding: 16,
  },

  modalClose: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  modalHeader: {
    textAlign: 'center',
    fontFamily: 'Gaegu-Bold',
    fontSize: 18,
    marginBottom: 12,
  },

  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  picker: {
    flex: 1,
    height: 40,
  },

  pickerSmall: {
    width: 60,
    height: 40,
  },

  modalInput: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
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
  },

  saveButton: {
    backgroundColor: '#b7931d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  saveText: {
    fontFamily: 'Gaegu-Bold',
    color: '#fff',
  },
});

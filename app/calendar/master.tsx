/**
 * ==============================
 * FILE: app/calendar/master.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen is an early prototype of the master calendar view.
 * It shows a simple month-style grid, marks days that have events,
 * and displays event details when a date is selected.
 *
 * Includes:
 * - Day / week / month view mode state
 * - Simple view switcher buttons
 * - Mock calendar event data
 * - Month-style date grid
 * - Event dot indicator
 * - Selected date details panel
 *
 * Notes:
 * - This file uses mock data only.
 * - The month grid is always shown right now, even though viewMode exists.
 * - This was likely an earlier version before the more complete calendar screen.
 * - Later, this can either be removed, archived, or used as a simpler reference
 *   for calendar behavior.
 */

import React, {
  useState,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ViewMode = 'day' | 'week' | 'month';

type CalendarEvent = {
  group: string;
  event: string;
  time: string;
};

type MockDateMap = {
  [date: string]: CalendarEvent[];
};

const mockDates: MockDateMap = {
  '2025-04-10': [
    {
      group: 'Besties',
      event: 'Picnic',
      time: '10:00',
    },
  ],

  '2025-04-12': [
    {
      group: 'Family',
      event: 'Birthday',
      time: '15:00',
    },
  ],
};

const days = Array.from(
  { length: 30 },
  (_, index) => `2025-04-${(index + 1).toString().padStart(2, '0')}`
);

export default function MasterCalendar() {
  const [
    viewMode,
    setViewMode,
  ] = useState<ViewMode>('month');

  const [
    selectedDate,
    setSelectedDate,
  ] = useState('');

  const handleChangeView = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Master Calendar
      </Text>

      {/* simple view buttons for the early calendar prototype */}
      <View style={styles.viewSwitcher}>
        <TouchableOpacity onPress={() => handleChangeView('day')}>
          <Text style={styles.switcherText}>
            Day
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleChangeView('week')}>
          <Text style={styles.switcherText}>
            Week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleChangeView('month')}>
          <Text style={styles.switcherText}>
            Month
          </Text>
        </TouchableOpacity>
      </View>

      {/* month grid stays visible for now, even while viewMode is being tested */}
      <ScrollView contentContainerStyle={styles.grid}>
        {days.map((day) => {
          const events = mockDates[day] || [];

          return (
            <TouchableOpacity
              key={day}
              style={styles.dayBox}
              onPress={() => setSelectedDate(day)}
            >
              <Text>
                {day.split('-')[2]}
              </Text>

              {/* tiny dot means this day has something scheduled */}
              {events.length > 0 && (
                <Text style={styles.dot}>
                  ●
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* only show the detail box after a date is selected */}
      {selectedDate ? (
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>
            {selectedDate}
          </Text>

          {(mockDates[selectedDate] || []).map(
            (
              event,
              index,
            ) => (
              <Text key={index}>
                {event.group}: {event.event} at {event.time}
              </Text>
            )
          )}
        </View>
      ) : null}
    </View>
  );
}

// basic prototype styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
    paddingTop: 60,
  },

  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },

  viewSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  switcherText: {
    fontSize: 16,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  dayBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },

  dot: {
    color: '#b7931d',
    marginTop: 2,
  },

  detailBox: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
  },

  detailTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
});

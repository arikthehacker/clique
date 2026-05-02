
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function MasterCalendar() {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [selectedDate, setSelectedDate] = useState('');

  // Example data
  const mockDates = {
    '2025-04-10': [{ group: 'Besties', event: 'Picnic', time: '10:00' }],
    '2025-04-12': [{ group: 'Family', event: 'Birthday', time: '15:00' }]
  };

  const days = Array.from({ length: 30 }, (_, i) => `2025-04-${(i + 1).toString().padStart(2, '0')}`);

  const handleChangeView = (mode: 'day' | 'week' | 'month') => {
    setViewMode(mode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Master Calendar</Text>

      <View style={styles.viewSwitcher}>
        <TouchableOpacity onPress={() => handleChangeView('day')}>
          <Text style={styles.switcherText}>Day</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleChangeView('week')}>
          <Text style={styles.switcherText}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleChangeView('month')}>
          <Text style={styles.switcherText}>Month</Text>
        </TouchableOpacity>
      </View>

      {/* We'll just always show month for now, but you can if(viewMode==='month') */}
      <ScrollView contentContainerStyle={styles.grid}>
        {days.map((day) => {
          const events = mockDates[day] || [];
          return (
            <TouchableOpacity key={day} style={styles.dayBox} onPress={() => setSelectedDate(day)}>
              <Text>{day.split('-')[2]}</Text>
              {events.length > 0 && <Text style={styles.dot}>●</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedDate ? (
        <View style={styles.detailBox}>
          <Text style={styles.detailTitle}>{selectedDate}</Text>
          {(mockDates[selectedDate] || []).map((ev, idx) => (
            <Text key={idx}>
              {ev.group}: {ev.event} at {ev.time}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1E3C0', paddingTop: 60 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 20, fontWeight: '600' },
  viewSwitcher: {
    flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10
  },
  switcherText: { fontSize: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  dayBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8
  },
  dot: { color: '#b7931d', marginTop: 2 },
  detailBox: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12
  },
  detailTitle: {
    fontWeight: '600',
    marginBottom: 8
  }
});

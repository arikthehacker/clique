
// FILE: app/calendar/index.tsx
// PURPOSE: Master calendar view with month/week/day switch, day-of glance, and add-event modal with picker wheels

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Picker } from '@react-native-picker/picker';
import { useCalendar, Event } from '../_context/CalendarContext';

const WEEK_DAYS = ['S', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MasterCalendar() {
  const { events, addEvent } = useCalendar();
  const today = dayjs();

  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'month'|'week'|'day'>('month');
  const [modalVisible, setModalVisible] = useState(false);

  // new-event modal state
  const [newMonth, setNewMonth] = useState(currentMonth.month());
  const [newDay, setNewDay] = useState(today.date());
  const [newHour, setNewHour] = useState(today.hour());
  const [newMinute, setNewMinute] = useState(today.minute());
  const [newAmPm, setNewAmPm] = useState<'AM'|'PM'>(today.hour()<12?'AM':'PM');
  const [newTitle, setNewTitle] = useState('');
  const [reminder, setReminder] = useState(false);

  // generate days for calendar
  const startOfMonth = currentMonth.startOf('month');
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayIndex = startOfMonth.day();
  const days = Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, 'day'));

  // events mapping for dots
  const daysWithEvents = events.reduce<Record<string,boolean>>((acc,e) => {
    acc[e.date] = true;
    return acc;
  }, {});

  // month navigation
  const prevMonth = () => setCurrentMonth(m => m.subtract(1,'month'));
  const nextMonth = () => setCurrentMonth(m => m.add(1,'month'));

  // day-at-a-glance
  const selectedEvents = events.filter(e => e.date === selectedDate.format('YYYY-MM-DD'));

  // handle save
  const saveEvent = () => {
    const hour24 = (newAmPm==='PM' && newHour<12 ? newHour+12 : newAmPm==='AM' && newHour===12 ? 0 : newHour);
    const dateStr = dayjs()
      .year(currentMonth.year())
      .month(newMonth)
      .date(newDay)
      .hour(hour24)
      .minute(newMinute)
      .format('YYYY-MM-DD');
    addEvent({ id: Date.now().toString(), groupId:'', title:newTitle, date:dateStr });
    setModalVisible(false);
  };

  useEffect(() => {
    // if month changed while modal open
    setNewMonth(currentMonth.month());
  },[currentMonth]);

  return (
    <View style={styles.container}>
      {/* Header: prev, title, next, view switch, add +, filter */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={prevMonth}><Ionicons name="chevron-back" size={20} color="#5a4400"/></TouchableOpacity>
        
        



        <Text style={styles.headerTitle}>{currentMonth.format('MMMM YYYY')} <Text style={styles.headerSub}> ({viewMode.charAt(0).toUpperCase()+viewMode.slice(1)})</Text>
        </Text>
        

        <TouchableOpacity onPress={nextMonth}><Ionicons name="chevron-forward" size={20} color="#5a4400"/></TouchableOpacity>
        


        <Picker
          selectedValue={viewMode}
          style={styles.modePicker}
          onValueChange={v=>setViewMode(v)}>
          <Picker.Item label="Month" value="month" />
          <Picker.Item label="Week" value="week" />
          <Picker.Item label="Day"   value="day"   />
        </Picker>





        <TouchableOpacity onPress={()=>setModalVisible(true)}><Ionicons name="add-circle-outline" size={24} color="#5a4400"/></TouchableOpacity>
        <TouchableOpacity><Ionicons name="filter-outline" size={24} color="#5a4400"/></TouchableOpacity>
      </View>

      {/* Days of week headers */}
      {viewMode==='month' && (
      <View style={styles.dayHeaderRow}>
        {WEEK_DAYS.map(d=> <Text key={d} style={styles.dayHeader}>{d}</Text> )}
      </View>)}

      {/* Calendar Grid */}
      {viewMode==='month' && <FlatList
        data={[...Array(firstDayIndex).fill(null), ...days]}
        numColumns={7}
        scrollEnabled={false}
        keyExtractor={(item,i)=> item?item.format('YYYY-MM-DD'):`empty-${i}`}
        renderItem={({item})=> (
          <TouchableOpacity
            style={[styles.dayBox, item && item.isSame(selectedDate,'day') && styles.selectedDayBox]}
            disabled={!item}
            onPress={()=>item&&setSelectedDate(item)}>
            <Text style={styles.dayText}>{item?item.date():''}</Text>
            {item && daysWithEvents[item.format('YYYY-MM-DD')] && <View style={styles.dot}/>}
          </TouchableOpacity>
        )}
      />}
      {/* (Week/Day views would go here) */}

      {/* Day-at-a-glance */}
      <View style={styles.detailsBox}>
        <Text style={styles.detailsText}>{selectedDate.format('dddd, MMMM D, YYYY')}</Text>
        {selectedEvents.map(e=> <Text key={e.id} style={styles.eventItem}>• {e.title}</Text>)}
      </View>

      {/* Add-Event Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={()=>setModalVisible(false)}>
              <Ionicons name="close" size={20} color="#5a4400"/>
            </TouchableOpacity>
            <Text style={styles.modalHeader}>Add Event</Text>
            <View style={styles.pickerRow}>
              <Picker style={styles.picker} selectedValue={newMonth} onValueChange={v=>setNewMonth(v)}>
                {MONTH_NAMES.map((m,i)=><Picker.Item key={m} label={m} value={i}/>)}
              </Picker>
              <Picker style={styles.picker} selectedValue={newDay} onValueChange={v=>setNewDay(v)}>
                {Array.from({length:31},(_,i)=><Picker.Item key={i+1} label={`${i+1}`} value={i+1}/>)}
              </Picker>
              <Picker style={styles.picker} selectedValue={newHour} onValueChange={v=>setNewHour(v)}>
                {Array.from({length:12},(_,i)=><Picker.Item key={i} label={`${i||12}`} value={i||12}/>)}
              </Picker>
              <Picker style={styles.pickerSmall} selectedValue={newAmPm} onValueChange={v=>setNewAmPm(v)}>
                <Picker.Item label="AM" value="AM"/><Picker.Item label="PM" value="PM"/>
              </Picker>
            </View>
            <TextInput
              placeholder="Name of Event..."
              value={newTitle}
              onChangeText={setNewTitle}
              style={styles.modalInput}
            />
            <View style={styles.reminderRow}>
              <Switch value={reminder} onValueChange={setReminder} />
              <Text style={styles.reminderText}>Set reminder</Text>
              <TouchableOpacity onPress={saveEvent} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F1E3C0', paddingTop:40, paddingHorizontal:12 },
  headerRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:8 },
  headerTitle:{ fontFamily:'Gaegu-Bold', fontSize:20, color:'#5a4400'},
  
  // put font size to 0, used to show (Month) next to month name and year. dont like that so i put font size to 0.
  headerSub:{ fontFamily:'Gaegu-Regular', fontSize:0, color:'#5a4400' },
  modePicker:{ width:150, height:20, position: 'center', zIndex: 10,},
  dayHeaderRow:{ flexDirection:'row', justifyContent:'space-between' },
  dayHeader:{ padding: 0, width:'10%', textAlign:'left', fontFamily:'Gaegu-Bold', color:'#5a4400'},
  dayBox:{ width:'13%', aspectRatio:1.1, padding:4, alignItems:'flex-start', justifyContent:'flex-start', marginVertical:.8, marginHorizontal: .8, backgroundColor:'#fff8e8', borderRadius:6, zIndex: 1, },
  selectedDayBox:{ borderColor:'#b7931d', borderWidth:2 },
  dayText:{ fontFamily:'Gaegu-Regular', color:'#5a4400', fontSize:14 },
  dot:{ width:6, height:6, borderRadius:3, backgroundColor:'#b7931d', alignSelf:'flex-end', margin:2 },
  detailsBox:{ marginTop:12, padding:12, backgroundColor:'#fffef2', borderRadius:10 },
  detailsText:{ fontFamily:'Gaegu-Bold', fontSize:16, marginBottom:4 },
  eventItem:{ fontFamily:'Gaegu-Regular', fontSize:14, color:'#5a4400' },
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.3)', justifyContent:'center', alignItems:'center' },
  modalContent:{ width:'90%', backgroundColor:'#fffef2', borderRadius:12, padding:16 },
  modalClose:{ position:'absolute', top:8, right:8 },
  modalHeader:{ textAlign:'center', fontFamily:'Gaegu-Bold', fontSize:18, marginBottom:12 },
  pickerRow:{ flexDirection:'row', justifyContent:'space-between', marginBottom:12 },
  picker:{ flex:1, height:40 },
  pickerSmall:{ width:60, height:40 },
  modalInput:{ backgroundColor:'#fff', padding:8, borderRadius:6, marginBottom:12 },
  reminderRow:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  reminderText:{ fontFamily:'Gaegu-Regular', fontSize:14, textAlign: 'left', },
  saveButton:{ backgroundColor:'#b7931d', paddingHorizontal:12, paddingVertical:6, borderRadius:6 },
  saveText:{ fontFamily:'Gaegu-Bold', color:'#fff' },
});

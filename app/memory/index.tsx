
// FILE: app/memory/index.tsx
// PURPOSE: Single-view Memory screen with camera/editor mockup, frame selection,
// recent memories feed, and widget preview for demo

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const FRAME_SIZE = windowWidth * 0.7;
const IMAGE_SIZE = FRAME_SIZE * 0.6;

// asset imports (replace with your actual asset paths)
const basicSelfie = require('../../assets/images/basic-selfie.png');
const basicSelfie2 = require('../../assets/images/basic-selfie2.png');
const polaroidFrame = require('../../assets/images/polaroid-frame.png');
const vintageFrame = require('../../assets/images/default-memory.png');

export default function MemoryIndex() {
  const [selectedFrame, setSelectedFrame] = useState('polaroid');
  const [caption, setCaption] = useState('');
  const [memories, setMemories] = useState([]);
  const [showPhoto, setShowPhoto] = useState(false);
  const [widgetVisible, setWidgetVisible] = useState(false);
  const scrollRef = useRef(null);

  const frameSource = selectedFrame === 'polaroid' ? polaroidFrame : vintageFrame;

  const addMemory = () => {
    const newMem = { id: Date.now().toString(), frame: selectedFrame, caption };
    setMemories([newMem, ...memories]);
    setCaption('');
    setShowPhoto(false);
    // scroll to top
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} ref={scrollRef} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Take a Memory</Text>

        {/* Frame Preview with Camera Button */}
        <View style={styles.frameContainer}>
          <Image source={frameSource} style={styles.frameImage} />
          {showPhoto && (
            <Image source={basicSelfie} style={styles.selfieImage} />
          )}
          {!showPhoto && (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowPhoto(true)}
            >
              <Ionicons name="camera-outline" size={32} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Frame Picker */}
        <View style={styles.pickerRow}>
          <TouchableOpacity
            style={[styles.pickerButton, selectedFrame === 'polaroid' && styles.pickerActive]}
            onPress={() => setSelectedFrame('polaroid')}
          >
            <Text style={styles.pickerText}>Polaroid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pickerButton, selectedFrame === 'vintage' && styles.pickerActive]}
            onPress={() => setSelectedFrame('vintage')}
          >
            <Text style={styles.pickerText}>Vintage</Text>
          </TouchableOpacity>
        </View>

        {/* Caption Input */}
        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption..."
          value={caption}
          onChangeText={setCaption}
        />

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.previewBtn} onPress={() => setWidgetVisible(true)}>
            <Text style={styles.btnText}>Preview Widget</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={addMemory} disabled={!showPhoto}>
            <Text style={styles.btnText}>Save Memory</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Memories Feed */}
        <Text style={styles.sectionTitle}>Recent Memories</Text>
        {memories.length === 0 ? (
          <Text style={styles.emptyText}>No memories yet...</Text>
        ) : (
          memories.map(mem => (
            <View key={mem.id} style={styles.memoryCard}>
              <Image
                source={mem.frame === 'polaroid' ? polaroidFrame : vintageFrame}
                style={styles.cardFrame}
              />
              <Image
                source={basicSelfie}
                style={styles.cardSelfie}
                resizeMode="cover"
              />
              <Text style={styles.cardCaption}>{mem.caption}</Text>
            </View>
          ))
        )}

        {/* Widget Preview Modal */}
        <Modal transparent visible={widgetVisible} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.widgetContainer}>
              <Text style={styles.widgetTitle}>Memory Widget - Picnic Club</Text>
              <View style={styles.widgetGrid}>
                {[1,2,3,4].map((i) => (
                  <View key={i} style={styles.widgetItem}>
                    <Image source={basicSelfie} style={styles.widgetImage} />
                    <Text style={styles.widgetName}>User{i}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity onPress={() => setWidgetVisible(false)} style={styles.closeWidgetBtn}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1E3C0' },
  scroll: { alignItems: 'center', paddingVertical: 20 },
  title: { fontSize: 28, fontFamily: 'Gaegu-Bold', marginBottom: 20 },
  frameContainer: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameImage: {
    position: 'absolute',
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  selfieImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 6,
  },
  cameraButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE/2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerRow: { flexDirection: 'row', marginBottom: 16 },
  pickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#fffef2',
    marginHorizontal: 8,
  },
  pickerActive: { borderColor: '#b7931d', borderWidth: 2 },
  pickerText: { fontFamily: 'Gaegu-Regular', fontSize: 16 },
  captionInput: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontFamily: 'Gaegu-Regular',
  },
  buttonRow: { flexDirection: 'row', marginBottom: 30 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#b7931d',
    paddingVertical: 20,
    borderRadius: 12,
    marginHorizontal: 10,
    alignItems: 'center',
    opacity: 1,
  },
  previewBtn: {
    flex: 1,
    backgroundColor: '#fffef2',
    paddingVertical: 20,
    borderRadius: 12,
    marginHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b7931d',
  },
  btnText: { fontFamily: 'Gaegu-Bold', fontSize: 16, color: '#5a4400' },
  sectionTitle: { fontSize: 22, fontFamily: 'Gaegu-Bold', alignSelf: 'flex-start', marginLeft: 20, marginBottom: 12 },
  emptyText: { fontStyle: 'italic', color: '#777' },
  memoryCard: {
    width: FRAME_SIZE * 0.6,
    marginBottom: 20,
    alignItems: 'center',
  },
  cardFrame: {
    position: 'absolute',
    width: FRAME_SIZE * 0.6,
    height: FRAME_SIZE * 0.6,
  },
  cardSelfie: {
    width: FRAME_SIZE * 0.45,
    height: FRAME_SIZE * 0.45,
    marginTop: FRAME_SIZE * 0.1,
    borderRadius: 6,
  },
  cardCaption: {
    marginTop: 10,
    fontFamily: 'Gaegu-Regular',
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetContainer: {
    width: windowWidth * 0.8,
    backgroundColor: '#fffef2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  widgetTitle: { fontFamily: 'Gaegu-Bold', fontSize: 20, marginBottom: 12 },
  widgetGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  widgetItem: { alignItems: 'center', margin: 8 },
  widgetImage: { width: 50, height: 50, borderRadius: 25, marginBottom: 4 },
  widgetName: { fontFamily: 'Gaegu-Regular', fontSize: 12 },
  closeWidgetBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#b7931d',
    borderRadius: 8,
  },
  closeText: { color: '#fff', fontFamily: 'Gaegu-Bold' },
});

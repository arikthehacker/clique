/**
 * ==============================
 * FILE: app/memory/index.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This screen is Clique's main memory prototype screen.
 * It lets the user preview a memory inside a frame, add a caption, save it
 * into a local recent memories feed, and preview how memories could look inside
 * a home-screen widget.
 *
 * Includes:
 * - Memory frame preview
 * - Camera button mockup
 * - Frame picker
 * - Caption input
 * - Save memory button
 * - Recent memories feed
 * - Widget preview modal
 * - KeyboardAvoidingView for easier caption typing
 *
 * Notes:
 * - This screen is a demo/MVP version of the memory feature.
 * - The camera button currently swaps in a local image instead of opening the
 *   real camera flow.
 * - Memories are stored in local component state right now.
 * - Later, this should connect to the camera route, Firebase Storage, and
 *   Firestore memory documents.
 * - This file is useful because it shows the full product idea visually even
 *   before the backend is connected.
 */

import React, {
  useRef,
  useState,
} from 'react';

import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const FRAME_SIZE = windowWidth * 0.7;
const IMAGE_SIZE = FRAME_SIZE * 0.6;

const basicSelfie = require('../../assets/images/basic-selfie.png');
const basicSelfie2 = require('../../assets/images/basic-selfie2.png');
const polaroidFrame = require('../../assets/images/polaroid-frame.png');
const vintageFrame = require('../../assets/images/default-memory.png');

type FrameType = 'polaroid' | 'vintage';

type Memory = {
  id: string;
  frame: FrameType;
  caption: string;
};

export default function MemoryIndex() {
  const [
    selectedFrame,
    setSelectedFrame,
  ] = useState<FrameType>('polaroid');

  const [
    caption,
    setCaption,
  ] = useState('');

  const [
    memories,
    setMemories,
  ] = useState<Memory[]>([]);

  const [
    showPhoto,
    setShowPhoto,
  ] = useState(false);

  const [
    widgetVisible,
    setWidgetVisible,
  ] = useState(false);

  const scrollRef = useRef<ScrollView | null>(null);

  const frameSource =
    selectedFrame === 'polaroid'
      ? polaroidFrame
      : vintageFrame;

  const addMemory = () => {
    const newMemory: Memory = {
      id: Date.now().toString(),
      frame: selectedFrame,
      caption: caption,
    };

    // newest memories show first, like a cute little feed
    setMemories((prevMemories) => [
      newMemory,
      ...prevMemories,
    ]);

    setCaption('');
    setShowPhoto(false);

    // pops back to the top so the saved memory is visible right away
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Take a Memory
        </Text>

        {/* frame preview area */}
        <View style={styles.frameContainer}>
          <Image
            source={frameSource}
            style={styles.frameImage}
          />

          {showPhoto && (
            <Image
              source={basicSelfie}
              style={styles.selfieImage}
            />
          )}

          {!showPhoto && (
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowPhoto(true)}
            >
              <Ionicons
                name="camera-outline"
                size={32}
                color="#fff"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* frame picker */}
        <View style={styles.pickerRow}>
          <TouchableOpacity
            style={[
              styles.pickerButton,
              selectedFrame === 'polaroid' && styles.pickerActive,
            ]}
            onPress={() => setSelectedFrame('polaroid')}
          >
            <Text style={styles.pickerText}>
              Polaroid
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pickerButton,
              selectedFrame === 'vintage' && styles.pickerActive,
            ]}
            onPress={() => setSelectedFrame('vintage')}
          >
            <Text style={styles.pickerText}>
              Vintage
            </Text>
          </TouchableOpacity>
        </View>

        {/* caption for the memory */}
        <TextInput
          style={styles.captionInput}
          placeholder="Add a caption..."
          value={caption}
          onChangeText={setCaption}
        />

        {/* action buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => setWidgetVisible(true)}
          >
            <Text style={styles.btnText}>
              Preview Widget
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={addMemory}
            disabled={!showPhoto}
          >
            <Text style={styles.btnText}>
              Save Memory
            </Text>
          </TouchableOpacity>
        </View>

        {/* recent memories feed */}
        <Text style={styles.sectionTitle}>
          Recent Memories
        </Text>

        {memories.length === 0 ? (
          <Text style={styles.emptyText}>
            No memories yet...
          </Text>
        ) : (
          memories.map((memory) => (
            <View
              key={memory.id}
              style={styles.memoryCard}
            >
              <Image
                source={
                  memory.frame === 'polaroid'
                    ? polaroidFrame
                    : vintageFrame
                }
                style={styles.cardFrame}
              />

              <Image
                source={basicSelfie}
                style={styles.cardSelfie}
                resizeMode="cover"
              />

              <Text style={styles.cardCaption}>
                {memory.caption}
              </Text>
            </View>
          ))
        )}

        {/* widget preview modal */}
        <Modal
          transparent
          visible={widgetVisible}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.widgetContainer}>
              <Text style={styles.widgetTitle}>
                Memory Widget - Picnic Club
              </Text>

              <View style={styles.widgetGrid}>
                {[1, 2, 3, 4].map((userNumber) => (
                  <View
                    key={userNumber}
                    style={styles.widgetItem}
                  >
                    <Image
                      source={basicSelfie}
                      style={styles.widgetImage}
                    />

                    <Text style={styles.widgetName}>
                      User{userNumber}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setWidgetVisible(false)}
                style={styles.closeWidgetBtn}
              >
                <Text style={styles.closeText}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// memory screen styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
  },

  scroll: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  title: {
    fontSize: 28,
    fontFamily: 'Gaegu-Bold',
    marginBottom: 20,
  },

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
    borderRadius: IMAGE_SIZE / 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pickerRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  pickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#fffef2',
    marginHorizontal: 8,
  },

  pickerActive: {
    borderColor: '#b7931d',
    borderWidth: 2,
  },

  pickerText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
  },

  captionInput: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontFamily: 'Gaegu-Regular',
  },

  buttonRow: {
    flexDirection: 'row',
    marginBottom: 30,
  },

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

  btnText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 16,
    color: '#5a4400',
  },

  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Gaegu-Bold',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 12,
  },

  emptyText: {
    fontStyle: 'italic',
    color: '#777',
  },

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

  widgetTitle: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 20,
    marginBottom: 12,
  },

  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },

  widgetItem: {
    alignItems: 'center',
    margin: 8,
  },

  widgetImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },

  widgetName: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 12,
  },

  closeWidgetBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#b7931d',
    borderRadius: 8,
  },

  closeText: {
    color: '#fff',
    fontFamily: 'Gaegu-Bold',
  },
});

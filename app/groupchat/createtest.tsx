/**
 * ==============================
 * FILE: app/groupchat/createtest.tsx
 * Last Updated: 2026-05-01
 * ==============================
 *
 * PURPOSE:
 * This file is a test version of the group chat creation screen.
 * It experiments with adding an image picker before connecting that idea
 * to the main create.tsx flow.
 *
 * Includes:
 * - Group name input
 * - Expo ImagePicker test
 * - Group image preview
 * - Temporary group object
 * - Route back to /home with group data in params
 *
 * Notes:
 * - This is an experiment/prototype file, not the main production route.
 * - The main create flow lives in app/groupchat/create.tsx.
 * - This file is useful because it shows the feature was tested separately
 *   before being merged into the main screen.
 * - Later, this image picker logic can be moved into create.tsx and connected
 *   to Firebase Storage or another upload system.
 */

import React, {
  useState,
} from 'react';

import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

type NewGroup = {
  id: string;
  name: string;
  image: string | null;
};

export default function CreateGroupChatTest() {
  const router = useRouter();

  const [
    name,
    setName,
  ] = useState('');

  const [
    image,
    setImage,
  ] = useState<string | null>(null);

  const pickImage = async () => {
    // opens the phone photo library so the user can test a group image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    // expo returns canceled=true when the user backs out, so do nothing then
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreate = () => {
    // no nameless group chats, the app deserves better
    if (!name.trim()) {
      return;
    }

    const newGroup: NewGroup = {
      id: Date.now().toString(),
      name: name.trim(),
      image: image,
    };

    // sends test group data back to home through route params
    router.push({
      pathname: '/home',
      params: {
        newGroup: JSON.stringify(newGroup),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Create a New Group
      </Text>

      {/* test upload circle for group chat image */}
      <TouchableOpacity
        onPress={pickImage}
        style={styles.avatarUpload}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.avatar}
          />
        ) : (
          <Text style={styles.placeholder}>
            Upload Group Image
          </Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Group Name"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
      >
        <Text style={styles.buttonText}>
          Create
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// test screen styling, kept simple on purpose
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    backgroundColor: '#F1E3C0',
  },

  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },

  avatarUpload: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  placeholder: {
    color: '#999',
    fontSize: 14,
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#b7931d',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

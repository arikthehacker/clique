
// FILE: app/groupchat/create.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function CreateGroupChat() {
  const [name, setName] = useState('');
  const router = useRouter();


const handleCreate = () => {
  if (!name.trim()) return;

  const newGroup = {
    id: Date.now().toString(),
    name,
    image: null, // we’ll add image picker later
  };

  router.replace({
    pathname: '/home',
    params: {
      newGroup: JSON.stringify(newGroup),
    },
  });
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Group Chat!</Text>

      <TextInput
        placeholder="Whats your group chat name?"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3C0',
    padding: 50,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: "#614e26",
    fontFamily: 'Gaegu-Regular',
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    fontFamily: 'Gaegu-Light',
    fontSize: 18,
    color:'#614e26',
    borderRadius: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#b7931d',
    padding: 5,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 25,
    fontFamily: 'Gaegu-Light',
    fontWeight: '600',
  },
  cancel: {
    textAlign: 'center',
    color: '#614e26',
    fontFamily: 'Gaegu-Light',
    fontSize: 18,
  },
});

import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from './components/BackButton';

export default function UsernameScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Choose Your Username</Text>
      <TextInput placeholder="@username" style={styles.input} />
      <Button title="Next" onPress={() => router.push('/questions')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6E49C',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 24,
    padding: 12,
  },
});


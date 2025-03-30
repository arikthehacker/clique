
import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from './components/BackButton';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Log In</Text>
      <TextInput placeholder="Email" style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} />
      <Button title="Continue" onPress={() => router.push('/home')} />
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 12,
    padding: 12,
  },
});

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function Welcome() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.selectionAsync();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(() => {
      router.push('/questions');
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <Image
          source={require('../assets/images/default-avatar.png')}
 
	  style={styles.avatar}
        />
      </Animated.View>
      <Text style={styles.text}>Welcome,</Text>
      <Text style={styles.username}>@{username}!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6E49C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  text: {
    fontSize: 28,
    fontFamily: 'Figtree-SemiBold',
    color: '#333',
  },
  username: {
    fontSize: 46,
    fontFamily: 'Gaegu-Regular',
  },
});


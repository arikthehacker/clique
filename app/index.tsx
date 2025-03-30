import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function WelcomeScreen() {
  const router = useRouter();
  const pulse = useRef(new Animated.Value(1)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const [circlePos, setCirclePos] = useState({ x: 100, y: 200 });
  const [explode, setExplode] = useState(false);
  const rays = Array.from({ length: 8 }, (_, i) => useRef(new Animated.Value(0)).current);

  const { width } = Dimensions.get('window');

  // restrict circle spawn near welcome text
  useEffect(() => {
    const x = Math.random() * (width * 0.6) + width * 0.2;
    const y = 200 + Math.random() * 30; // stays close to welcome text
    setCirclePos({ x, y });
  }, []);

  // pulse forever
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleTap = () => {
    Haptics.selectionAsync(); // haptic feedback 💥

    setExplode(true); // show sunburst

    // animate rays
    rays.forEach((ray, i) => {
      Animated.timing(ray, {
        toValue: 1,
        duration: 400,
        delay: i * 30,
        useNativeDriver: true,
      }).start();
    });

    // fade + navigate
    Animated.parallel([
      Animated.timing(pulse, {
        toValue: 2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/auth');
    });
  };

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <Animated.View
        style={[
          styles.circle,
          {
            top: circlePos.y,
            left: circlePos.x,
            transform: [{ scale: pulse }],
            opacity: fadeOut,
          },
        ]}
      />

      {/* 🌞 sun rays */}
      {explode &&
        rays.map((ray, i) => {
          const angle = (i * 360) / rays.length;
          const translateX = 60 * Math.cos((angle * Math.PI) / 180);
          const translateY = 60 * Math.sin((angle * Math.PI) / 180);

          return (
            <Animated.View
              key={i}
              style={[
                styles.ray,
                {
                  top: circlePos.y + 90 - 5,
                  left: circlePos.x + 90 - 5,
                  transform: [
                    {
                      translateX: ray.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, translateX],
                      }),
                    },
                    {
                      translateY: ray.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, translateY],
                      }),
                    },
                  ],
                  opacity: ray,
                },
              ]}
            />
          );
        })}

      <Text style={styles.subtle}>welcome to</Text>
      <Text style={styles.title}>Clique</Text>
      <Text style={styles.tap}>tap anywhere to continue</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6E49C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: -1,
  },
  ray: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  subtle: {
    fontSize: 60,
    color: '#8f741d',
    textTransform: 'lowercase',
    marginBottom: 8,
    marginTop: -80,
  },
  title: {
    fontSize: 130,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  tap: {
    fontSize: 20,
    color: '#b7931d',
    marginTop: 100,
  },
});


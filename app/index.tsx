

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();
  const pulse = useRef(new Animated.Value(1)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;
  const [circlePos, setCirclePos] = useState({ x: 100, y: 200 });
  const [explode, setExplode] = useState(false);
  const rays = Array.from({ length: 8 }, (_, i) => useRef(new Animated.Value(0)).current);
  const sway = useRef(new Animated.Value(0)).current; 

  const { width } = Dimensions.get('window');

  // sun circle spawn near welcome text randomized 
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


  // 💥 I PUT THIS HEREEEEEE: animate wheat sway
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 3000,
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
    <LinearGradient
      colors={['#E1BD31', '#Ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <Pressable style={styles.pressableFill} onPress={handleTap}>
        {/* central pulsing circle */}
        <Animated.View
          style={[
            styles.circle,
            {
              top:    circlePos.y,
              left:   circlePos.x,
              opacity: fadeOut,
              transform: [{ scale: pulse }],
            },
          ]}
        />

        {/* sunburst rays */}
        {explode &&
          rays.map((ray, i) => {
            const angle     = (i * 360) / rays.length;
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
                    opacity: ray,
                    transform: [
                      {
                        translateX: ray.interpolate({
                          inputRange:  [0, 1],
                          outputRange: [0, translateX],
                        }),
                      },
                      {
                        translateY: ray.interpolate({
                          inputRange:  [0, 1],
                          outputRange: [0, translateY],
                        }),
                      },
                    ],
                  },
                ]}
              />
            );
          })}

        <Text style={styles.subtle}>welcome to</Text>
        <Text style={styles.title}>Clique</Text>
        <Text style={styles.tap}>tap anywhere to continue</Text>
        {/* 💥 I PUT THIS HEREEEEEE: wheat shadow background */}
        <Image source={require('../assets/images/wheat-rand.png')} style={styles.shadow} />

        {/* 💥 I PUT THIS HEREEEEEE: wheat hero image animated */}
        <Animated.Image
          source={require('../assets/images/wheat-right.png')}
          style={[
            styles.wheat,
            {
              transform: [
                {
                  rotateZ: sway.interpolate({
                    inputRange: [0, 5],
                    outputRange: ['-15deg', '12.5deg'],
                  }),
                },
              ],
            },
          ]}
        />
      </Pressable>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  pressableFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
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
    fontFamily: 'Outfit-Regular',
    marginBottom: 8,
    marginTop: -80,
  },
  title: {
    fontSize: 130,
    fontWeight: 'bold',
    fontFamily: 'Gaegu-Regular',
    color: '#8f741d',
    marginBottom: 20,
  },
  tap: {
    fontSize: 20,
    color: '#b7931d',
    fontFamily: 'Outfit-Regular',
    marginTop: 100,
  },
    wheat: {
    position: 'absolute',
    bottom: -50,
    right: -10,
    width: 220,
    height: 220,
    zIndex: 1,
    opacity: 0.35,
  },
  shadow: {
    top: 250,
    left: 250,
    right: 250,
    height: 200,
    resizeMode: 'cover',
    opacity: 0.15,
    zIndex: 0,
  },
});


/**
 * ==============================
 * FILE: app/index.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The tap-to-start screen, the first thing anyone sees. One tap bursts the
 * sun into rays and moves on to sign in.
 *
 * Includes:
 * - Pulsing sun near the title
 * - Swaying wheat
 * - Sunburst rays on tap
 * - Fade out, then on to /auth
 */

import {
  useEffect,
  useState,
} from 'react';

import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const wheatShadow = require('../assets/images/wheat-rand.png');
const wheatHero = require('../assets/images/wheat-right.png');

const RAY_COUNT = 8;
const RAY_DISTANCE = 60;

const screenWidth = Dimensions.get('window').width;

export default function StartScreen() {
  const router = useRouter();

  const [pulse] = useState(() => new Animated.Value(1));
  const [fadeOut] = useState(() => new Animated.Value(1));
  const [sway] = useState(() => new Animated.Value(0));

  const [rays] = useState(() =>
    Array.from(
      { length: RAY_COUNT },
      () => new Animated.Value(0),
    ),
  );

  // sun lands somewhere new near the title every time
  const [circlePos] = useState(() => ({
    x: Math.random() * (screenWidth * 0.6) + screenWidth * 0.2,
    y: 200 + Math.random() * 30,
  }));

  const [
    explode,
    setExplode,
  ] = useState(false);

  useEffect(() => {
    // pulse forever
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
      ]),
    ).start();

    // wheat sway
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
      ]),
    ).start();
  }, [
    pulse,
    sway,
  ]);

  const handleTap = () => {
    // one burst only, no double trip to /auth
    if (explode) {
      return;
    }

    Haptics.selectionAsync();
    setExplode(true);

    // rays fan out one after another
    rays.forEach((ray, index) => {
      Animated.timing(ray, {
        toValue: 1,
        duration: 400,
        delay: index * 30,
        useNativeDriver: true,
      }).start();
    });

    // fade the sun, then move on
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
      colors={[
        '#E1BD31',
        '#Ffffff',
      ]}
      start={{
        x: 0,
        y: 0,
      }}
      end={{
        x: 1,
        y: 1,
      }}
      style={styles.gradientContainer}
    >
      <Pressable
        style={styles.pressableFill}
        onPress={handleTap}
      >
        {/* central pulsing circle */}
        <Animated.View
          style={[
            styles.circle,
            {
              top: circlePos.y,
              left: circlePos.x,
              opacity: fadeOut,
              transform: [{ scale: pulse }],
            },
          ]}
        />

        {/* sunburst rays */}
        {explode &&
          rays.map((ray, index) => {
            const angle = (index * 360) / rays.length;
            const translateX = RAY_DISTANCE * Math.cos((angle * Math.PI) / 180);
            const translateY = RAY_DISTANCE * Math.sin((angle * Math.PI) / 180);

            return (
              <Animated.View
                key={index}
                style={[
                  styles.ray,
                  {
                    top: circlePos.y + 90 - 5,
                    left: circlePos.x + 90 - 5,
                    opacity: ray,
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
                  },
                ]}
              />
            );
          })}

        <Text style={styles.subtle}>
          welcome to
        </Text>

        <Text style={styles.title}>
          Clique
        </Text>

        <Text style={styles.tap}>
          tap anywhere to continue
        </Text>

        {/* wheat shadow in the background */}
        <Image
          source={wheatShadow}
          style={styles.shadow}
        />

        {/* wheat hero image, swaying */}
        <Animated.Image
          source={wheatHero}
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

// start screen styling
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

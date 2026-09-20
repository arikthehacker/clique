/**
 * ==============================
 * FILE: app/home/UserProfileSidebar.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The profile drawer that slides in from the right.
 *
 * Includes:
 * - Avatar in its frame, and @username
 * - Bio, email and phone
 * - Invite QR code with referral code
 * - Off the grid and simple mode switches
 * - Onboarding answers
 * - Edit profile and edit answers
 * - Close button and backdrop tap
 *
 * Notes:
 * - The QR encodes clique://join?u=username&r=CODE. Nothing opens that link yet.
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
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

import { useAuth } from '../../src/context/AuthContext';
import { FrameType } from '../../src/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

const defaultAvatar = require('../../assets/images/default-avatar.png');
const polaroidFrame = require('../../assets/images/polaroid-frame.png');
const vintageFrame = require('../../assets/images/default-memory.png');

const AVATAR = 90;
const FRAME = 150;

function frameFor(frame: FrameType) {
  if (frame === 'polaroid') {
    return polaroidFrame;
  }

  if (frame === 'vintage') {
    return vintageFrame;
  }

  return null;
}

type UserProfileSidebarProps = {
  onClose: () => void;
};

export default function UserProfileSidebar({ onClose }: UserProfileSidebarProps) {
  const router = useRouter();

  const {
    user,
    updateProfile,
  } = useAuth();

  const [slideAnim] = useState(() => new Animated.Value(SCREEN_WIDTH));

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleClose = () => {
    Haptics.selectionAsync();
    onClose();
  };

  const editProfile = () => {
    Haptics.selectionAsync();
    onClose();

    router.push({
      pathname: '/avatar',
      params: {
        from: 'profile',
      },
    });
  };

  const editAnswers = () => {
    Haptics.selectionAsync();
    onClose();

    router.push({
      pathname: '/questions',
      params: {
        from: 'profile',
      },
    });
  };

  const toggleOffGrid = async (value: boolean) => {
    Haptics.selectionAsync();
    await updateProfile({ offGrid: value });
  };

  const toggleSimple = async (value: boolean) => {
    Haptics.selectionAsync();
    await updateProfile({ simpleMode: value });
  };

  const answers = user?.answers ?? null;
  const frameArt = frameFor(user?.avatarFrame ?? 'none');
  const inviteLink = `clique://join?u=${encodeURIComponent(user?.username ?? '')}&r=${user?.referralCode ?? ''}`;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <ScrollView contentContainerStyle={styles.sidebarScroll}>
          <Text style={styles.header}>
            Your Profile
          </Text>

          {/* avatar, inside the chosen frame when there is one */}
          <View style={styles.avatarWrapper}>
            {frameArt && (
              <Image
                source={frameArt}
                style={styles.frameArt}
              />
            )}

            <View style={styles.dottedCircle}>
              <Image
                source={user?.avatarUri ? { uri: user.avatarUri } : defaultAvatar}
                style={styles.avatar}
              />
            </View>
          </View>

          <Text style={styles.handle}>
            @{user?.username || 'you'}
          </Text>

          {user?.bio ? (
            <Text style={styles.bio}>
              {user.bio}
            </Text>
          ) : null}

          {user?.email ? (
            <Text style={styles.email}>
              {user.email}
            </Text>
          ) : null}

          {user?.phone ? (
            <Text style={styles.email}>
              {user.phone}
            </Text>
          ) : null}

          {user?.offGrid && (
            <Text style={styles.offGridTag}>
              off the grid
            </Text>
          )}

          {/* qr invite card */}
          <View style={styles.qrWrap}>
            <QRCode
              value={inviteLink}
              size={110}
              color="#5f480d"
              backgroundColor="#fffef2"
            />

            <Text style={styles.qrHint}>
              scan to add me · code {user?.referralCode}
            </Text>
          </View>

          {/* off the grid and simple mode */}
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>
                Off the grid
              </Text>

              <Text style={styles.switchHint}>
                pauses nudges and memory reminders
              </Text>
            </View>

            <Switch
              value={user?.offGrid ?? false}
              onValueChange={toggleOffGrid}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>
                Simple mode
              </Text>

              <Text style={styles.switchHint}>
                bigger text everywhere
              </Text>
            </View>

            <Switch
              value={user?.simpleMode ?? false}
              onValueChange={toggleSimple}
            />
          </View>

          {/* onboarding answers */}
          <View style={styles.answers}>
            <Text style={styles.answerLabel}>
              vibe
            </Text>

            <Text style={styles.answerText}>
              {answers?.vibe || 'not answered yet'}
            </Text>

            <Text style={styles.answerLabel}>
              loves
            </Text>

            <Text style={styles.answerText}>
              {answers?.love || 'not answered yet'}
            </Text>

            <Text style={styles.answerLabel}>
              connects by
            </Text>

            <Text style={styles.answerText}>
              {answers?.connect || 'not answered yet'}
            </Text>
          </View>

          <Pressable onPress={editProfile}>
            <Text style={styles.link}>
              Edit profile
            </Text>
          </Pressable>

          <Pressable onPress={editAnswers}>
            <Text style={styles.link}>
              Edit answers
            </Text>
          </Pressable>

          <Pressable
            onPress={handleClose}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>
              ← Close
            </Text>
          </Pressable>
        </ScrollView>
      </Animated.View>

      <Pressable
        style={styles.backdrop}
        onPress={handleClose}
      />
    </View>
  );
}

// profile drawer styling
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row-reverse',
    zIndex: 999,
  },

  sidebar: {
    width: SCREEN_WIDTH * 0.72,
    backgroundColor: '#f6e49b',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },

  sidebarScroll: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    fontSize: 40,
    color: '#5f480d',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Gaegu-Regular',
  },

  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: FRAME,
    height: FRAME,
    alignSelf: 'center',
    marginBottom: 4,
  },

  frameArt: {
    position: 'absolute',
    width: FRAME,
    height: FRAME,
  },

  dottedCircle: {
    width: AVATAR + 10,
    height: AVATAR + 10,
    borderRadius: (AVATAR + 10) / 2,
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffef2',
  },

  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
  },

  handle: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 30,
    color: '#5f480d',
    textAlign: 'center',
  },

  bio: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 17,
    color: '#5f480d',
    textAlign: 'center',
    marginBottom: 4,
  },

  email: {
    fontFamily: 'Gaegu-Light',
    fontSize: 14,
    color: '#8a7a55',
    textAlign: 'center',
  },

  offGridTag: {
    alignSelf: 'center',
    marginTop: 6,
    fontFamily: 'Gaegu-Bold',
    fontSize: 13,
    color: '#fff',
    backgroundColor: '#8a7a55',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },

  qrWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#fffef2',
    padding: 10,
    borderRadius: 12,
    marginTop: 14,
    marginBottom: 14,
  },

  qrHint: {
    fontFamily: 'Gaegu-Light',
    fontSize: 12,
    color: '#8a7a55',
    marginTop: 6,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#e1c45a',
    borderBottomWidth: 0.5,
  },

  switchText: {
    flex: 1,
    paddingRight: 8,
  },

  switchLabel: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 17,
    color: '#5f480d',
  },

  switchHint: {
    fontFamily: 'Gaegu-Light',
    fontSize: 13,
    color: '#8a7a55',
  },

  answers: {
    marginTop: 12,
    marginBottom: 16,
  },

  answerLabel: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 14,
    color: '#725206',
    marginTop: 8,
  },

  answerText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 18,
    color: '#5f480d',
  },

  link: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 18,
    color: '#b7931d',
    marginBottom: 10,
  },

  backBtn: {
    marginTop: 30,
    marginLeft: 40,
  },

  backText: {
    color: '#5f480d',
    fontFamily: 'Gaegu-Light',
    fontSize: 30,
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

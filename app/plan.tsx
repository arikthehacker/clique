/**
 * ==============================
 * FILE: app/plan.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Your plan: how much trial is left, what each tier includes, and your
 * referral code.
 *
 * Includes:
 * - Trial days left and the plan in effect
 * - The three tiers with prices, referral discount applied when earned
 * - Pick a tier
 * - Your referral code with a copy button
 * - A field for a friend's code
 *
 * Notes:
 * - No checkout yet. Picking a paid tier is free and just unlocks it.
 * - The referral count never goes up yet, and friend codes are not saved.
 */

import {
  useRef,
  useState,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useAuth } from '../src/context/AuthContext';
import {
  PLAN_DETAILS,
  priceAfterDiscount,
  referralDiscount,
  REFERRALS_FOR_DISCOUNT,
  trialDaysLeft,
} from '../src/lib/plans';
import { Plan } from '../src/types';

export default function PlanScreen() {
  const router = useRouter();

  const {
    user,
    updateProfile,
  } = useAuth();

  const [
    note,
    setNote,
  ] = useState<string | null>(null);

  const [
    friendCode,
    setFriendCode,
  ] = useState('');

  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const daysLeft = user ? trialDaysLeft(user.trialStartedAt) : 0;
  const referredCount = user?.referredCount ?? 0;
  const discount = referralDiscount(referredCount);
  const planName = (plan: Plan) => PLAN_DETAILS.find((tier) => tier.plan === plan)?.name ?? 'Clique Free';

  // each new note gets its full time on screen
  const showNote = (text: string) => {
    if (noteTimer.current) {
      clearTimeout(noteTimer.current);
    }

    setNote(text);
    noteTimer.current = setTimeout(() => setNote(null), 2400);
  };

  const handleBack = () => {
    // little tap feedback before leaving
    Haptics.selectionAsync();
    router.back();
  };

  const choose = async (plan: Plan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateProfile({ plan: plan });
      showNote(plan === 'free' ? 'Clique Free it is' : `${planName(plan)} it is, no charge`);
    } catch {
      showNote('could not switch plans, try again');
    }
  };

  const copyCode = async () => {
    Haptics.selectionAsync();

    if (!user) {
      return;
    }

    await Clipboard.setStringAsync(user.referralCode);
    showNote('code copied');
  };

  const applyFriendCode = () => {
    Haptics.selectionAsync();

    const clean = friendCode.trim().toUpperCase();

    if (clean.length !== 6) {
      showNote('codes are six characters');
      return;
    }

    if (clean === user?.referralCode) {
      showNote('that one is yours');
      return;
    }

    setFriendCode('');
    showNote('friend codes are coming soon');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.back}
      >
        <Text style={styles.link}>
          ← back
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Your plan
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {daysLeft > 0 ? `${daysLeft} trial ${daysLeft === 1 ? 'day' : 'days'} left` : 'trial over'}
        </Text>

      </View>

      {PLAN_DETAILS.map((tier) => {
        const price = priceAfterDiscount(tier.pricePerYear, referredCount);
        const chosen = user?.plan === tier.plan;

        return (
          <View
            key={tier.plan}
            style={[
              styles.tier,
              chosen && styles.tierChosen,
            ]}
          >
            <View style={styles.tierHeader}>
              <Text style={styles.tierName}>
                {tier.name}
              </Text>

              <Text style={styles.tierPrice}>
                {tier.pricePerYear === 0 ? 'free' : `$${price}/yr`}
                {discount > 0 && tier.pricePerYear > 0 ? ` (${discount}% off)` : ''}
              </Text>
            </View>

            {tier.perks.map((perk) => (
              <Text
                key={perk}
                style={styles.perk}
              >
                • {perk}
              </Text>
            ))}

            <TouchableOpacity
              style={[
                styles.chooseBtn,
                chosen && styles.chooseBtnChosen,
              ]}
              onPress={() => choose(tier.plan)}
              disabled={chosen}
            >
              <Text style={styles.chooseText}>
                {chosen ? 'current plan' : 'choose'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={styles.disclaimer}>
        Checkout is not open yet, so picking a plan will not charge you.
      </Text>

      {/* referrals */}
      <Text style={styles.title}>
        Referrals
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          Share your code. Once {REFERRALS_FOR_DISCOUNT} friends join with it, paid plans are {referralDiscount(REFERRALS_FOR_DISCOUNT)}% off.
        </Text>

        <View style={styles.codeRow}>
          <Text style={styles.code}>
            {user?.referralCode}
          </Text>

          <TouchableOpacity
            style={styles.smallBtn}
            onPress={copyCode}
          >
            <Text style={styles.smallBtnText}>
              copy
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardText}>
          {referredCount} of {REFERRALS_FOR_DISCOUNT} so far
        </Text>

        <View style={styles.codeRow}>
          <TextInput
            style={styles.codeInput}
            value={friendCode}
            onChangeText={setFriendCode}
            placeholder="a friend's code"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            maxLength={6}
          />

          <TouchableOpacity
            style={styles.smallBtn}
            onPress={applyFriendCode}
          >
            <Text style={styles.smallBtnText}>
              apply
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {note && (
        <Text style={styles.note}>
          {note}
        </Text>
      )}
    </ScrollView>
  );
}

// plan screen styling
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F1E3C0',
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },

  back: {
    marginBottom: 8,
  },

  link: {
    fontFamily: 'Gaegu-Light',
    fontSize: 20,
    color: '#b7931d',
  },

  title: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 34,
    color: '#5a4400',
    marginTop: 8,
    marginBottom: 10,
  },

  card: {
    backgroundColor: '#fffef2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },

  cardTitle: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 22,
    color: '#5a4400',
  },

  cardText: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 16,
    color: '#5a4400',
    marginTop: 4,
  },

  tier: {
    backgroundColor: '#fffef2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8dab9',
  },

  tierChosen: {
    borderColor: '#b7931d',
    borderWidth: 2,
  },

  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tierName: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 22,
    color: '#5a4400',
  },

  tierPrice: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 18,
    color: '#b7931d',
  },

  perk: {
    fontFamily: 'Gaegu-Regular',
    fontSize: 15,
    color: '#5a4400',
  },

  chooseBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#b7931d',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  chooseBtnChosen: {
    backgroundColor: '#e8dab9',
  },

  chooseText: {
    fontFamily: 'Gaegu-Bold',
    fontSize: 15,
    color: '#fff',
  },

  disclaimer: {
    fontFamily: 'Gaegu-Light',
    fontSize: 14,
    color: '#8a7a55',
    marginBottom: 10,
  },

  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },

  code: {
    flex: 1,
    fontFamily: 'Gaegu-Bold',
    fontSize: 28,
    letterSpacing: 4,
    color: '#5a4400',
  },

  codeInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontFamily: 'Gaegu-Regular',
    fontSize: 18,
    letterSpacing: 2,
  },

  smallBtn: {
    backgroundColor: '#b7931d',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  smallBtnText: {
    fontFamily: 'Gaegu-Bold',
    color: '#fff',
  },

  note: {
    marginTop: 10,
    fontFamily: 'Gaegu-Light',
    fontSize: 15,
    color: '#785c10',
    textAlign: 'center',
  },
});

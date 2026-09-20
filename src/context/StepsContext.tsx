/**
 * ==============================
 * FILE: src/context/StepsContext.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Today's step count from the phone's pedometer, the streak of days the
 * goal was met, and the stickers that streak has unlocked.
 *
 * Includes:
 * - Today's steps, streak and daily goal
 * - Whether the phone has a pedometer we may read
 * - Refreshing the count and the streak
 * - Changing the goal
 * - Stickers unlocked by the streak
 *
 * Notes:
 * - Steps stay on this phone and are not synced.
 * - The streak rule lives in src/lib/steps.ts.
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import dayjs from 'dayjs';
import { Pedometer } from 'expo-sensors';

import { DATE_FORMAT } from '../lib/calendar';
import {
  advanceStreak,
  DEFAULT_GOAL,
  unlockedStickers,
} from '../lib/steps';
import {
  loadJson,
  saveJson,
  STORAGE_KEYS,
} from '../lib/storage';
import { StepsState } from '../types';
import { useAuth } from './AuthContext';

type StepsCtx = {
  steps: StepsState;
  available: boolean | null;
  refresh: () => Promise<void>;
  setGoal: (goal: number) => Promise<void>;
  unlocked: string[];
};

const EMPTY: StepsState = {
  stepsToday: 0,
  date: '',
  streak: 0,
  goal: DEFAULT_GOAL,
};

const StepsContext = createContext<StepsCtx>({
  steps: EMPTY,
  available: null,
  refresh: async () => {},
  setGoal: async () => {},
  unlocked: unlockedStickers(0),
});

export function StepsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [
    steps,
    setSteps,
  ] = useState<StepsState>(EMPTY);

  const [
    available,
    setAvailable,
  ] = useState<boolean | null>(null);

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  useEffect(() => {
    loadJson<StepsState>(STORAGE_KEYS.steps, EMPTY).then((saved) => {
      setSteps(saved);
      setLoaded(true);
    });
  }, []);

  const refresh = useCallback(async () => {
    // waits for the saved streak so it is not overwritten
    if (!loaded) {
      return;
    }

    const supported = await Pedometer.isAvailableAsync().catch(() => false);

    if (!supported) {
      setAvailable(false);
      return;
    }

    const permission = await Pedometer.requestPermissionsAsync().catch(() => ({ granted: false }));

    if (!permission.granted) {
      setAvailable(false);
      return;
    }

    setAvailable(true);

    const now = dayjs();
    const startOfDay = now.startOf('day');

    let stepsToday = 0;

    try {
      const result = await Pedometer.getStepCountAsync(startOfDay.toDate(), now.toDate());

      stepsToday = result.steps;
    } catch {
      // no step history on this phone, today stays at zero
    }

    const today = now.format(DATE_FORMAT);

    setSteps((current) => {
      const streak = advanceStreak({
        streak: current.streak,
        lastDate: current.date,
        today: today,
        yesterday: now.subtract(1, 'day').format(DATE_FORMAT),
        stepsToday: stepsToday,
        goal: current.goal,
      });

      // only a goal day moves the streak date
      const next: StepsState = {
        stepsToday: stepsToday,
        date: stepsToday >= current.goal ? today : current.date,
        streak: streak,
        goal: current.goal,
      };

      saveJson(STORAGE_KEYS.steps, next);

      return next;
    });
  }, [loaded]);

  useEffect(() => {
    // one read on open once someone is signed in
    if (!loaded || !user) {
      return undefined;
    }

    const timer = setTimeout(refresh, 0);

    return () => clearTimeout(timer);
  }, [
    loaded,
    user,
    refresh,
  ]);

  const setGoal = useCallback(async (goal: number) => {
    setSteps((current) => {
      const next = {
        ...current,
        goal: Math.max(1000, goal),
      };

      saveJson(STORAGE_KEYS.steps, next);

      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      steps: steps,
      available: available,
      refresh: refresh,
      setGoal: setGoal,
      unlocked: unlockedStickers(steps.streak),
    }),
    [
      steps,
      available,
      refresh,
      setGoal,
    ],
  );

  return (
    <StepsContext.Provider value={value}>
      {children}
    </StepsContext.Provider>
  );
}

export function useSteps() {
  return useContext(StepsContext);
}

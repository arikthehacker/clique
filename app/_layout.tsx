/**
 * ==============================
 * FILE: app/_layout.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The root layout every screen renders inside. Loads fonts, mounts the
 * providers, and keeps signed-out users out of the app screens.
 *
 * Includes:
 * - Splash screen held until fonts load, with a timeout
 * - Gesture, safe area and error boundary wrappers
 * - Auth, group, planning, memory, calendar and steps providers
 * - Redirect to /auth when nobody is signed in
 */

import {
  ReactNode,
  useEffect,
  useState,
} from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import { useFonts } from 'expo-font';
import {
  Slot,
  SplashScreen,
  useRouter,
  useSegments,
} from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ErrorBoundary from '../src/components/ErrorBoundary';
import {
  AuthProvider,
  useAuth,
} from '../src/context/AuthContext';
import { CalendarProvider } from '../src/context/CalendarContext';
import { GroupProvider } from '../src/context/GroupContext';
import { MemoryProvider } from '../src/context/MemoryContext';
import { PlanningProvider } from '../src/context/PlanningContext';
import { StepsProvider } from '../src/context/StepsContext';
import { configureNotifications } from '../src/lib/notifications';

// keep the splash up while fonts load
SplashScreen.preventAutoHideAsync();

configureNotifications();

const FONT_TIMEOUT_MS = 4000;

// screens that need a signed-in user
const PROTECTED_SEGMENTS = [
  'home',
  'groupchat',
  'memory',
  'calendar',
  'avatar',
  'welcome',
  'questions',
  'plan',
  'widget',
];

function RouteGuard({ children }: { children: ReactNode }) {
  const {
    user,
    loading,
  } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    const inProtectedArea = PROTECTED_SEGMENTS.includes(segments[0] ?? '');

    // no session, no app screens
    if (!user && inProtectedArea) {
      router.replace('/auth');
    }
  }, [
    user,
    loading,
    segments,
    router,
  ]);

  // screens wait for the saved account so their fields start filled in
  if (loading) {
    return <View style={styles.loading} />;
  }

  return <>{children}</>;
}

export default function Layout() {
  const [
    fontsLoaded,
    fontError,
  ] = useFonts({
    'Gaegu-Regular': require('../assets/fonts/Gaegu-Regular.ttf'),
    'Gaegu-Bold': require('../assets/fonts/Gaegu-Bold.ttf'),
    'Gaegu-Light': require('../assets/fonts/Gaegu-Light.ttf'),
    'Outfit-Regular': require('../assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Light': require('../assets/fonts/Outfit-Light.ttf'),
    'Figtree-Regular': require('../assets/fonts/Figtree-Regular.ttf'),
    'Figtree-Light': require('../assets/fonts/Figtree-Light.ttf'),
    'Figtree-SemiBold': require('../assets/fonts/Figtree-SemiBold.ttf'),
  });

  const [
    timedOut,
    setTimedOut,
  ] = useState(false);

  useEffect(() => {
    // fonts hanging? show the app anyway
    const timer = setTimeout(() => setTimedOut(true), FONT_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, []);

  const ready = fontsLoaded || Boolean(fontError) || timedOut;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AuthProvider>
            <GroupProvider>
              <PlanningProvider>
                <MemoryProvider>
                  <CalendarProvider>
                    <StepsProvider>
                      <RouteGuard>
                        <Slot />
                      </RouteGuard>
                    </StepsProvider>
                  </CalendarProvider>
                </MemoryProvider>
              </PlanningProvider>
            </GroupProvider>
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// layout styling
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#F1E3C0',
  },
});

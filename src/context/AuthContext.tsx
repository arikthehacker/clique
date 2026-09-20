/**
 * ==============================
 * FILE: src/context/AuthContext.tsx
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Holds the signed-in user for the whole app and lets any screen sign up,
 * sign in, sign out, and edit the profile.
 *
 * Includes:
 * - Signed-in user and loading state
 * - Sign up, sign in, sign out
 * - Profile edits: username, avatar, bio, phone, answers, switches, plan
 * - Blocking and unblocking by username
 * - Filing reports and listing the ones you filed
 *
 * Notes:
 * - Uses Firebase Auth and users/{uid} when Firebase is configured.
 * - Otherwise the one account lives in AsyncStorage on this phone.
 * - Reports are also kept on the phone so the Reports list can show them.
 * - The root layout reads user and loading to guard the /home routes.
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

import * as authService from '../firebase/authService';
import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import { uploadImage } from '../firebase/storageService';
import {
  addReport,
  updateUserProfile,
} from '../firebase/userService';
import { normalizeUsername } from '../lib/groups';
import { makeReferralCode } from '../lib/plans';
import {
  loadJson,
  removeJson,
  saveJson,
  STORAGE_KEYS,
} from '../lib/storage';
import {
  Answers,
  AuthUser,
  FrameType,
  Plan,
  Report,
} from '../types';

type ProfilePatch = {
  username?: string;
  avatarUri?: string | null;
  avatarFrame?: FrameType;
  bio?: string;
  phone?: string;
  answers?: Answers | null;
  offGrid?: boolean;
  simpleMode?: boolean;
  plan?: Plan;
  referredCount?: number;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  isDemo: boolean;
  reports: Report[];
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<void>;
  blockUser: (username: string) => Promise<void>;
  unblockUser: (username: string) => Promise<void>;
  fileReport: (about: string, reason: string) => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  isDemo: true,
  reports: [],
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  updateProfile: async () => {},
  blockUser: async () => {},
  unblockUser: async () => {},
  fileReport: async () => {},
});

function freshDemoUser(email: string): AuthUser {
  const uid = `local-${Date.now()}`;

  return {
    uid: uid,
    email: email,
    username: '',
    avatarUri: null,
    avatarFrame: 'none',
    bio: '',
    phone: '',
    answers: null,
    blocked: [],
    offGrid: false,
    simpleMode: false,
    plan: 'free',
    trialStartedAt: Date.now(),
    referralCode: makeReferralCode(uid),
    referredCount: 0,
  };
}

// fills in fields older saved sessions are missing
function withDefaults(saved: Partial<AuthUser> | null): AuthUser | null {
  if (!saved || !saved.uid) {
    return null;
  }

  return {
    uid: saved.uid,
    email: saved.email ?? null,
    username: saved.username ?? '',
    avatarUri: saved.avatarUri ?? null,
    avatarFrame: saved.avatarFrame ?? 'none',
    bio: saved.bio ?? '',
    phone: saved.phone ?? '',
    answers: saved.answers ?? null,
    blocked: saved.blocked ?? [],
    offGrid: saved.offGrid ?? false,
    simpleMode: saved.simpleMode ?? false,
    plan: saved.plan ?? 'free',
    trialStartedAt: saved.trialStartedAt ?? Date.now(),
    referralCode: saved.referralCode ?? makeReferralCode(saved.uid),
    referredCount: saved.referredCount ?? 0,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [
    user,
    setUser,
  ] = useState<AuthUser | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    reports,
    setReports,
  ] = useState<Report[]>([]);

  useEffect(() => {
    loadJson<Report[]>(STORAGE_KEYS.reports, []).then(setReports);

    if (isFirebaseConfigured) {
      return authService.subscribeToAuth((nextUser) => {
        setUser(nextUser);
        setLoading(false);
      });
    }

    // whoever was saved last time is still signed in
    loadJson<Partial<AuthUser> | null>(STORAGE_KEYS.user, null).then((saved) => {
      setUser(withDefaults(saved));
      setLoading(false);
    });

    return undefined;
  }, []);

  const persist = useCallback(async (nextUser: AuthUser) => {
    if (isFirebaseConfigured) {
      await updateUserProfile(nextUser.uid, {
        username: nextUser.username,
        avatarUri: nextUser.avatarUri,
        avatarFrame: nextUser.avatarFrame,
        bio: nextUser.bio,
        phone: nextUser.phone,
        answers: nextUser.answers,
        blocked: nextUser.blocked,
        offGrid: nextUser.offGrid,
        simpleMode: nextUser.simpleMode,
        plan: nextUser.plan,
        referredCount: nextUser.referredCount,
      });
    } else {
      await saveJson(STORAGE_KEYS.user, nextUser);
    }

    setUser(nextUser);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (isFirebaseConfigured) {
      setUser(await authService.signUp(email, password));
      return;
    }

    const demoUser = freshDemoUser(email);

    await saveJson(STORAGE_KEYS.user, demoUser);
    setUser(demoUser);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isFirebaseConfigured) {
      setUser(await authService.signIn(email, password));
      return;
    }

    // brings back the account saved on this phone
    const saved = withDefaults(await loadJson<Partial<AuthUser> | null>(STORAGE_KEYS.user, null));
    const demoUser = saved ?? freshDemoUser(email);

    await saveJson(STORAGE_KEYS.user, demoUser);
    setUser(demoUser);
  }, []);

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured) {
      await authService.signOut();
    } else {
      await removeJson(STORAGE_KEYS.user);
    }

    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: ProfilePatch) => {
      if (!user) {
        return;
      }

      let avatarUri = patch.avatarUri;

      // uploads a new avatar so the group can see it
      if (isFirebaseConfigured && avatarUri && avatarUri.startsWith('file:')) {
        avatarUri = await uploadImage(user.uid, 'avatars', avatarUri);
      }

      await persist({
        ...user,
        ...patch,
        avatarUri: avatarUri === undefined ? user.avatarUri : avatarUri,
      });
    },
    [
      user,
      persist,
    ],
  );

  const blockUser = useCallback(
    async (username: string) => {
      const name = normalizeUsername(username);

      if (!user || !name || user.blocked.includes(name)) {
        return;
      }

      await persist({
        ...user,
        blocked: [
          ...user.blocked,
          name,
        ],
      });
    },
    [
      user,
      persist,
    ],
  );

  const unblockUser = useCallback(
    async (username: string) => {
      if (!user) {
        return;
      }

      const name = normalizeUsername(username);

      await persist({
        ...user,
        blocked: user.blocked.filter((entry) => entry !== name),
      });
    },
    [
      user,
      persist,
    ],
  );

  const fileReport = useCallback(
    async (about: string, reason: string) => {
      if (!user) {
        return;
      }

      const report: Report = {
        id: Date.now().toString(),
        about: about.trim(),
        reason: reason.trim(),
        createdAt: Date.now(),
      };

      if (isFirebaseConfigured) {
        await addReport(user.uid, report.about, report.reason);
      }

      const nextReports = [
        report,
        ...reports,
      ];

      setReports(nextReports);
      await saveJson(STORAGE_KEYS.reports, nextReports);
    },
    [
      user,
      reports,
    ],
  );

  const value = useMemo(
    () => ({
      user: user,
      loading: loading,
      isDemo: !isFirebaseConfigured,
      reports: reports,
      signUp: signUp,
      signIn: signIn,
      signOut: signOut,
      updateProfile: updateProfile,
      blockUser: blockUser,
      unblockUser: unblockUser,
      fileReport: fileReport,
    }),
    [
      user,
      loading,
      reports,
      signUp,
      signIn,
      signOut,
      updateProfile,
      blockUser,
      unblockUser,
      fileReport,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

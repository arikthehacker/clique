/**
 * ==============================
 * FILE: src/firebase/authService.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Email and password auth, plus the listener AuthContext uses to know who is
 * signed in.
 *
 * Includes:
 * - signUp, creates the account and its users/{uid} profile
 * - signIn and signOut
 * - subscribeToAuth, fires on every sign in and sign out
 *
 * Notes:
 * - Errors are thrown as-is. Screens word them with mapAuthError.
 * - Missing profile fields fall back to defaults.
 */

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';

import { makeReferralCode } from '../lib/plans';
import { AuthUser } from '../types';
import { requireAuth } from './firebaseConfig';
import {
  createUserProfile,
  fetchUserProfile,
} from './userService';

async function toAuthUser(user: User): Promise<AuthUser> {
  const profile = await fetchUserProfile(user.uid);

  return {
    uid: user.uid,
    email: user.email,
    username: profile?.username ?? '',
    avatarUri: profile?.avatarUri ?? null,
    answers: profile?.answers ?? null,
    blocked: profile?.blocked ?? [],
    avatarFrame: profile?.avatarFrame ?? 'none',
    bio: profile?.bio ?? '',
    phone: profile?.phone ?? '',
    offGrid: profile?.offGrid ?? false,
    simpleMode: profile?.simpleMode ?? false,
    plan: profile?.plan ?? 'free',
    trialStartedAt: profile?.trialStartedAt ?? Date.now(),
    referralCode: profile?.referralCode ?? makeReferralCode(user.uid),
    referredCount: profile?.referredCount ?? 0,
  };
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const credential = await createUserWithEmailAndPassword(requireAuth(), email, password);

  await createUserProfile(credential.user.uid, '', null, makeReferralCode(credential.user.uid));

  return toAuthUser(credential.user);
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const credential = await signInWithEmailAndPassword(requireAuth(), email, password);

  return toAuthUser(credential.user);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(requireAuth());
}

export function subscribeToAuth(onChange: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(requireAuth(), async (user) => {
    if (!user) {
      onChange(null);
      return;
    }

    onChange(await toAuthUser(user));
  });
}

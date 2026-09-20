/**
 * ==============================
 * FILE: src/firebase/userService.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Reads and writes the users/{uid} profile document.
 *
 * Includes:
 * - createUserProfile, once at sign up
 * - updateUserProfile
 * - fetchUserProfile
 * - findUserByUsername, turns an invite name into a uid
 * - addReport, one document under users/{uid}/reports
 *
 * Notes:
 * - Usernames are not unique yet. The first match wins on invite.
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { normalizeUsername } from '../lib/groups';
import {
  Answers,
  FRAMES,
  FrameType,
  MemberProfile,
  Plan,
} from '../types';
import { requireDb } from './firebaseConfig';

export type UserProfile = {
  username: string;
  avatarUri: string | null;
  avatarFrame: FrameType;
  bio: string;
  phone: string;
  answers: Answers | null;
  blocked: string[];
  offGrid: boolean;
  simpleMode: boolean;
  plan: Plan;
  trialStartedAt: number;
  referralCode: string;
  referredCount: number;
};

const PLANS: Plan[] = ['free', 'starter', 'pro'];

function toProfile(data: Record<string, unknown>): UserProfile {
  const answers = data.answers as Partial<Answers> | undefined;

  return {
    username: typeof data.username === 'string' ? data.username : '',
    avatarUri: typeof data.avatarUri === 'string' ? data.avatarUri : null,
    answers:
      answers && typeof answers === 'object'
        ? {
            vibe: String(answers.vibe ?? ''),
            love: String(answers.love ?? ''),
            connect: String(answers.connect ?? ''),
          }
        : null,
    blocked: Array.isArray(data.blocked) ? data.blocked.map(String) : [],
    avatarFrame: FRAMES.includes(data.avatarFrame as FrameType) ? (data.avatarFrame as FrameType) : 'none',
    bio: typeof data.bio === 'string' ? data.bio : '',
    phone: typeof data.phone === 'string' ? data.phone : '',
    offGrid: Boolean(data.offGrid),
    simpleMode: Boolean(data.simpleMode),
    plan: PLANS.includes(data.plan as Plan) ? (data.plan as Plan) : 'free',
    trialStartedAt: Number(data.trialStartedAt ?? 0),
    referralCode: typeof data.referralCode === 'string' ? data.referralCode : '',
    referredCount: Number(data.referredCount ?? 0),
  };
}

export async function createUserProfile(
  userId: string,
  username: string,
  avatarUri: string | null,
  referralCode: string,
): Promise<void> {
  await setDoc(doc(requireDb(), 'users', userId), {
    username: username,
    usernameLower: normalizeUsername(username),
    avatarUri: avatarUri,
    avatarFrame: 'none',
    bio: '',
    phone: '',
    answers: null,
    blocked: [],
    offGrid: false,
    simpleMode: false,
    plan: 'free',
    trialStartedAt: Date.now(),
    referralCode: referralCode,
    referredCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  userId: string,
  patch: Partial<UserProfile>,
): Promise<void> {
  await updateDoc(doc(requireDb(), 'users', userId), {
    ...patch,
    ...(patch.username !== undefined ? { usernameLower: normalizeUsername(patch.username) } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(requireDb(), 'users', userId));

  if (!snapshot.exists()) {
    return null;
  }

  return toProfile(snapshot.data());
}

export async function findUserByUsername(
  username: string,
): Promise<{ uid: string; profile: MemberProfile } | null> {
  const lookup = query(
    collection(requireDb(), 'users'),
    where('usernameLower', '==', normalizeUsername(username)),
    limit(1),
  );

  const snapshot = await getDocs(lookup);
  const match = snapshot.docs[0];

  if (!match) {
    return null;
  }

  const profile = toProfile(match.data());

  return {
    uid: match.id,
    profile: {
      username: profile.username,
      avatarUri: profile.avatarUri,
    },
  };
}

export async function addReport(
  userId: string,
  about: string,
  reason: string,
): Promise<void> {
  await addDoc(collection(requireDb(), 'users', userId, 'reports'), {
    about: about,
    reason: reason,
    createdAt: serverTimestamp(),
  });
}

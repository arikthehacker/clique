/**
 * ==============================
 * FILE: src/types.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The data model the screens, contexts and Firebase services share.
 *
 * Includes:
 * - AuthUser, the signed-in user and their profile, plan and referral fields
 * - Group, members, invites and the memory reminder schedule
 * - Message
 * - Poll, Todo, DailyQuestion and Expense, the planning tools
 * - CalendarEvent, AvailabilitySlot and BusyBlock
 * - Memory, with its frame, stickers, reactions and replies
 * - StepsState and Report
 *
 * Notes:
 * - Timestamps are epoch milliseconds on the client.
 */

export type Answers = {
  vibe: string;
  love: string;
  connect: string;
};

export const FRAMES = [
  'polaroid',
  'vintage',
  'none',
] as const;

export type FrameType = typeof FRAMES[number];

export type Plan = 'free' | 'starter' | 'pro';

export type AuthUser = {
  uid: string;
  email: string | null;
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

export type MemberProfile = {
  username: string;
  avatarUri: string | null;
};

export type MemorySchedule = {
  hour: number;
  minute: number;
  weekdays: number[];
};

export type Group = {
  id: string;
  name: string;
  imageUri: string | null;
  createdBy: string;
  members: string[];
  profiles: Record<string, MemberProfile>;
  invites: string[];
  schedule: MemorySchedule | null;
  createdAt: number;
};

export type MessageKind = 'text' | 'photo' | 'poll' | 'nudge' | 'system';

export type Message = {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  kind: MessageKind;
  text: string;
  imageUri: string | null;
  refId: string | null;
  createdAt: number;
};

export type PollOption = {
  id: string;
  text: string;
  votes: string[];
};

export type Poll = {
  id: string;
  groupId: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  closed: boolean;
  createdAt: number;
};

export type Todo = {
  id: string;
  groupId: string;
  text: string;
  done: boolean;
  assignedTo: string | null;
  createdBy: string;
  createdAt: number;
};

export type QuestionAnswer = {
  text: string;
  memoryUri: string | null;
  at: number;
};

export type DailyQuestion = {
  id: string;
  groupId: string;
  date: string;
  prompt: string;
  askedBy: string | null;
  answers: Record<string, QuestionAnswer>;
};

export type RsvpStatus = 'going' | 'maybe' | 'no';

export type Expense = {
  id: string;
  groupId: string;
  title: string;
  amountCents: number;
  paidBy: string;
  splitAmong: string[];
  createdAt: number;
};

export type StepsState = {
  stepsToday: number;
  date: string;
  streak: number;
  goal: number;
};

export type CalendarEvent = {
  id: string;
  groupId: string | null;
  title: string;
  date: string;
  time: string | null;
  reminder: boolean;
  color: string | null;
  rsvps: Record<string, RsvpStatus>;
};

export type AvailabilitySlot = {
  date: string;
  start: string;
  end: string;
};

export type MemberAvailability = {
  uid: string;
  username: string;
  slots: AvailabilitySlot[];
};

export type BusyBlock = {
  id: string;
  date: string;
  start: string;
  end: string;
};

export type Sticker = {
  art: string;
  x: number;
  y: number;
};

export type Reply = {
  id: string;
  uid: string;
  name: string;
  text: string;
  at: number;
};

export type Memory = {
  id: string;
  groupId: string | null;
  uri: string;
  frame: FrameType;
  caption: string;
  stickers: Sticker[];
  reactions: Record<string, string>;
  replies: Reply[];
  createdAt: number;
};

export type Report = {
  id: string;
  about: string;
  reason: string;
  createdAt: number;
};

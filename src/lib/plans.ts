/**
 * ==============================
 * FILE: src/lib/plans.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Plan tiers, the free trial and referral rules.
 *
 * Includes:
 * - PLAN_DETAILS, price and perks per tier
 * - trialDaysLeft and effectivePlan, pro for the whole trial
 * - canCreateGroup and hasSharedCalendar, what each tier allows
 * - makeReferralCode, six stable characters from the uid
 * - referralDiscount and priceAfterDiscount
 *
 * Notes:
 * - No payments yet. A plan is only a label for now.
 */

import { Plan } from '../types';

export const TRIAL_DAYS = 90;
export const FREE_GROUP_LIMIT = 10;
export const REFERRALS_FOR_DISCOUNT = 4;
const REFERRAL_DISCOUNT_PERCENT = 25;

export type PlanDetails = {
  plan: Plan;
  name: string;
  pricePerYear: number;
  perks: string[];
};

export const PLAN_DETAILS: PlanDetails[] = [
  {
    plan: 'free',
    name: 'Clique Free',
    pricePerYear: 0,
    perks: [
      `Up to ${FREE_GROUP_LIMIT} group chats`,
      'Text and photos',
      'The memory widget with basic frames',
    ],
  },
  {
    plan: 'starter',
    name: 'Clique Starter',
    pricePerYear: 25,
    perks: [
      'Unlimited group chats',
      'Full memory widget: all frames and stickers',
      'Polls, to-dos, daily questions, reminders',
    ],
  },
  {
    plan: 'pro',
    name: 'Clique Pro',
    pricePerYear: 30,
    perks: [
      'Everything in Starter',
      'Shared group calendar with find-a-time',
      'Every customization option',
    ],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function trialDaysLeft(trialStartedAt: number, now: number = Date.now()): number {
  const used = Math.floor((now - trialStartedAt) / DAY_MS);

  return Math.max(0, TRIAL_DAYS - used);
}

export function effectivePlan(plan: Plan, trialStartedAt: number, now: number = Date.now()): Plan {
  return trialDaysLeft(trialStartedAt, now) > 0 ? 'pro' : plan;
}

export function canCreateGroup(plan: Plan, groupCount: number): boolean {
  return plan !== 'free' || groupCount < FREE_GROUP_LIMIT;
}

export function hasSharedCalendar(plan: Plan): boolean {
  return plan === 'pro';
}

export function makeReferralCode(uid: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let value = 7;

  for (let index = 0; index < uid.length; index += 1) {
    value = (value * 31 + uid.charCodeAt(index)) >>> 0;
  }

  let code = '';

  for (let index = 0; index < 6; index += 1) {
    code += alphabet[value % alphabet.length];
    value = Math.floor(value / alphabet.length) ^ (value << 5);
    value = value >>> 0;
  }

  return code;
}

export function referralDiscount(referredCount: number): number {
  return referredCount >= REFERRALS_FOR_DISCOUNT ? REFERRAL_DISCOUNT_PERCENT : 0;
}

export function priceAfterDiscount(pricePerYear: number, referredCount: number): number {
  return Math.round(pricePerYear * (1 - referralDiscount(referredCount) / 100) * 100) / 100;
}

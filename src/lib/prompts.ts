/**
 * ==============================
 * FILE: src/lib/prompts.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * The daily question prompts.
 *
 * Includes:
 * - PROMPTS, the built-in list
 * - promptFor, the same question for the whole group all day
 *
 * Notes:
 * - A member can swap in their own question. That lives on DailyQuestion.
 */

export const PROMPTS = [
  'What made you smile today?',
  'What are you eating right now?',
  'Song stuck in your head?',
  'One thing you are looking forward to this week?',
  'Show us your view right now.',
  'What would you do with a free afternoon?',
  'Best thing you saw today?',
  'What is something small you are grateful for?',
  'If we all met up this weekend, where would we go?',
  'What are you procrastinating on?',
  'Last thing that made you laugh?',
  'What is your energy level, 1 to 10?',
  'Something you want to learn this year?',
  'What would you cook for all of us?',
  'Describe your day in three words.',
  'What is on your desk or table right now?',
  'A photo of the sky where you are?',
  'One thing you would tell your younger self?',
  'What are you wearing today?',
  'Who do you wish was here right now?',
];

function hash(input: string): number {
  let value = 0;

  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) >>> 0;
  }

  return value;
}

export function promptFor(date: string, groupId: string): string {
  return PROMPTS[hash(`${date}:${groupId}`) % PROMPTS.length];
}

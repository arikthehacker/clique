/**
 * ==============================
 * FILE: src/lib/polls.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Poll logic: building one, voting and tallying.
 *
 * Includes:
 * - buildPoll, from a question and options, blanks dropped
 * - castVote, one vote per person, voting again moves it
 * - tally, counts and percentages per option
 * - votedOption, what a person picked
 *
 * Notes:
 * - Single choice, two to six options.
 */

import {
  Poll,
  PollOption,
} from '../types';

const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 6;
const MAX_QUESTION_LENGTH = 140;

export function buildPoll(
  groupId: string,
  question: string,
  optionTexts: string[],
  createdBy: string,
  now: number,
): Poll | string {
  const cleanQuestion = question.trim();

  if (!cleanQuestion) {
    return 'Ask something first.';
  }

  if (cleanQuestion.length > MAX_QUESTION_LENGTH) {
    return `Keep the question under ${MAX_QUESTION_LENGTH} characters.`;
  }

  const options: PollOption[] = optionTexts
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .slice(0, MAX_OPTIONS)
    .map((text, index) => ({
      id: `${now}-${index}`,
      text: text,
      votes: [],
    }));

  if (options.length < MIN_OPTIONS) {
    return 'A poll needs at least two options.';
  }

  return {
    id: now.toString(),
    groupId: groupId,
    question: cleanQuestion,
    options: options,
    createdBy: createdBy,
    closed: false,
    createdAt: now,
  };
}

export function castVote(poll: Poll, optionId: string, uid: string): Poll {
  if (poll.closed) {
    return poll;
  }

  return {
    ...poll,
    options: poll.options.map((option) => {
      const without = option.votes.filter((voter) => voter !== uid);

      return {
        ...option,
        votes: option.id === optionId ? [...without, uid] : without,
      };
    }),
  };
}

export function votedOption(poll: Poll, uid: string): string | null {
  return poll.options.find((option) => option.votes.includes(uid))?.id ?? null;
}

export type Tally = {
  optionId: string;
  count: number;
  percent: number;
};

export function tally(poll: Poll): { total: number; rows: Tally[] } {
  const total = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

  return {
    total: total,
    rows: poll.options.map((option) => ({
      optionId: option.id,
      count: option.votes.length,
      percent: total === 0 ? 0 : Math.round((option.votes.length / total) * 100),
    })),
  };
}

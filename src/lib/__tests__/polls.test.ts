import {
  buildPoll,
  castVote,
  tally,
  votedOption,
} from '../polls';
import {
  promptFor,
  PROMPTS,
} from '../prompts';
import { Poll } from '../../types';

function poll(): Poll {
  const built = buildPoll('g1', 'Pizza or tacos?', ['Pizza', 'Tacos', ''], 'me', 1000);

  if (typeof built === 'string') {
    throw new Error(built);
  }

  return built;
}

describe('buildPoll', () => {
  it('drops blank options and keeps order', () => {
    expect(poll().options.map((option) => option.text)).toEqual(['Pizza', 'Tacos']);
  });

  it('rejects a blank question or too few options', () => {
    expect(buildPoll('g1', '   ', ['a', 'b'], 'me', 1)).toMatch(/Ask/);
    expect(buildPoll('g1', 'q', ['a', ' '], 'me', 1)).toMatch(/two options/);
  });

  it('caps options at six', () => {
    const built = buildPoll('g1', 'q', ['1', '2', '3', '4', '5', '6', '7'], 'me', 1);

    expect(typeof built === 'string' ? 0 : built.options.length).toBe(6);
  });
});

describe('castVote', () => {
  it('is single choice: a second vote moves the first', () => {
    const [pizza, tacos] = poll().options;
    let voted = castVote(poll(), pizza.id, 'me');

    expect(votedOption(voted, 'me')).toBe(pizza.id);

    voted = castVote(voted, tacos.id, 'me');

    expect(votedOption(voted, 'me')).toBe(tacos.id);
    expect(voted.options[0].votes).toEqual([]);
  });

  it('ignores votes on a closed poll', () => {
    const closed = { ...poll(), closed: true };

    expect(castVote(closed, closed.options[0].id, 'me')).toBe(closed);
  });
});

describe('tally', () => {
  it('counts and rounds percentages', () => {
    const [pizza, tacos] = poll().options;
    let voted = castVote(poll(), pizza.id, 'a');
    voted = castVote(voted, pizza.id, 'b');
    voted = castVote(voted, tacos.id, 'c');

    const result = tally(voted);

    expect(result.total).toBe(3);
    expect(result.rows[0]).toEqual({ optionId: pizza.id, count: 2, percent: 67 });
    expect(result.rows[1]).toEqual({ optionId: tacos.id, count: 1, percent: 33 });
  });

  it('is all zeros with no votes', () => {
    expect(tally(poll()).rows.every((row) => row.percent === 0)).toBe(true);
  });
});

describe('promptFor', () => {
  it('is the same for the same day and group, and comes from the list', () => {
    const a = promptFor('2026-09-18', 'g1');

    expect(a).toBe(promptFor('2026-09-18', 'g1'));
    expect(PROMPTS).toContain(a);
  });

  it('differs across days for the same group, at least sometimes', () => {
    const picks = new Set(
      ['2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21', '2026-09-22'].map((date) =>
        promptFor(date, 'g1'),
      ),
    );

    expect(picks.size).toBeGreaterThan(1);
  });
});

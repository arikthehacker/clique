import {
  balances,
  formatAmount,
  parseAmount,
  settleUp,
} from '../expenses';
import {
  advanceStreak,
  lockedSets,
  STICKER_SETS,
  unlockedStickers,
} from '../steps';
import { Expense } from '../../types';

const expense = (paidBy: string, amountCents: number, splitAmong: string[]): Expense => ({
  id: `${paidBy}-${amountCents}`,
  groupId: 'g1',
  title: 'x',
  amountCents: amountCents,
  paidBy: paidBy,
  splitAmong: splitAmong,
  createdAt: 1,
});

describe('parseAmount and formatAmount', () => {
  it('reads dollars and cents, rejects junk', () => {
    expect(parseAmount('12.5')).toBe(1250);
    expect(parseAmount('$1,000')).toBe(100000);
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('1.234')).toBeNull();
  });

  it('formats with a sign', () => {
    expect(formatAmount(1250)).toBe('$12.50');
    expect(formatAmount(-5)).toBe('-$0.05');
  });
});

describe('balances', () => {
  it('nets who paid against who owes, cents exact', () => {
    const net = balances([
      expense('a', 3000, ['a', 'b', 'c']),
      expense('b', 1000, ['a', 'b']),
    ]);

    expect(net).toEqual({ a: 1500, b: -500, c: -1000 });
    expect(Object.values(net).reduce((sum, cents) => sum + cents, 0)).toBe(0);
  });

  it('gives leftover cents to the first people in the split', () => {
    const net = balances([expense('a', 1000, ['a', 'b', 'c'])]);

    // a paid 1000 and owes 334
    expect(net).toEqual({ a: 666, b: -333, c: -333 });
  });
});

describe('settleUp', () => {
  it('zeros the balances with few transfers', () => {
    const transfers = settleUp({ a: 1500, b: -500, c: -1000 });

    expect(transfers).toEqual([
      { from: 'c', to: 'a', cents: 1000 },
      { from: 'b', to: 'a', cents: 500 },
    ]);
  });

  it('is empty when everyone is square', () => {
    expect(settleUp({ a: 0, b: 0 })).toEqual([]);
  });
});

describe('advanceStreak', () => {
  const base = { goal: 6000, today: '2026-09-18', yesterday: '2026-09-17' };

  it('continues from yesterday when the goal is met', () => {
    expect(advanceStreak({ ...base, streak: 3, lastDate: '2026-09-17', stepsToday: 7000 })).toBe(4);
  });

  it('holds when the goal is not met yet today', () => {
    expect(advanceStreak({ ...base, streak: 3, lastDate: '2026-09-17', stepsToday: 100 })).toBe(3);
  });

  it('resets after a missed day', () => {
    expect(advanceStreak({ ...base, streak: 9, lastDate: '2026-09-10', stepsToday: 7000 })).toBe(1);
    expect(advanceStreak({ ...base, streak: 9, lastDate: '2026-09-10', stepsToday: 100 })).toBe(0);
  });

  it('does not double count the same day', () => {
    expect(advanceStreak({ ...base, streak: 4, lastDate: '2026-09-18', stepsToday: 9000 })).toBe(4);
  });
});

describe('sticker sets', () => {
  it('unlock in order of streak', () => {
    expect(unlockedStickers(0)).toEqual(STICKER_SETS[0].stickers);
    expect(unlockedStickers(7)).toHaveLength(
      STICKER_SETS[0].stickers.length + STICKER_SETS[1].stickers.length + STICKER_SETS[2].stickers.length,
    );
    expect(lockedSets(3).map((set) => set.streak)).toEqual([7, 30]);
  });
});

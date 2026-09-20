/**
 * ==============================
 * FILE: src/lib/expenses.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Expense splitting for a group: who paid, who owes, and how to settle up.
 *
 * Includes:
 * - parseAmount, "12.50" to cents, null for junk
 * - formatAmount, cents back to "$12.50"
 * - balances, net cents per member
 * - settleUp, the "A pays B" list that zeros everyone out
 *
 * Notes:
 * - Amounts are integer cents. Extra cents go to the first people in the split.
 */

import { Expense } from '../types';

export function parseAmount(text: string): number | null {
  const clean = text.trim().replace(/[$,\s]/g, '');

  if (!/^\d+(\.\d{0,2})?$/.test(clean)) {
    return null;
  }

  const [whole, fraction = ''] = clean.split('.');
  const cents = Number(whole) * 100 + Number((fraction + '00').slice(0, 2));

  return cents > 0 ? cents : null;
}

export function formatAmount(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);

  return `${sign}$${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`;
}

export function balances(expenses: Expense[]): Record<string, number> {
  const net: Record<string, number> = {};

  for (const expense of expenses) {
    const people = expense.splitAmong.length > 0 ? expense.splitAmong : [expense.paidBy];
    const share = Math.floor(expense.amountCents / people.length);
    const extra = expense.amountCents - share * people.length;

    net[expense.paidBy] = (net[expense.paidBy] ?? 0) + expense.amountCents;

    people.forEach((uid, index) => {
      const owes = share + (index < extra ? 1 : 0);

      net[uid] = (net[uid] ?? 0) - owes;
    });
  }

  return net;
}

export type Transfer = {
  from: string;
  to: string;
  cents: number;
};

export function settleUp(net: Record<string, number>): Transfer[] {
  const debtors = Object.entries(net)
    .filter(([, cents]) => cents < 0)
    .map(([uid, cents]) => ({
      uid: uid,
      cents: -cents,
    }))
    .sort((a, b) => b.cents - a.cents);

  const creditors = Object.entries(net)
    .filter(([, cents]) => cents > 0)
    .map(([uid, cents]) => ({
      uid: uid,
      cents: cents,
    }))
    .sort((a, b) => b.cents - a.cents);

  const transfers: Transfer[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const amount = Math.min(debtors[d].cents, creditors[c].cents);

    if (amount > 0) {
      transfers.push({
        from: debtors[d].uid,
        to: creditors[c].uid,
        cents: amount,
      });
    }

    debtors[d].cents -= amount;
    creditors[c].cents -= amount;

    if (debtors[d].cents === 0) {
      d += 1;
    }

    if (creditors[c].cents === 0) {
      c += 1;
    }
  }

  return transfers;
}

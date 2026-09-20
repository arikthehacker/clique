import {
  canCreateGroup,
  effectivePlan,
  FREE_GROUP_LIMIT,
  makeReferralCode,
  priceAfterDiscount,
  referralDiscount,
  trialDaysLeft,
  TRIAL_DAYS,
} from '../plans';

const DAY = 24 * 60 * 60 * 1000;

describe('trial', () => {
  it('counts down from the start date and stops at zero', () => {
    expect(trialDaysLeft(1000, 1000)).toBe(TRIAL_DAYS);
    expect(trialDaysLeft(1000, 1000 + 10 * DAY)).toBe(TRIAL_DAYS - 10);
    expect(trialDaysLeft(1000, 1000 + 500 * DAY)).toBe(0);
  });

  it('is pro during the trial, then the chosen plan', () => {
    expect(effectivePlan('free', 1000, 1000 + DAY)).toBe('pro');
    expect(effectivePlan('free', 1000, 1000 + 200 * DAY)).toBe('free');
    expect(effectivePlan('starter', 1000, 1000 + 200 * DAY)).toBe('starter');
  });
});

describe('canCreateGroup', () => {
  it('caps the free tier and nobody else', () => {
    expect(canCreateGroup('free', FREE_GROUP_LIMIT - 1)).toBe(true);
    expect(canCreateGroup('free', FREE_GROUP_LIMIT)).toBe(false);
    expect(canCreateGroup('starter', 999)).toBe(true);
  });
});

describe('referrals', () => {
  it('makes a stable six character code without confusing letters', () => {
    const code = makeReferralCode('local-1234');

    expect(code).toHaveLength(6);
    expect(code).toBe(makeReferralCode('local-1234'));
    expect(code).not.toMatch(/[01IO]/);
    expect(makeReferralCode('other')).not.toBe(code);
  });

  it('earns the discount at four invites', () => {
    expect(referralDiscount(3)).toBe(0);
    expect(referralDiscount(4)).toBe(25);
    expect(priceAfterDiscount(30, 4)).toBe(22.5);
    expect(priceAfterDiscount(30, 0)).toBe(30);
  });
});

import {
  freeWindows,
  mergeSlots,
  subtractBusy,
  toClock,
  toMinutes,
} from '../availability';

const day = '2026-09-20';

describe('toMinutes and toClock', () => {
  it('round trip', () => {
    expect(toMinutes('09:30')).toBe(570);
    expect(toClock(570)).toBe('09:30');
    expect(toClock(0)).toBe('00:00');
  });
});

describe('mergeSlots', () => {
  it('folds overlapping and touching windows', () => {
    const merged = mergeSlots([
      { start: 600, end: 720 },
      { start: 700, end: 800 },
      { start: 800, end: 840 },
      { start: 900, end: 960 },
      { start: 500, end: 400 },
    ]);

    expect(merged).toEqual([
      { start: 600, end: 840 },
      { start: 900, end: 960 },
    ]);
  });
});

describe('freeWindows', () => {
  const me = [
    { date: day, start: '09:00', end: '12:00' },
    { date: day, start: '14:00', end: '18:00' },
  ];

  const friend = [
    { date: day, start: '11:00', end: '15:00' },
    { date: day, start: '17:00', end: '20:00' },
  ];

  it('finds the overlaps long enough', () => {
    expect(freeWindows([me, friend], day, 60)).toEqual([
      { start: 660, end: 720 },
      { start: 840, end: 900 },
      { start: 1020, end: 1080 },
    ]);
  });

  it('drops windows shorter than the minimum', () => {
    expect(freeWindows([me, friend], day, 90)).toEqual([]);
  });

  it('is empty with no members, and one member is their own day', () => {
    expect(freeWindows([], day, 30)).toEqual([]);
    expect(freeWindows([me], day, 30)).toHaveLength(2);
  });

  it('ignores other dates', () => {
    expect(freeWindows([me, friend], '2026-09-21', 30)).toEqual([]);
  });
});

describe('subtractBusy', () => {
  it('clips, splits, and leaves untouched windows alone', () => {
    const free = [{ start: 540, end: 1080 }];
    const busy = [
      { id: 'a', date: day, start: '08:00', end: '10:00' },
      { id: 'b', date: day, start: '12:00', end: '13:00' },
      { id: 'c', date: day, start: '17:30', end: '19:00' },
      { id: 'd', date: '2026-09-21', start: '09:00', end: '18:00' },
    ];

    expect(subtractBusy(free, busy, day)).toEqual([
      { start: 600, end: 720 },
      { start: 780, end: 1050 },
    ]);
  });
});

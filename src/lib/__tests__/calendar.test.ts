import dayjs from 'dayjs';

import {
  buildEventDateTime,
  formatTime12,
  monthGrid,
  to24Hour,
  upcomingEvents,
  weekDays,
} from '../calendar';

describe('to24Hour', () => {
  it('keeps morning hours and maps 12 AM to midnight', () => {
    expect(to24Hour(9, 'AM')).toBe(9);
    expect(to24Hour(12, 'AM')).toBe(0);
  });

  it('shifts afternoon hours and keeps 12 PM as noon', () => {
    expect(to24Hour(3, 'PM')).toBe(15);
    expect(to24Hour(12, 'PM')).toBe(12);
    expect(to24Hour(11, 'PM')).toBe(23);
  });
});

describe('buildEventDateTime', () => {
  it('keeps the time instead of dropping it', () => {
    const result = buildEventDateTime(2026, 8, 22, 3, 5, 'PM');

    expect(result.date).toBe('2026-09-22');
    expect(result.time).toBe('15:05');
  });

  it('clamps a day past the end of the month', () => {
    const result = buildEventDateTime(2026, 1, 31, 9, 0, 'AM');

    expect(result.date).toBe('2026-02-28');
  });

  it('handles midnight and noon', () => {
    expect(buildEventDateTime(2026, 0, 1, 12, 0, 'AM').time).toBe('00:00');
    expect(buildEventDateTime(2026, 0, 1, 12, 30, 'PM').time).toBe('12:30');
  });
});

describe('monthGrid', () => {
  it('pads the front so the first lands under its weekday', () => {
    // Sept 1 2026 is a Tuesday
    const grid = monthGrid(dayjs('2026-09-15'));

    expect(grid.slice(0, 2)).toEqual([null, null]);
    expect(grid[2]?.date()).toBe(1);
    expect(grid.length).toBe(2 + 30);
  });

  it('has no blanks when the month starts on Sunday', () => {
    // November 1 2026 is a Sunday
    const grid = monthGrid(dayjs('2026-11-01'));

    expect(grid[0]?.date()).toBe(1);
    expect(grid.length).toBe(30);
  });
});

describe('formatTime12', () => {
  it('reads back as a person would say it', () => {
    expect(formatTime12('15:05')).toBe('3:05 PM');
    expect(formatTime12('00:30')).toBe('12:30 AM');
    expect(formatTime12('12:00')).toBe('12:00 PM');
  });

  it('is empty for an event with no time', () => {
    expect(formatTime12(null)).toBe('');
  });
});

describe('weekDays', () => {
  it('starts on Sunday and has seven days', () => {
    // 2026-09-16 is a Wednesday
    const days = weekDays(dayjs('2026-09-16'));

    expect(days).toHaveLength(7);
    expect(days[0].format('YYYY-MM-DD')).toBe('2026-09-13');
    expect(days[6].format('YYYY-MM-DD')).toBe('2026-09-19');
  });
});

describe('upcomingEvents', () => {
  const base = { time: null, reminder: false, color: null, rsvps: {} };
  const events = [
    { id: 'a', groupId: 'g1', title: 'past', date: '2026-09-01', ...base },
    { id: 'b', groupId: 'g1', title: 'later', date: '2026-09-30', ...base },
    { id: 'c', groupId: 'g1', title: 'soon', date: '2026-09-20', time: '09:00', reminder: false, color: null, rsvps: {} },
    { id: 'd', groupId: null, title: 'personal', date: '2026-09-21', ...base },
  ];

  it('returns only future events for that group, soonest first, capped', () => {
    const result = upcomingEvents(events, 'g1', dayjs('2026-09-18'), 5);

    expect(result.map((e) => e.title)).toEqual(['soon', 'later']);
    expect(upcomingEvents(events, 'g1', dayjs('2026-09-18'), 1)).toHaveLength(1);
  });

  it('treats null as the personal calendar', () => {
    expect(upcomingEvents(events, null, dayjs('2026-09-18'), 5).map((e) => e.title)).toEqual(['personal']);
  });
});

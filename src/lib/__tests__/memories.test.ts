import {
  addReply,
  MAX_STICKERS,
  placeSticker,
  reactionCounts,
  stickerSlot,
  toggleReaction,
  withMemoryDefaults,
} from '../memories';
import { Memory } from '../../types';

const memory = (): Memory =>
  withMemoryDefaults({
    id: 'm1',
    uri: 'file://a.jpg',
    createdAt: 1,
  });

describe('toggleReaction', () => {
  it('adds, swaps, and removes one reaction per person', () => {
    let m = toggleReaction(memory(), 'a', 'heart');

    expect(m.reactions).toEqual({ a: 'heart' });

    m = toggleReaction(m, 'a', 'happy');

    expect(m.reactions).toEqual({ a: 'happy' });

    m = toggleReaction(m, 'a', 'happy');

    expect(m.reactions).toEqual({});
  });
});

describe('reactionCounts', () => {
  it('groups and sorts by count', () => {
    let m = toggleReaction(memory(), 'a', 'heart');
    m = toggleReaction(m, 'b', 'heart');
    m = toggleReaction(m, 'c', 'happy');

    expect(reactionCounts(m)).toEqual([
      { reaction: 'heart', count: 2 },
      { reaction: 'happy', count: 1 },
    ]);
  });
});

describe('addReply', () => {
  it('trims, ignores blanks, keeps order', () => {
    let m = addReply(memory(), 'a', 'arik', '  first  ', 10);
    m = addReply(m, 'b', 'ying', '   ', 11);
    m = addReply(m, 'b', 'ying', 'second', 12);

    expect(m.replies.map((reply) => reply.text)).toEqual(['first', 'second']);
    expect(m.replies[0].id).toBe('10');
  });
});

describe('stickers', () => {
  it('spreads the first stickers across different slots', () => {
    const first = stickerSlot(0);
    const second = stickerSlot(1);

    expect(first).not.toEqual(second);
    expect(first.x).toBeGreaterThan(0);
    expect(first.x).toBeLessThan(1);
  });

  it('stops at the maximum', () => {
    let stickers = memory().stickers;

    for (let index = 0; index < MAX_STICKERS + 3; index += 1) {
      stickers = placeSticker(stickers, 'peace');
    }

    expect(stickers).toHaveLength(MAX_STICKERS);
  });
});

describe('withMemoryDefaults', () => {
  it('fills what an old saved memory is missing', () => {
    const m = withMemoryDefaults({ id: 'x', uri: 'u', createdAt: 5 });

    expect(m.stickers).toEqual([]);
    expect(m.reactions).toEqual({});
    expect(m.replies).toEqual([]);
    expect(m.frame).toBe('none');
  });
});

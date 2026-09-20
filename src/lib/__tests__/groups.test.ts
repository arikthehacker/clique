import {
  memberRows,
  normalizeUsername,
  peopleAcrossGroups,
  visibleMessages,
} from '../groups';
import {
  Group,
  Message,
} from '../../types';

const group = (overrides: Partial<Group>): Group => ({
  id: 'g1',
  name: 'Picnic Club',
  imageUri: null,
  createdBy: 'me',
  members: ['me', 'u2'],
  profiles: {
    me: { username: 'arik', avatarUri: null },
    u2: { username: 'ying', avatarUri: null },
  },
  invites: ['jenn'],
  schedule: null,
  createdAt: 1,
  ...overrides,
});

const message = (senderName: string): Message => ({
  id: senderName,
  groupId: 'g1',
  senderId: senderName,
  senderName: senderName,
  kind: 'text',
  text: 'hi',
  imageUri: null,
  refId: null,
  createdAt: 1,
});

describe('normalizeUsername', () => {
  it('ignores case, spaces, and the @', () => {
    expect(normalizeUsername('  @Ying ')).toBe('ying');
  });
});

describe('memberRows', () => {
  it('puts you first, then members, then invites', () => {
    const rows = memberRows(group({ members: ['u2', 'me'] }), 'me');

    expect(rows.map((row) => row.username)).toEqual(['arik', 'ying', 'jenn']);
    expect(rows[0].isYou).toBe(true);
    expect(rows[2].invited).toBe(true);
  });

  it('survives a member with no profile yet', () => {
    const rows = memberRows(group({ members: ['me', 'ghost'] }), 'me');

    expect(rows[1].username).toBe('someone');
  });
});

describe('visibleMessages', () => {
  const messages = [message('ying'), message('Jenn'), message('arik')];

  it('returns everything when nobody is blocked', () => {
    expect(visibleMessages(messages, [])).toHaveLength(3);
  });

  it('hides blocked senders regardless of case', () => {
    expect(visibleMessages(messages, ['@jenn']).map((m) => m.senderName)).toEqual(['ying', 'arik']);
  });
});

describe('peopleAcrossGroups', () => {
  it('dedupes across groups and never lists you', () => {
    const other = group({
      id: 'g2',
      members: ['me', 'u3'],
      profiles: {
        me: { username: 'arik', avatarUri: null },
        u3: { username: 'jenn', avatarUri: null },
      },
      invites: ['ying'],
    });

    const people = peopleAcrossGroups([group({}), other], 'me');

    expect(people.map((p) => p.username)).toEqual(['jenn', 'ying']);
    // jenn is a member in g2
    expect(people[0].invited).toBe(false);
    expect(people[1].invited).toBe(false);
  });
});

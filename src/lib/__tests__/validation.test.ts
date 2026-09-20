import {
  MAX_MESSAGE_LENGTH,
  mapAuthError,
  validateGroupName,
  validateMessage,
  validateSignIn,
  validateSignUp,
} from '../validation';

describe('validateSignUp', () => {
  const good = {
    email: 'test@example.com',
    password: 'secret1',
    confirm: 'secret1',
  };

  it('accepts a matching, well-formed sign up', () => {
    expect(validateSignUp(good)).toBeNull();
  });

  it('rejects a bad email', () => {
    expect(validateSignUp({ ...good, email: 'nope' })).toMatch(/email/i);
  });

  it('rejects a short password', () => {
    expect(validateSignUp({ ...good, password: 'abc', confirm: 'abc' })).toMatch(/at least/);
  });

  it('actually compares confirm to password', () => {
    expect(validateSignUp({ ...good, confirm: 'different' })).toBe('Passwords do not match.');
  });
});

describe('validateSignIn', () => {
  it('needs both fields', () => {
    expect(validateSignIn({ email: '', password: 'x' })).toMatch(/email/i);
    expect(validateSignIn({ email: 'a@b.co', password: '' })).toMatch(/password/i);
    expect(validateSignIn({ email: 'a@b.co', password: 'x' })).toBeNull();
  });
});

describe('validateMessage', () => {
  it('drops empty and whitespace-only messages', () => {
    expect(validateMessage('')).toBeNull();
    expect(validateMessage('   \n ')).toBeNull();
  });

  it('trims and caps length', () => {
    expect(validateMessage('  hi  ')).toBe('hi');
    expect(validateMessage('a'.repeat(MAX_MESSAGE_LENGTH + 50))?.length).toBe(MAX_MESSAGE_LENGTH);
  });
});

describe('validateGroupName', () => {
  it('rejects blank names', () => {
    expect(validateGroupName('   ')).toMatch(/name/i);
  });

  it('accepts a normal name', () => {
    expect(validateGroupName('Picnic Club')).toBeNull();
  });
});

describe('mapAuthError', () => {
  it('translates known firebase codes', () => {
    expect(mapAuthError({ code: 'auth/wrong-password' })).toBe('Wrong password.');
  });

  it('falls back for anything else', () => {
    expect(mapAuthError(new Error('boom'))).toBe('Something went wrong. Try again.');
    expect(mapAuthError(undefined)).toBe('Something went wrong. Try again.');
  });
});

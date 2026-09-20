/**
 * ==============================
 * FILE: src/lib/validation.ts
 * Last Updated: 2026-09-18
 * ==============================
 *
 * PURPOSE:
 * Input checks for the auth, chat and create-group screens.
 *
 * Includes:
 * - validateSignUp and validateSignIn
 * - validateMessage
 * - validateGroupName
 * - mapAuthError, Firebase error codes to readable text
 *
 * Notes:
 * - Validators return null when the input is fine, or the message to show.
 * - validateMessage returns the trimmed text, or null when it is empty.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 6;
export const MAX_MESSAGE_LENGTH = 1000;
const MAX_GROUP_NAME_LENGTH = 40;

export type SignUpInput = {
  email: string;
  password: string;
  confirm: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export function validateSignUp(input: SignUpInput): string | null {
  const email = input.email.trim();

  if (!email) {
    return 'Enter your email.';
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'That email does not look right.';
  }

  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return `Password needs at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (input.password !== input.confirm) {
    return 'Passwords do not match.';
  }

  return null;
}

export function validateSignIn(input: SignInInput): string | null {
  if (!input.email.trim()) {
    return 'Enter your email.';
  }

  if (!input.password) {
    return 'Enter your password.';
  }

  return null;
}

export function validateMessage(text: string): string | null {
  const trimmed = text.trim();

  // no empty messages allowed, bestie
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, MAX_MESSAGE_LENGTH);
}

export function validateGroupName(name: string): string | null {
  const trimmed = name.trim();

  // no blank group chat names, because chaos
  if (!trimmed) {
    return 'Give your group a name.';
  }

  if (trimmed.length > MAX_GROUP_NAME_LENGTH) {
    return `Group names top out at ${MAX_GROUP_NAME_LENGTH} characters.`;
  }

  return null;
}

const AUTH_ERRORS: Record<string, string> = {
  'auth/email-already-in-use': 'That email already has an account. Try logging in.',
  'auth/invalid-email': 'That email does not look right.',
  'auth/weak-password': `Password needs at least ${MIN_PASSWORD_LENGTH} characters.`,
  'auth/user-not-found': 'No account with that email yet.',
  'auth/wrong-password': 'Wrong password.',
  'auth/invalid-credential': 'Email or password is wrong.',
  'auth/too-many-requests': 'Too many tries. Wait a minute and try again.',
  'auth/network-request-failed': 'No connection. Check your network and try again.',
};

export function mapAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  return AUTH_ERRORS[code] ?? 'Something went wrong. Try again.';
}

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';
import type { User, AuthError } from '@/types';

function toAuthError(error: unknown): AuthError {
  const err = error as { code?: string; message?: string };
  const code = err.code || 'auth/unknown-error';

  const messages: Record<string, string> = {
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다.',
    'auth/user-not-found': '등록되지 않은 이메일입니다.',
    'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 일치하지 않습니다.',
    'auth/too-many-requests': '너무 많은 시도가 있었습니다. 잠시 후 다시 시도하세요.',
    'auth/network-request-failed': '인터넷 연결을 확인하세요.',
    'auth/requires-recent-login': '보안을 위해 다시 로그인 후 시도하세요.',
  };

  return {
    code,
    message: messages[code] || err.message || '알 수 없는 오류가 발생했습니다.',
  };
}

export async function signUp(
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      user: { uid: credential.user.uid, email: credential.user.email || email },
      error: null,
    };
  } catch (error) {
    console.error('signUp error:', error);
    return { user: null, error: toAuthError(error) };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return {
      user: { uid: credential.user.uid, email: credential.user.email || email },
      error: null,
    };
  } catch (error) {
    console.error('signIn error:', error);
    return { user: null, error: toAuthError(error) };
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error('signOut error:', error);
    return { error: toAuthError(error) };
  }
}

export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    console.error('resetPassword error:', error);
    return { error: toAuthError(error) };
  }
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ error: AuthError | null }> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { error: { code: 'auth/no-user', message: '로그인이 필요합니다.' } };
    }

    const credential = EmailAuthProvider.credential(user.email, oldPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);

    return { error: null };
  } catch (error) {
    console.error('changePassword error:', error);
    return { error: toAuthError(error) };
  }
}

export function getCurrentUser(): User | null {
  const user = auth.currentUser;
  if (!user) return null;
  return { uid: user.uid, email: user.email || '' };
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      callback({ uid: firebaseUser.uid, email: firebaseUser.email || '' });
    } else {
      callback(null);
    }
  });
}

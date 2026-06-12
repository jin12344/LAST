'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { changePassword } from '@/lib/auth';

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [authLoading, user, router]);

  function validate(): string | null {
    if (newPassword.length < 8) {
      return '새 비밀번호는 8자 이상이어야 합니다.';
    }

    if (!SPECIAL_CHAR_REGEX.test(newPassword)) {
      return '새 비밀번호에 특수문자를 포함해야 합니다.';
    }

    if (newPassword !== confirmPassword) {
      return '새 비밀번호가 일치하지 않습니다.';
    }

    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const { error: changeError } = await changePassword(oldPassword, newPassword);

    setLoading(false);

    if (changeError) {
      setError(changeError.message);
      return;
    }

    setSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-center text-2xl font-bold">비밀번호 변경</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="oldPassword" className="mb-1 block text-sm font-medium">
            기존 비밀번호
          </label>
          <input
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="mb-1 block text-sm font-medium">
            새 비밀번호
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="8자 이상, 특수문자 포함"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
            새 비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">비밀번호가 변경되었습니다.</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '변경 중...' : '변경'}
        </button>
      </form>
    </div>
  );
}

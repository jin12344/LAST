'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.replace('/auth/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
      <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
      <button
        onClick={handleLogout}
        className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        로그아웃
      </button>
    </header>
  );
}

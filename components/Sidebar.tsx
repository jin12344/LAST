'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/projects', label: '프로젝트 목록' },
  { href: '/auth/change-password', label: '비밀번호 변경' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-gray-200 bg-white p-4 sm:block">
      {user && (
        <p className="mb-4 truncate text-sm text-gray-500" title={user.email}>
          {user.email}
        </p>
      )}

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded px-3 py-2 text-sm font-medium ${
              pathname === item.href
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

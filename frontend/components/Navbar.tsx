'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuthSession, getStoredUser } from '@/lib/auth';
import { AuthUser } from '@/types/auth';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/login');
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xl font-bold text-slate-900">Delivery Agents</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-medium text-slate-700">{user.name}</span>
              <button onClick={handleLogout} className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-700">Login</Link>
              <Link href="/register" className="rounded bg-blue-600 px-3 py-2 text-sm text-white">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

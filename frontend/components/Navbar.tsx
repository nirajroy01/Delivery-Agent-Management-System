'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Moon, Sun, Truck } from 'lucide-react';
import { clearAuthSession, getStoredUser, subscribeToAuthSession } from '@/lib/auth';
import { AuthUser } from '@/types/auth';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();
    const unsubscribe = subscribeToAuthSession(syncUser);
    const storedTheme = window.localStorage.getItem('agent-dashboard-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      document.documentElement.dataset.theme = storedTheme;
      setTheme(storedTheme);
    }
    return unsubscribe;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem('agent-dashboard-theme', nextTheme);
    setTheme(nextTheme);
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    router.replace('/login');
  };

  return (
    <header className="app-header">
      <Link href="/dashboard" className="flex items-center gap-3 text-[15px] font-semibold text-[var(--text)]">
        <span className="flex size-9 items-center justify-center rounded-md bg-blue-500 text-white"><Truck size={19} /></span>
        <span>Delivery Agent<span className="block text-[11px] font-normal text-[var(--muted)]">Management System</span></span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-5">
        <span className="hidden border-r border-[var(--line)] pr-5 text-sm text-[var(--muted)] md:block">Agent Management</span>
        <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} className="flex size-9 items-center justify-center rounded-md border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
          {user ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
                <span className="text-sm font-medium text-[var(--text)]">{user.name}<span className="block text-xs font-normal text-[var(--muted)]">{user.role}</span></span>
              </div>
              <button onClick={handleLogout} aria-label="Log out" className="flex size-9 items-center justify-center rounded-md border border-[var(--line)] text-[var(--muted)] hover:border-red-400 hover:text-red-400">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">Login</Link>
              <Link href="/register" className="primary-button">Register</Link>
            </>
          )}
      </div>
    </header>
  );
}

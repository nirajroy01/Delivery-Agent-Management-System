'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStoredUser } from '@/lib/auth';
import { AuthUser } from '@/types/auth';

export default function Sidebar() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <aside className="hidden w-64 border-r bg-slate-50 md:block">
      <div className="p-4">
        <nav className="space-y-2 text-sm">
          <Link href="/dashboard" className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-200">Dashboard</Link>
          <Link href="/agents" className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-200">Agents</Link>
          {user?.role === 'ADMIN' && (
            <Link href="/agents/create" className="block rounded px-3 py-2 text-slate-700 hover:bg-slate-200">Add Agent</Link>
          )}
        </nav>
      </div>
    </aside>
  );
}

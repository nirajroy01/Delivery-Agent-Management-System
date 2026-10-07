'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, LayoutDashboard, Menu, Users, X } from 'lucide-react';
import { getStoredUser, subscribeToAuthSession } from '@/lib/auth';
import { AuthUser } from '@/types/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();
    return subscribeToAuthSession(syncUser);
  }, []);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/agents', label: 'Agents', icon: Users },
    ...(user?.role === 'ADMIN' ? [{ href: '/analytics', label: 'Analytics', icon: BarChart3 }] : []),
  ];

  return (
    <>
      <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="flex w-full items-center justify-between text-sm font-medium text-[var(--text)] md:hidden" aria-expanded={menuOpen}>
        <span className="flex items-center gap-2">{menuOpen ? <X size={18} /> : <Menu size={18} />} Navigation</span>
        <span className="text-xs text-[var(--muted)]">{pathname.startsWith('/agents') ? 'Agents' : 'Dashboard'}</span>
      </button>
      <aside className={`sidebar ${menuOpen ? 'mobile-nav-open' : ''}`}>
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Workspace</div>
        <nav className="space-y-1 text-sm">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === '/agents' && pathname.startsWith('/agents'));
            return (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${active ? 'bg-blue-600/15 text-blue-300' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]'}`}>
                <Icon size={17} />{label}
              </Link>
            );
          })}
          {user?.role === 'ADMIN' && (
            <Link href="/agents/create" onClick={() => setMenuOpen(false)} className="ml-8 mt-1 block rounded-md px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--text)]">Add agent</Link>
          )}
        </nav>
        <div className="mt-auto hidden rounded-md border border-[var(--line)] bg-[var(--surface-raised)] p-3 md:block">
          <div className="text-xs font-medium text-[var(--text)]">Delivery operations</div>
          <div className="mt-1 text-xs text-[var(--muted)]">Agent directory and status management</div>
        </div>
      </aside>
    </>
  );
}

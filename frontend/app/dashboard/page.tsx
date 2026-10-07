'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardStats from '@/components/DashboardStats';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAgents, getApiErrorMessage, getCurrentUser } from '@/lib/api';
import { AuthUser } from '@/types/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, areas: [] as Array<{ name: string; count: number }> });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [currentUser, firstPage] = await Promise.all([getCurrentUser(), getAgents({ page: 1, limit: 100 })]);
        setUser(currentUser);
        const remainingPages = await Promise.all(
          Array.from({ length: Math.max(0, firstPage.pagination.totalPages - 1) }, (_, index) =>
            getAgents({ page: index + 2, limit: 100 }),
          ),
        );
        const agents = [...firstPage.agents, ...remainingPages.flatMap((result) => result.agents)];
        const areaCounts = agents.reduce<Record<string, number>>((counts, agent) => {
          counts[agent.serviceArea] = (counts[agent.serviceArea] || 0) + 1;
          return counts;
        }, {});
        setStats({
          total: firstPage.pagination.total,
          active: agents.filter((agent) => agent.status === 'ACTIVE').length,
          inactive: agents.filter((agent) => agent.status === 'INACTIVE').length,
          areas: Object.entries(areaCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((left, right) => right.count - left.count),
        });
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Unable to load dashboard.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-400">Operations overview</p>
            <h1 className="text-2xl font-semibold text-[var(--text)]">Welcome back{user ? `, ${user.name}` : ''}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">A live view of your delivery agent operations.</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link href="/agents/create" className="primary-button">
              Add Agent
            </Link>
          )}
        </div>

        {loading ? <Loading label="Loading dashboard..." /> : null}
        {error ? <ErrorMessage message={error} /> : null}

        {!loading && !error && <DashboardStats total={stats.total} active={stats.active} inactive={stats.inactive} areaCount={stats.areas.length} areas={stats.areas} />}
      </div>
    </ProtectedRoute>
  );
}

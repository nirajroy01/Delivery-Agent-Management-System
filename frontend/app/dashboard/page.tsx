'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import DashboardStats from '@/components/DashboardStats';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAgents, getCurrentUser } from '@/lib/api';
import { AuthUser } from '@/types/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [currentUser, agentList] = await Promise.all([getCurrentUser(), getAgents({ page: 1, limit: 100 })]);
        setUser(currentUser);
        const agents = agentList.agents;
        setStats({
          total: agents.length,
          active: agents.filter((agent) => agent.status === 'ACTIVE').length,
          inactive: agents.filter((agent) => agent.status === 'INACTIVE').length,
        });
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Unable to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600">Overview</p>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          </div>
          {user?.role === 'ADMIN' && (
            <Link href="/agents/create" className="rounded bg-blue-600 px-4 py-2 text-white">
              Add Agent
            </Link>
          )}
        </div>

        {loading ? <Loading label="Loading dashboard..." /> : null}
        {error ? <ErrorMessage message={error} /> : null}

        {!loading && !error && <DashboardStats total={stats.total} active={stats.active} inactive={stats.inactive} />}

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Quick actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/agents" className="rounded bg-slate-900 px-4 py-2 text-white">View Agents</Link>
            {user?.role === 'ADMIN' && (
              <Link href="/agents/create" className="rounded border border-slate-300 px-4 py-2 text-slate-700">Create Agent</Link>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

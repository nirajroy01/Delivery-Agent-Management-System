'use client';

import { useEffect, useState } from 'react';
import { BarChart3, CircleCheck, CircleX, MapPin, Users } from 'lucide-react';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAnalyticsOverview, getApiErrorMessage, getCurrentUser } from '@/lib/api';
import { AnalyticsOverview } from '@/types/analytics';
import { useRouter } from 'next/navigation';

const metricCards = [
  { key: 'totalAgents', title: 'Total agents', icon: Users, tone: 'bg-blue-500/15 text-blue-400' },
  { key: 'activeAgents', title: 'Active agents', icon: CircleCheck, tone: 'bg-emerald-500/15 text-emerald-400' },
  { key: 'inactiveAgents', title: 'Inactive agents', icon: CircleX, tone: 'bg-rose-500/15 text-rose-400' },
  { key: 'serviceAreas', title: 'Service areas', icon: MapPin, tone: 'bg-violet-500/15 text-violet-400' },
] as const;

export default function AnalyticsPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const user = await getCurrentUser();
        if (user.role !== 'ADMIN') {
          router.replace('/dashboard');
          return;
        }
        const result = await getAnalyticsOverview();
        if (active) setOverview(result);
      } catch (err: unknown) {
        if (active) setError(getApiErrorMessage(err, 'Unable to load analytics.'));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [router]);

  const maxAreaCount = Math.max(1, ...(overview?.serviceAreaDistribution.map((area) => area.count) ?? []));

  return (
    <ProtectedRoute>
      <div className="space-y-5">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-400">Operations</p>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Analytics</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Current agent status and service-area distribution.</p>
        </div>

        {loading && <div className="surface"><Loading label="Loading analytics..." /></div>}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && overview && (
          <>
            {overview.totalAgents === 0 && <p className="text-sm text-[var(--muted)]">No analytics data available.</p>}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metricCards.map(({ key, title, icon: Icon, tone }) => (
                <section key={key} className="surface p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">{title}</span>
                    <span className={`flex size-9 items-center justify-center rounded-md ${tone}`}><Icon size={18} /></span>
                  </div>
                  <p className="mt-4 text-3xl font-semibold tabular-nums text-[var(--text)]">{overview[key].toLocaleString()}</p>
                </section>
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="surface p-5">
                <div className="mb-5 flex items-center gap-2">
                  <BarChart3 size={17} className="text-blue-400" />
                  <h2 className="text-sm font-semibold text-[var(--text)]">Agent status distribution</h2>
                </div>
                <div className="space-y-4">
                  {([
                    { label: 'Active', count: overview.statusDistribution.ACTIVE, color: 'bg-emerald-400' },
                    { label: 'Inactive', count: overview.statusDistribution.INACTIVE, color: 'bg-rose-400' },
                  ]).map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex justify-between text-sm"><span className="text-[var(--muted)]">{item.label}</span><span className="font-medium text-[var(--text)]">{item.count}</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-raised)]"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${overview.totalAgents ? (item.count / overview.totalAgents) * 100 : 0}%` }} /></div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="surface p-5">
                <div className="mb-5 flex items-center gap-2">
                  <MapPin size={17} className="text-blue-400" />
                  <h2 className="text-sm font-semibold text-[var(--text)]">Service-area distribution</h2>
                </div>
                {overview.serviceAreaDistribution.length ? (
                  <div className="space-y-3">
                    {overview.serviceAreaDistribution.map(({ area, count }) => (
                      <div key={area} className="grid grid-cols-[minmax(75px,120px)_1fr_32px] items-center gap-3 text-xs">
                        <span className="truncate text-[var(--muted)]">{area}</span>
                        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-raised)]"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(count / maxAreaCount) * 100}%` }} /></div>
                        <span className="text-right font-medium tabular-nums text-[var(--text)]">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-[var(--muted)]">No service-area data available.</p>}
              </section>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

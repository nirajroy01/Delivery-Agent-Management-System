import Link from 'next/link';
import { CircleCheck, CircleX, MapPin, Users } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: number;
  icon: typeof Users;
  tone: string;
};

function StatCard({ title, value, icon: Icon, tone }: StatCardProps) {
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--muted)]">{title}</span>
        <span className={`flex size-9 items-center justify-center rounded-md ${tone}`}><Icon size={18} /></span>
      </div>
      <div className="mt-4 text-3xl font-semibold tabular-nums text-[var(--text)]">{value.toLocaleString()}</div>
    </div>
  );
}

export default function DashboardStats({
  total,
  active,
  inactive,
  areaCount,
  areas,
}: {
  total: number;
  active: number;
  inactive: number;
  areaCount: number;
  areas: Array<{ name: string; count: number }>;
}) {
  const topAreas = areas.slice(0, 6);
  const highestAreaCount = topAreas[0]?.count || 1;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total agents" value={total} icon={Users} tone="bg-blue-500/15 text-blue-400" />
        <StatCard title="Active agents" value={active} icon={CircleCheck} tone="bg-emerald-500/15 text-emerald-400" />
        <StatCard title="Inactive agents" value={inactive} icon={CircleX} tone="bg-rose-500/15 text-rose-400" />
        <StatCard title="Service areas" value={areaCount} icon={MapPin} tone="bg-violet-500/15 text-violet-400" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="surface p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-[var(--text)]">Agent status</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Current distribution from agent records</p>
          </div>
          <div className="space-y-4">
            {[{ label: 'Active', count: active, color: 'bg-emerald-400' }, { label: 'Inactive', count: inactive, color: 'bg-rose-400' }].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-sm"><span className="text-[var(--muted)]">{item.label}</span><span className="font-medium text-[var(--text)]">{item.count}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-raised)]"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${total ? (item.count / total) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
        <section className="surface p-5">
          <div className="mb-5 flex items-start justify-between">
            <div><h2 className="text-sm font-semibold text-[var(--text)]">Service area distribution</h2><p className="mt-1 text-xs text-[var(--muted)]">Agent count by assigned area</p></div>
            <Link href="/agents" className="text-xs font-medium text-blue-400 hover:text-blue-300">View agents</Link>
          </div>
          {topAreas.length ? (
            <div className="space-y-3">
              {topAreas.map((area) => (
                <div key={area.name} className="grid grid-cols-[90px_1fr_28px] items-center gap-3 text-xs">
                  <span className="truncate text-[var(--muted)]">{area.name}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-raised)]"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(area.count / highestAreaCount) * 100}%` }} /></div>
                  <span className="text-right font-medium tabular-nums text-[var(--text)]">{area.count}</span>
                </div>
              ))}
            </div>
          ) : <p className="py-5 text-sm text-[var(--muted)]">No agent data available yet.</p>}
        </section>
      </div>
    </div>
  );
}

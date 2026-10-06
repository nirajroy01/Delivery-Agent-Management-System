type StatCardProps = {
  title: string;
  value: number;
  accent?: string;
};

function StatCard({ title, value, accent = 'bg-blue-50 text-blue-700' }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${accent}`}>{title}</div>
      <div className="mt-3 text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

export default function DashboardStats({ total, active, inactive }: { total: number; active: number; inactive: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard title="Total Agents" value={total} accent="bg-blue-50 text-blue-700" />
      <StatCard title="Active Agents" value={active} accent="bg-emerald-50 text-emerald-700" />
      <StatCard title="Inactive Agents" value={inactive} accent="bg-slate-100 text-slate-700" />
    </div>
  );
}

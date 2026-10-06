import { AgentStatus } from '@/types/agent';

export default function StatusBadge({ status }: { status: AgentStatus }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
        isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
      }`}
    >
      {status}
    </span>
  );
}

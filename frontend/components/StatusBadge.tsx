import { AgentStatus } from '@/types/agent';

export default function StatusBadge({ status }: { status: AgentStatus }) {
  const isActive = status === 'ACTIVE';
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${isActive ? 'status-active' : 'status-inactive'}`}
    >
      {status}
    </span>
  );
}

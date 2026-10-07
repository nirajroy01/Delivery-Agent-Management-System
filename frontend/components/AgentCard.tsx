import { Agent } from '@/types/agent';
import { CalendarDays, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-blue-500/15 text-blue-300"><UserRound size={22} /></span>
          <div><p className="text-xs text-[var(--muted)]">Agent profile</p><h2 className="mt-1 text-xl font-semibold text-[var(--text)]">{agent.fullName}</h2><p className="mt-1 text-xs text-blue-300">{agent.agentId}</p></div>
        </div>
        <StatusBadge status={agent.status} />
      </div>
      <dl className="grid gap-px bg-[var(--line)] sm:grid-cols-2">
        {[
          { label: 'Phone number', value: agent.phoneNumber, icon: Phone },
          { label: 'Email address', value: agent.email, icon: Mail },
          { label: 'Service area', value: agent.serviceArea, icon: MapPin },
          { label: 'Created at', value: new Date(agent.createdAt).toLocaleString(), icon: CalendarDays },
          { label: 'Updated at', value: new Date(agent.updatedAt).toLocaleString(), icon: CalendarDays },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-start gap-3 bg-[var(--surface)] p-5">
            <Icon size={17} className="mt-0.5 shrink-0 text-[var(--muted)]" />
            <div><dt className="text-xs text-[var(--muted)]">{label}</dt><dd className="mt-1 break-all text-sm font-medium text-[var(--text)]">{value}</dd></div>
          </div>
        ))}
      </dl>
    </div>
  );
}

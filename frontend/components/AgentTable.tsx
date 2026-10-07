import Link from 'next/link';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Agent } from '@/types/agent';
import StatusBadge from './StatusBadge';

export default function AgentTable({ agents, onDelete }: { agents: Agent[]; onDelete?: (agent: Agent) => void }) {
  return (
    <div className="table-scroll">
      <table className="min-w-[1120px] w-full text-left text-xs">
        <thead className="bg-[var(--surface-raised)] text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3 font-medium">Agent ID</th><th className="px-4 py-3 font-medium">Full name</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Service area</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Created at</th><th className="px-4 py-3 font-medium">Updated at</th><th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id} className="border-t border-[var(--line)] text-[var(--text)] transition-colors hover:bg-[var(--surface-raised)]">
              <td className="whitespace-nowrap px-4 py-3 font-medium text-blue-300">{agent.agentId}</td><td className="whitespace-nowrap px-4 py-3 font-medium">{agent.fullName}</td><td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">{agent.phoneNumber}</td><td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">{agent.email}</td><td className="whitespace-nowrap px-4 py-3">{agent.serviceArea}</td><td className="px-4 py-3"><StatusBadge status={agent.status} /></td><td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">{new Date(agent.createdAt).toLocaleString()}</td><td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">{new Date(agent.updatedAt).toLocaleString()}</td>
              <td className="px-4 py-3"><div className="flex items-center gap-1">
                  <Link href={`/agents/${agent.id}`} title="View agent" aria-label={`View ${agent.fullName}`} className="flex size-8 items-center justify-center rounded text-[var(--muted)] hover:bg-blue-500/15 hover:text-blue-300"><Eye size={15} /></Link>
                  <Link href={`/agents/${agent.id}/edit`} title="Edit agent" aria-label={`Edit ${agent.fullName}`} className="flex size-8 items-center justify-center rounded text-[var(--muted)] hover:bg-amber-500/15 hover:text-amber-300"><Pencil size={15} /></Link>
                  {onDelete && <button type="button" onClick={() => onDelete(agent)} title="Delete agent" aria-label={`Delete ${agent.fullName}`} className="flex size-8 items-center justify-center rounded text-[var(--muted)] hover:bg-rose-500/15 hover:text-rose-300"><Trash2 size={15} /></button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { Agent } from '@/types/agent';
import StatusBadge from './StatusBadge';

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">{agent.fullName}</h2>
        <StatusBadge status={agent.status} />
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
        <div><span className="font-medium text-slate-900">Agent ID:</span> {agent.agentId}</div>
        <div><span className="font-medium text-slate-900">Phone:</span> {agent.phoneNumber}</div>
        <div><span className="font-medium text-slate-900">Email:</span> {agent.email}</div>
        <div><span className="font-medium text-slate-900">Service Area:</span> {agent.serviceArea}</div>
        <div><span className="font-medium text-slate-900">Created:</span> {new Date(agent.createdAt).toLocaleString()}</div>
        <div><span className="font-medium text-slate-900">Updated:</span> {new Date(agent.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
}

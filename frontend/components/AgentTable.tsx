import Link from 'next/link';
import { Agent } from '@/types/agent';
import StatusBadge from './StatusBadge';

export default function AgentTable({ agents }: { agents: Agent[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3">Agent ID</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Service Area</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr key={agent.id} className="border-t">
              <td className="px-4 py-3 font-medium text-slate-800">{agent.agentId}</td>
              <td className="px-4 py-3">{agent.fullName}</td>
              <td className="px-4 py-3">{agent.phoneNumber}</td>
              <td className="px-4 py-3">{agent.email}</td>
              <td className="px-4 py-3">{agent.serviceArea}</td>
              <td className="px-4 py-3"><StatusBadge status={agent.status} /></td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link href={`/agents/${agent.id}`} className="text-blue-600 hover:underline">View</Link>
                  <Link href={`/agents/${agent.id}/edit`} className="text-amber-600 hover:underline">Edit</Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

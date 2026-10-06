'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AgentCard from '@/components/AgentCard';
import DeleteAgentDialog from '@/components/DeleteAgentDialog';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { deleteAgent, getAgent, getCurrentUser } from '@/lib/api';
import { Agent } from '@/types/agent';

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [userRole, setUserRole] = useState<'ADMIN' | 'USER' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [currentUser, detail] = await Promise.all([getCurrentUser(), getAgent(params.id)]);
        setUserRole(currentUser.role);
        setAgent(detail);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Unable to load agent');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAgent(params.id);
      router.push('/agents');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to delete agent');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/agents" className="text-blue-600 hover:underline">Back</Link>
          {userRole === 'ADMIN' && agent && (
            <div className="flex gap-3">
              <Link href={`/agents/${agent.id}/edit`} className="rounded bg-amber-500 px-4 py-2 text-white">Edit</Link>
              <button onClick={() => setShowDelete(true)} className="rounded bg-red-600 px-4 py-2 text-white">Delete</button>
            </div>
          )}
        </div>

        {loading ? <Loading label="Loading agent..." /> : null}
        {error ? <ErrorMessage message={error} /> : null}
        {!loading && agent && <AgentCard agent={agent} />}

        <DeleteAgentDialog open={showDelete} onCancel={() => setShowDelete(false)} onConfirm={handleDelete} loading={isDeleting} />
      </div>
    </ProtectedRoute>
  );
}

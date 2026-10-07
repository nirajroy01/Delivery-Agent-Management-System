'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AgentForm from '@/components/AgentForm';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAgent, getApiErrorMessage, getCurrentUser, updateAgent } from '@/lib/api';
import { Agent, UpdateAgentInput } from '@/types/agent';

export default function EditAgentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [currentUser, detail] = await Promise.all([getCurrentUser(), getAgent(params.id)]);
        if (currentUser.role !== 'ADMIN') {
          router.replace('/agents');
          return;
        }
        setAgent(detail);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Unable to load agent'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id, router]);

  const handleSubmit = async (values: UpdateAgentInput) => {
    try {
      const response = await updateAgent(params.id, values as UpdateAgentInput);
      router.push(`/agents/${response.data.id}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to update agent'));
    }
  };

  if (loading) return <Loading label="Loading agent details..." />;

  return (
    <ProtectedRoute>
      <div className="surface mx-auto max-w-2xl p-6 sm:p-8">
        <p className="mb-1 text-sm text-blue-400">Directory · {agent?.agentId}</p>
        <h1 className="mb-2 text-2xl font-semibold text-[var(--text)]">Edit agent</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">Update the agent record. Created {agent ? new Date(agent.createdAt).toLocaleDateString() : ''}.</p>
        {error ? <ErrorMessage message={error} /> : null}
        {agent && <AgentForm initialValues={agent} onSubmit={handleSubmit} submitLabel="Update Agent" />}
      </div>
    </ProtectedRoute>
  );
}

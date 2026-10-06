'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AgentForm from '@/components/AgentForm';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAgent, getCurrentUser, updateAgent } from '@/lib/api';
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
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Unable to load agent');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id, router]);

  const handleSubmit = async (values: any) => {
    try {
      const response = await updateAgent(params.id, values as UpdateAgentInput);
      router.push(`/agents/${response.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to update agent');
    }
  };

  if (loading) return <Loading label="Loading agent details..." />;

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Edit Agent</h1>
        {error ? <ErrorMessage message={error} /> : null}
        {agent && <AgentForm initialValues={agent} onSubmit={handleSubmit} submitLabel="Update Agent" />}
      </div>
    </ProtectedRoute>
  );
}

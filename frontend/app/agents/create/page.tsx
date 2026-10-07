'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AgentForm from '@/components/AgentForm';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createAgent, getApiErrorMessage, getCurrentUser } from '@/lib/api';
import { CreateAgentInput } from '@/types/agent';

export default function CreateAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getCurrentUser();
        if (user.role !== 'ADMIN') {
          router.replace('/dashboard');
        }
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const handleSubmit = async (values: CreateAgentInput) => {
    try {
      const response = await createAgent(values as CreateAgentInput);
      router.push(`/agents/${response.data.id}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to create agent'));
    }
  };

  if (loading) return <Loading label="Checking access..." />;

  return (
    <ProtectedRoute>
      <div className="surface mx-auto max-w-2xl p-6 sm:p-8">
        <p className="mb-1 text-sm text-blue-400">Directory</p>
        <h1 className="mb-2 text-2xl font-semibold text-[var(--text)]">Create agent</h1>
        <p className="mb-6 text-sm text-[var(--muted)]">Add a delivery agent to your operations.</p>
        {error ? <ErrorMessage message={error} /> : null}
        <AgentForm onSubmit={handleSubmit} submitLabel="Create Agent" />
      </div>
    </ProtectedRoute>
  );
}

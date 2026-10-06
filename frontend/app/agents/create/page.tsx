'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AgentForm from '@/components/AgentForm';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createAgent, getCurrentUser } from '@/lib/api';
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

  const handleSubmit = async (values: any) => {
    try {
      const response = await createAgent(values as CreateAgentInput);
      router.push(`/agents/${response.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to create agent');
    }
  };

  if (loading) return <Loading label="Checking access..." />;

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Create Agent</h1>
        {error ? <ErrorMessage message={error} /> : null}
        <AgentForm onSubmit={handleSubmit} submitLabel="Create Agent" />
      </div>
    </ProtectedRoute>
  );
}

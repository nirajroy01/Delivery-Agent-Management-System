'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AgentTable from '@/components/AgentTable';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAgents } from '@/lib/api';
import { PaginatedAgentsResponse } from '@/types/agent';

export default function AgentsPage() {
  const [data, setData] = useState<PaginatedAgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [serviceArea, setServiceArea] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await getAgents({ page, limit: 10, search, status, serviceArea });
        setData(result);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || 'Unable to load agents');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, search, status, serviceArea]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Agents</h1>
          <Link href="/agents/create" className="rounded bg-blue-600 px-4 py-2 text-white">Add Agent</Link>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-4">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="rounded border px-3 py-2" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border px-3 py-2">
              <option value="">All statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <input value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} placeholder="Service area" className="rounded border px-3 py-2" />
            <button onClick={() => setPage(1)} className="rounded bg-slate-900 px-4 py-2 text-white">Apply filters</button>
          </div>
        </div>

        {loading ? <Loading label="Loading agents..." /> : null}
        {error ? <ErrorMessage message={error} /> : null}

        {!loading && !error && data && (
          <>
            {data.agents.length > 0 ? (
              <>
                <AgentTable agents={data.agents} />
                <div className="flex items-center justify-between">
                  <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1} className="rounded border px-3 py-2 disabled:opacity-50">
                    Previous
                  </button>
                  <span className="text-sm text-slate-600">Page {data.pagination.page} of {data.pagination.totalPages}</span>
                  <button onClick={() => setPage((prev) => Math.min(data.pagination.totalPages, prev + 1))} disabled={page >= data.pagination.totalPages} className="rounded border px-3 py-2 disabled:opacity-50">
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-600">No agents found.</div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

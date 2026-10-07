'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter, Plus, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import AgentTable from '@/components/AgentTable';
import DeleteAgentDialog from '@/components/DeleteAgentDialog';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { deleteAgent, exportAgentsCsv, getAgents, getApiErrorMessage } from '@/lib/api';
import { Agent, PaginatedAgentsResponse } from '@/types/agent';

const serviceAreas = ['Bangalore', 'Delhi', 'Gurgaon', 'Pune', 'Noida', 'Mumbai', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur'];

export default function AgentsPage() {
  const [data, setData] = useState<PaginatedAgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refresh, setRefresh] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [areasInput, setAreasInput] = useState<string[]>([]);
  const [filters, setFilters] = useState({ search: '', status: '', areas: [] as string[] });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await getAgents({
          page,
          limit,
          search: filters.search || undefined,
          status: filters.status || undefined,
          serviceArea: filters.areas.length ? filters.areas : undefined,
        });
        setData(result);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Unable to load agents'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, limit, filters, refresh]);

  const applyFilters = () => {
    setPage(1);
    setFilters({ search: searchInput.trim(), status: statusInput, areas: [...areasInput] });
  };

  const resetFilters = () => {
    setSearchInput('');
    setStatusInput('');
    setAreasInput([]);
    setFilters({ search: '', status: '', areas: [] });
    setPage(1);
  };

  const toggleArea = (area: string) => {
    setAreasInput((selected) => selected.includes(area) ? selected.filter((value) => value !== area) : [...selected, area]);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError('');
      const csv = await exportAgentsCsv({
        search: filters.search || undefined,
        status: filters.status || undefined,
        serviceArea: filters.areas.length ? filters.areas : undefined,
      });
      const url = URL.createObjectURL(csv);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'agents.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setExportError(getApiErrorMessage(err, 'Unable to export agents.'));
    } finally {
      setIsExporting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedAgent) return;
    try {
      setIsDeleting(true);
      await deleteAgent(selectedAgent.id);
      setSelectedAgent(null);
      if (data?.agents.length === 1 && page > 1) setPage((current) => current - 1);
      else setRefresh((current) => current + 1);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to delete agent'));
      setSelectedAgent(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const total = data?.pagination.total || 0;
  const start = total ? (page - 1) * limit + 1 : 0;
  const end = total ? Math.min(page * limit, total) : 0;
  const totalPages = data?.pagination.totalPages || 0;
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((value) => value === 1 || value === totalPages || Math.abs(value - page) <= 1);
  const areaLabel = areasInput.length ? `${areasInput.length} area${areasInput.length === 1 ? '' : 's'} selected` : 'All areas';

  return (
    <ProtectedRoute>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-sm text-blue-400">Directory</p>
            <h1 className="text-2xl font-semibold text-[var(--text)]">Agents</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Search and manage your delivery agent records.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleExport} disabled={isExporting} className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--line)] px-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-raised)] disabled:cursor-not-allowed disabled:opacity-60">
              <Download size={16} />{isExporting ? 'Exporting…' : 'Export CSV'}
            </button>
            <Link href="/agents/create" className="primary-button"><Plus size={17} />Add Agent</Link>
          </div>
        </div>

        <section className="surface p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_170px_220px_auto_auto] lg:items-end">
            <label className="block text-xs font-medium text-[var(--muted)]">
              Search
              <span className="relative mt-1.5 block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') applyFilters(); }} placeholder="Name, email or agent ID" className="field-control pl-9" />
              </span>
            </label>
            <label className="block text-xs font-medium text-[var(--muted)]">
              Status
              <select value={statusInput} onChange={(event) => setStatusInput(event.target.value)} className="field-control mt-1.5">
                <option value="">All statuses</option><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
            <div className="relative text-xs font-medium text-[var(--muted)]">
              Service area
              <details className="group mt-1.5">
                <summary aria-label={`Service area filter: ${areaLabel}`} className="field-control flex cursor-pointer list-none items-center justify-between text-sm font-normal text-[var(--text)] [&::-webkit-details-marker]:hidden">
                  <span className="truncate">{areaLabel}</span><SlidersHorizontal size={15} className="ml-2 shrink-0 text-[var(--muted)]" />
                </summary>
                <div className="absolute left-0 top-full z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-md border border-[var(--line)] bg-[var(--surface)] p-2 shadow-xl">
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-raised)]"><input type="checkbox" checked={areasInput.length === 0} onChange={() => setAreasInput([])} />All areas</label>
                  <div className="my-1 border-t border-[var(--line)]" />
                  {serviceAreas.map((area) => <label key={area} className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-raised)]"><input type="checkbox" checked={areasInput.includes(area)} onChange={() => toggleArea(area)} />{area}</label>)}
                </div>
              </details>
            </div>
            <label className="block text-xs font-medium text-[var(--muted)]">
              Per page
              <select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }} className="field-control mt-1.5"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={applyFilters} className="primary-button flex-1"><Filter size={15} />Apply</button>
              <button type="button" onClick={resetFilters} title="Reset filters" aria-label="Reset filters" className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]"><RotateCcw size={16} /></button>
            </div>
          </div>
        </section>

        {error && <ErrorMessage message={error} />}
        {exportError && <ErrorMessage message={exportError} />}
        {loading && <div className="surface"><Loading label="Loading agents..." /></div>}
        {!loading && !error && data && (
          <section className="surface overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-4 sm:px-5">
              <div><h2 className="text-sm font-semibold text-[var(--text)]">Agent directory</h2><p className="mt-1 text-xs text-[var(--muted)]">{total.toLocaleString()} total record{total === 1 ? '' : 's'}</p></div>
              <span className="text-xs text-[var(--muted)]">{filters.status || 'All statuses'}{filters.areas.length ? ` · ${filters.areas.length} area${filters.areas.length === 1 ? '' : 's'}` : ''}</span>
            </div>
            {data.agents.length ? <AgentTable agents={data.agents} onDelete={setSelectedAgent} /> : (
              <div className="px-5 py-14 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--surface-raised)] text-[var(--muted)]"><Search size={20} /></div>
                <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">No agents found</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Try adjusting your search or filters.</p>
                <button onClick={resetFilters} className="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300">Clear filters</button>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-4 py-3 sm:px-5">
              <span className="text-xs text-[var(--muted)]">Showing {start}–{end} of {total.toLocaleString()} agents</span>
              <div className="flex items-center gap-1">
                <button aria-label="Previous page" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} className="flex size-8 items-center justify-center rounded border border-[var(--line)] text-[var(--muted)] disabled:opacity-40"><ChevronLeft size={16} /></button>
                {visiblePages.map((number, index) => <span key={number} className="flex items-center">{index > 0 && visiblePages[index - 1] !== number - 1 && <span className="px-1 text-xs text-[var(--muted)]">…</span>}<button aria-current={page === number ? 'page' : undefined} onClick={() => setPage(number)} className={`size-8 rounded text-xs ${page === number ? 'bg-blue-600 font-semibold text-white' : 'text-[var(--muted)] hover:bg-[var(--surface-raised)]'}`}>{number}</button></span>)}
                <button aria-label="Next page" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="flex size-8 items-center justify-center rounded border border-[var(--line)] text-[var(--muted)] disabled:opacity-40"><ChevronRight size={16} /></button>
              </div>
            </div>
          </section>
        )}
        <DeleteAgentDialog open={!!selectedAgent} agentName={selectedAgent?.fullName} onCancel={() => setSelectedAgent(null)} onConfirm={confirmDelete} loading={isDeleting} />
      </div>
    </ProtectedRoute>
  );
}
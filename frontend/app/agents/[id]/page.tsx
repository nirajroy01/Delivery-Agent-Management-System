'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Clock, History, MapPin, Pencil, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import AgentCard from '@/components/AgentCard';
import DeleteAgentDialog from '@/components/DeleteAgentDialog';
import ErrorMessage from '@/components/ErrorMessage';
import Loading from '@/components/Loading';
import ProtectedRoute from '@/components/ProtectedRoute';
import { deleteAgent, getAgent, getAgentActivity, getApiErrorMessage, getCurrentUser } from '@/lib/api';
import { Agent, AgentActivity } from '@/types/agent';

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [userRole, setUserRole] = useState<'ADMIN' | 'USER' | null>(null);
  const [activity, setActivity] = useState<AgentActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');
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
        if (currentUser.role === 'ADMIN') {
          try {
            setActivity(await getAgentActivity(params.id));
          } catch (err: unknown) {
            setActivityError(getApiErrorMessage(err, 'Unable to load activity.'));
          } finally {
            setActivityLoading(false);
          }
        } else {
          setActivityLoading(false);
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Unable to load agent'));
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
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to delete agent'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/agents" className="text-sm font-medium text-blue-400 hover:text-blue-300">Back to agents</Link>
          {userRole === 'ADMIN' && agent && (
            <div className="flex gap-3">
              <Link href={`/agents/${agent.id}/edit`} className="primary-button">Edit agent</Link>
              <button onClick={() => setShowDelete(true)} className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white">Delete agent</button>
            </div>
          )}
        </div>

        {loading ? <Loading label="Loading agent..." /> : null}
        {error ? <ErrorMessage message={error} /> : null}
        {!loading && agent && <AgentCard agent={agent} />}
        {!loading && agent && userRole === 'ADMIN' && (
          <section className="surface p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <History size={18} className="text-blue-400" />
              <h2 className="text-base font-semibold text-[var(--text)]">Activity History</h2>
            </div>
            {activityLoading && <Loading label="Loading activity..." />}
            {activityError && <ErrorMessage message={activityError} />}
            {!activityLoading && !activityError && !activity.length && <p className="text-sm text-[var(--muted)]">No activity recorded yet.</p>}
            {!activityLoading && !activityError && activity.length > 0 && (
              <ol className="space-y-0">
                {activity.map((entry, index) => {
                  const Icon = entry.action === 'AGENT_CREATED'
                    ? UserPlus
                    : entry.action === 'STATUS_CHANGED'
                      ? RefreshCw
                      : entry.action === 'SERVICE_AREA_CHANGED'
                        ? MapPin
                        : entry.action === 'AGENT_DELETED'
                          ? Trash2
                          : Pencil;
                  const title = entry.action === 'AGENT_CREATED'
                    ? 'Agent created'
                    : entry.action === 'STATUS_CHANGED'
                      ? 'Status changed'
                      : entry.action === 'SERVICE_AREA_CHANGED'
                        ? 'Service area changed'
                        : entry.action === 'AGENT_DELETED'
                          ? 'Agent deleted'
                          : 'Profile updated';
                  return (
                    <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {index < activity.length - 1 && <span aria-hidden="true" className="absolute left-[15px] top-8 h-full w-px bg-[var(--line)]" />}
                      <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-raised)] text-blue-300"><Icon size={15} /></span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-[var(--text)]">{title}</p>
                        <p className="mt-1 break-words text-sm text-[var(--muted)]">{entry.description}</p>
                        {entry.previousValue !== undefined && entry.newValue !== undefined && (
                          <p className="mt-1 text-xs text-[var(--muted)]">{entry.previousValue} <span aria-label="changed to">→</span> {entry.newValue}</p>
                        )}
                        <p className="mt-2 flex items-center gap-1 text-xs text-[var(--muted)]"><Clock size={12} />{new Date(entry.createdAt).toLocaleString()}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        )}

        <DeleteAgentDialog open={showDelete} agentName={agent?.fullName} onCancel={() => setShowDelete(false)} onConfirm={handleDelete} loading={isDeleting} />
      </div>
    </ProtectedRoute>
  );
}

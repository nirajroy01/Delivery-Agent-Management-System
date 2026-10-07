'use client';

export default function DeleteAgentDialog({
  open,
  agentName,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  agentName?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="delete-agent-title" className="w-full max-w-md rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl">
        <h3 id="delete-agent-title" className="text-lg font-semibold text-[var(--text)]">Delete agent?</h3>
        <p className="mt-3 text-sm text-[var(--muted)]">Are you sure you want to delete {agentName || 'this delivery agent'}? This action cannot be undone.</p>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-md border border-[var(--line)] px-4 py-2 text-[var(--text)]" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className="rounded-md bg-rose-600 px-4 py-2 text-white" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}

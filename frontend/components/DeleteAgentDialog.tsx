'use client';

export default function DeleteAgentDialog({
  open,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900">Delete delivery agent</h3>
        <p className="mt-3 text-sm text-slate-600">Are you sure you want to delete this delivery agent?</p>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded border px-4 py-2 text-slate-700" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className="rounded bg-red-600 px-4 py-2 text-white" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

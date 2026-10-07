export default function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-sm text-[var(--muted)]" role="status" aria-live="polite">
      <div className="size-5 animate-spin rounded-full border-2 border-[var(--line)] border-t-blue-500" />
      <span className="ml-3">{label}</span>
    </div>
  );
}

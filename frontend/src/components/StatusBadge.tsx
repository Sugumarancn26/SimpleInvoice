const STYLES: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-600',
  Pending: 'bg-amber-100 text-amber-700',
  Paid: 'bg-emerald-100 text-emerald-700',
  Overdue: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? 'bg-slate-100 text-slate-600';
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}

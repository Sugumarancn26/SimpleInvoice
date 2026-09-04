export function KeyValueList({
  rows,
  caps = false,
}: {
  rows: Array<{ label: string; value: string }>;
  caps?: boolean;
}) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="min-w-0">
          <dt
            className={
              caps
                ? 'text-[11px] font-semibold uppercase tracking-wider text-slate-400'
                : 'text-sm text-slate-500'
            }
          >
            {row.label}
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-slate-900">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

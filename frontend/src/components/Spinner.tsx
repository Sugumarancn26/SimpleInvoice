export function Spinner({
  size = 'md',
  label,
  className = '',
}: {
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-8 w-8';

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg
        className={`animate-spin ${sizeClass}`}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
        />
      </svg>
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-blue-600">
      <Spinner size="md" label={label} />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

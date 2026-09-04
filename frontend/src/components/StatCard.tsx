import type { ReactNode } from 'react';

type StatTone = 'paid' | 'pending' | 'overdue' | 'draft';

const TONE_STYLES: Record<StatTone, { wrap: string; icon: string }> = {
  paid: { wrap: 'bg-emerald-100', icon: 'text-emerald-600' },
  pending: { wrap: 'bg-amber-100', icon: 'text-amber-600' },
  overdue: { wrap: 'bg-red-100', icon: 'text-red-600' },
  draft: { wrap: 'bg-slate-100', icon: 'text-slate-500' },
};

function PaidIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.704 5.29a.75.75 0 0 1 .006 1.06l-7.25 7.375a.75.75 0 0 1-1.074-.012L3.29 9.52a.75.75 0 1 1 1.06-1.06l4.53 4.53 6.72-6.7a.75.75 0 0 1 1.104 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-12.5a.75.75 0 0 0-1.5 0v4.19l-2.22 2.22a.75.75 0 1 0 1.06 1.06l2.41-2.41A.75.75 0 0 0 10.75 10V5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function OverdueIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8.257 3.1c.765-1.36 2.72-1.36 3.486 0l6.518 11.59c.75 1.334-.213 2.985-1.743 2.985H3.482c-1.53 0-2.493-1.65-1.743-2.986L8.257 3.1ZM10 7a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 7Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
    </svg>
  );
}

const ICONS: Record<StatTone, () => ReactNode> = {
  paid: PaidIcon,
  pending: PendingIcon,
  overdue: OverdueIcon,
  draft: DraftIcon,
};

export function StatCard({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: StatTone;
}) {
  const Icon = ICONS[tone];
  const styles = TONE_STYLES[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.wrap} ${styles.icon}`}
      >
        <Icon />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none text-slate-900">{count}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

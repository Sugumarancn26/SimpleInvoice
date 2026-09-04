import { useEffect } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

const TITLES: Record<ToastVariant, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
  warning: 'Warning',
};

const BAR: Record<ToastVariant, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-sky-500',
  warning: 'bg-amber-400',
};

const ICON_WRAP: Record<ToastVariant, string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-sky-500',
  warning: 'bg-amber-400',
};

export function toastVariantFromStatus(status?: number): ToastVariant {
  if (status == null) {
    return 'error';
  }
  if (status >= 200 && status < 300) {
    return 'success';
  }
  if (status === 400 || status === 429) {
    return 'warning';
  }
  return 'error';
}

function VariantIcon({ variant }: { variant: ToastVariant }) {
  const className = 'h-4 w-4 text-white';
  if (variant === 'success') {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (variant === 'error') {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
      </svg>
    );
  }
  if (variant === 'info') {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-4a.75.75 0 0 0-.75.75v.5a.75.75 0 0 0 1.5 0v-.5A.75.75 0 0 0 10 6Zm0 3a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 10 9Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function Toast({
  message,
  onDismiss,
  variant = 'success',
}: {
  message: string;
  onDismiss: () => void;
  variant?: ToastVariant;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  return (
    <div
      className="fixed right-4 top-4 z-50 inline-flex w-max max-w-[calc(100%-2rem)] overflow-hidden rounded-lg bg-white shadow-lg"
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
    >
      <div className={`w-1 shrink-0 ${BAR[variant]}`} />
      <div className="flex items-start gap-3 px-3 py-3">
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ICON_WRAP[variant]}`}
        >
          <VariantIcon variant={variant} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{TITLES[variant]}</p>
          <p className="mt-0.5 whitespace-nowrap text-sm text-slate-600">{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

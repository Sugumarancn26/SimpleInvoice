import type { ReactNode } from 'react';

const inputClassName =
  'block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

export function FormField({
  label,
  htmlFor,
  error,
  required = false,
  caps = false,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  caps?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={htmlFor}
        className={
          caps
            ? 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400'
            : 'mb-2 block text-sm font-medium text-slate-700'
        }
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div
        className={
          error
            ? '[&_input]:border-red-500 [&_input]:focus:border-red-500 [&_input]:focus:ring-red-500 [&_select]:border-red-500 [&_select]:focus:border-red-500 [&_select]:focus:ring-red-500'
            : undefined
        }
      >
        {children}
      </div>
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { inputClassName };

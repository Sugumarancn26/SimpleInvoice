import type { ButtonHTMLAttributes } from 'react';

const VARIANTS = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
  outline:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-40',
  navbar:
    'border border-white/30 bg-transparent text-white hover:bg-white/10 disabled:opacity-40',
  ghost:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40',
};

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

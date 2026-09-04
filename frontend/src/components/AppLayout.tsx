import type { ReactNode } from 'react';
import { Navbar } from './Navbar.tsx';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-slate-100">
      <Navbar />
      {children}
    </div>
  );
}

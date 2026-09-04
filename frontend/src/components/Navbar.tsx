import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { Avatar } from './Avatar.tsx';
import { BrandMark } from './BrandMark.tsx';
import { Button } from './Button.tsx';

export function Navbar() {
  const { user, logout } = useAuth();
  const displayName = user?.fullname ?? 'Account';
  const email = user?.email ?? '';

  return (
    <header className="sticky top-0 z-50 bg-slate-900 shadow-md">
      <div className="flex w-full items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-12 xl:px-16">
        <Link to="/" className="shrink-0" aria-label="SimpleInvoice home">
          <BrandMark />
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={displayName} />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>
              {email ? (
                <p className="truncate text-xs text-slate-300">{email}</p>
              ) : null}
            </div>
          </div>
          <Button variant="navbar" onClick={logout} className="shrink-0 px-3">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M12 4h3.5A1.5 1.5 0 0 1 17 5.5v9A1.5 1.5 0 0 1 15.5 16H12"
                strokeLinecap="round"
              />
              <path
                d="M9 6.5 5.5 10 9 13.5M5.5 10H14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

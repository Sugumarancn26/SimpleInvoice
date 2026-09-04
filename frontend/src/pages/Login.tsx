import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { BrandMark } from '../components/BrandMark.tsx';
import { Button } from '../components/Button.tsx';
import { Card } from '../components/Card.tsx';
import { FormField, inputClassName } from '../components/FormField.tsx';
import { Spinner } from '../components/Spinner.tsx';

type FieldErrors = {
  email?: string;
  password?: string;
};

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!password) {
    errors.password = 'Password is required';
  }
  return errors;
}

function serverErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) {
    return null;
  }
  const message = error.response?.data?.message;
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }
  if (Array.isArray(message) && typeof message[0] === 'string') {
    return message[0];
  }
  return null;
}

export function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(email.trim(), password);
    setFieldErrors(nextErrors);
    setServerError(null);
    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(serverErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <aside className="bg-slate-900 px-6 py-6 sm:px-8 lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <BrandMark />
        <p className="mt-3 text-sm text-slate-400 lg:hidden">Welcome back</p>
        <div className="mt-16 hidden lg:block">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            Invoice workspace
          </p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-white">
            List. Create. Track.
          </h2>
          <ul className="mt-10 space-y-4 text-sm text-slate-200">
            <li className="flex items-center gap-3">
              <span className="text-blue-400" aria-hidden="true">
                ✓
              </span>
              Invoice list
            </li>
            <li className="flex items-center gap-3">
              <span className="text-blue-400" aria-hidden="true">
                ✓
              </span>
              New invoice
            </li>
            <li className="flex items-center gap-3">
              <span className="text-blue-400" aria-hidden="true">
                ✓
              </span>
              Auto overdue
            </li>
          </ul>
        </div>
        <p className="mt-10 hidden text-xs text-slate-500 lg:block">
          SimpleInvoice
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center bg-slate-100 px-4 py-10 sm:px-6">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <form noValidate onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Login</h1>
              <p className="mt-1 text-sm text-slate-500">Welcome back</p>
            </div>

            {serverError ? (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {serverError}
              </p>
            ) : null}

            <FormField
              label="Email"
              htmlFor="email"
              error={fieldErrors.email}
            >
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M3 5.5h14v9H3v-9Z" strokeLinejoin="round" />
                    <path d="m3.5 6 6.5 4.5L16.5 6" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter email address"
                  value={email}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? 'email-error' : undefined
                  }
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }));
                  }}
                  className={`${inputClassName} !pl-10`}
                />
              </div>
            </FormField>

            <FormField
              label="Password"
              htmlFor="password"
              error={fieldErrors.password}
            >
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <rect x="4.5" y="9" width="11" height="7.5" rx="1.5" />
                    <path d="M7 9V7a3 3 0 0 1 6 0v2" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? 'password-error' : undefined
                  }
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }}
                  className={`${inputClassName} !pl-10 !pr-10`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((open) => !open)}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M3 10s2.8-5 7-5 7 5 7 5-2.8 5-7 5-7-5-7-5Z" />
                      <circle cx="10" cy="10" r="2" />
                      <path d="m4 16 12-12" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M3 10s2.8-5 7-5 7 5 7 5-2.8 5-7 5-7-5-7-5Z" />
                      <circle cx="10" cy="10" r="2" />
                    </svg>
                  )}
                </button>
              </div>
            </FormField>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}

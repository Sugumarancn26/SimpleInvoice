import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from '../api/auth.ts';
import { AuthProvider } from '../auth/AuthContext.tsx';
import { Login } from '../pages/Login.tsx';

vi.mock('../api/auth.ts', () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn(),
  },
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.mocked(authApi.login).mockReset();
  });

  it('shows validation errors for empty fields', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('shows validation error for a bad email', () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'changeme' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('shows server error on failed login', async () => {
    vi.mocked(authApi.login).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: 'Invalid email or password' },
      },
    });
    renderLogin();
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'reviewer@101digital.io' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => {
      expect(
        screen.getByText('Invalid email or password'),
      ).toBeInTheDocument();
    });
  });
});

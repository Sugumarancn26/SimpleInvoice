import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../App.tsx';
import { AuthProvider } from '../auth/AuthContext.tsx';

describe('Routing', () => {
  it('redirects an unauthenticated visit to / to /login', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Invoice List' }),
    ).not.toBeInTheDocument();
  });
});

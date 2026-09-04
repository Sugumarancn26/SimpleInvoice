import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { invoicesApi } from '../api/invoices.ts';
import { InvoiceCreate } from '../pages/InvoiceCreate.tsx';

vi.mock('../api/invoices.ts', () => ({
  invoicesApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
  },
}));

describe('Create invoice', () => {
  it('shows error when due date is before invoice date', () => {
    render(
      <MemoryRouter>
        <InvoiceCreate />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Invoice number/), {
      target: { value: 'INV-TEST' },
    });
    fireEvent.change(screen.getByLabelText(/Invoice date/), {
      target: { value: '2026-09-20' },
    });
    fireEvent.change(screen.getByLabelText(/Due date/), {
      target: { value: '2026-09-03' },
    });
    fireEvent.change(screen.getByLabelText(/Customer name/), {
      target: { value: 'Paul' },
    });
    fireEvent.change(screen.getByLabelText(/Customer email/), {
      target: { value: 'paul@101digital.io' },
    });
    fireEvent.change(screen.getByLabelText(/Item name/), {
      target: { value: 'Honda RC150' },
    });
    fireEvent.change(screen.getByLabelText(/Quantity/), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/^Rate/), {
      target: { value: '100' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Invoice' }));

    expect(
      screen.getByText('dueDate must be on or after invoiceDate'),
    ).toBeInTheDocument();
    expect(invoicesApi.create).not.toHaveBeenCalled();
  });
});

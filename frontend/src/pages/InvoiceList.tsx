import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { invoicesApi } from '../api/invoices.ts';
import { Avatar } from '../components/Avatar.tsx';
import { Button } from '../components/Button.tsx';
import { Card } from '../components/Card.tsx';
import { Filters } from '../components/Filters.tsx';
import { Pagination } from '../components/Pagination.tsx';
import { SearchBar } from '../components/SearchBar.tsx';
import { LoadingBlock } from '../components/Spinner.tsx';
import { StatCard } from '../components/StatCard.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { Table, type TableColumn } from '../components/Table.tsx';
import { Toast } from '../components/Toast.tsx';
import type {
  InvoiceListItem,
  InvoiceOrdering,
  InvoicePaging,
  InvoiceSortBy,
  InvoiceStatusFilter,
} from '../types/invoice.ts';

const COLUMNS: Array<TableColumn<InvoiceListItem>> = [
  {
    id: 'invoiceNumber',
    header: 'Invoice #',
    render: (row) => (
      <span className="font-medium text-slate-800 group-hover:text-blue-600">
        {row.invoiceNumber}
      </span>
    ),
  },
  {
    id: 'customerName',
    header: 'Customer',
    render: (row) => (
      <span className="inline-flex items-center gap-2">
        <Avatar name={row.customer.fullname} size="sm" />
        <span>{row.customer.fullname}</span>
      </span>
    ),
  },
  {
    id: 'invoiceDate',
    header: 'Invoice Date',
    sortField: 'invoiceDate',
    render: (row) => row.invoiceDate,
  },
  {
    id: 'dueDate',
    header: 'Due Date',
    sortField: 'dueDate',
    render: (row) => row.dueDate,
  },
  {
    id: 'totalAmount',
    header: 'Amount',
    sortField: 'totalAmount',
    align: 'right',
    render: (row) => (
      <span className="font-semibold">{row.totalAmount.toFixed(2)}</span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    render: (row) => <StatusBadge status={row.status} />,
  },
];

function countStatus(rows: InvoiceListItem[], status: string): number {
  return rows.filter((row) => row.status === status).length;
}

function useDebouncedValue(value: string, delayMs = 300): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function errorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Unable to load invoices';
  }
  const message = error.response?.data?.message;
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }
  if (Array.isArray(message) && typeof message[0] === 'string') {
    return message[0];
  }
  return 'Unable to load invoices';
}

export function InvoiceList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<InvoiceSortBy | undefined>();
  const [ordering, setOrdering] = useState<InvoiceOrdering>('DESC');
  const [status, setStatus] = useState<'' | InvoiceStatusFilter>('');
  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rows, setRows] = useState<InvoiceListItem[]>([]);
  const [paging, setPaging] = useState<InvoicePaging>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { notice?: string } | null;
    if (state?.notice) {
      setNotice(state.notice);
      setKeyword('');
      setStatus('');
      setFromDate('');
      setToDate('');
      setSortBy(undefined);
      setOrdering('DESC');
      setPage(1);
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const debouncedKeyword = useDebouncedValue(keyword, 350);

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  function goToFirstPage() {
    setPage(1);
  }

  const canClear =
    Boolean(keyword) ||
    Boolean(status) ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    Boolean(sortBy);

  function clearFilters() {
    setKeyword('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setSortBy(undefined);
    setOrdering('DESC');
    setPage(1);
  }

  useEffect(() => {
    if (fromDate && toDate && fromDate > toDate) {
      setError('fromDate must be on or before toDate');
      setRows([]);
      setPaging((p) => ({ ...p, total: 0 }));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    invoicesApi
      .list({
        page,
        pageSize,
        ...(sortBy ? { sortBy, ordering } : {}),
        ...(status ? { status } : {}),
        ...(debouncedKeyword.trim()
          ? { keyword: debouncedKeyword.trim() }
          : {}),
        ...(fromDate ? { fromDate } : {}),
        ...(toDate ? { toDate } : {}),
      })
      .then((res) => {
        if (!cancelled) {
          setRows(res.data.data);
          setPaging(res.data.paging);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRows([]);
          setError(errorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    page,
    pageSize,
    sortBy,
    ordering,
    status,
    debouncedKeyword,
    fromDate,
    toDate,
  ]);

  function handleSort(field: InvoiceSortBy) {
    if (sortBy === field) {
      setOrdering((current) => (current === 'DESC' ? 'ASC' : 'DESC'));
    } else {
      setSortBy(field);
      setOrdering('DESC');
    }
    goToFirstPage();
  }

  const selectClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between gap-2">
        <h1 className="min-w-0 text-xl font-bold text-slate-900 sm:text-2xl">
          Invoice List
        </h1>
        <Button
          className="shrink-0 whitespace-nowrap px-3 sm:px-4"
          onClick={() => navigate('/invoices/new')}
        >
          <span aria-hidden="true">+</span>
          Create Invoice
        </Button>
      </header>

      {notice ? (
        <Toast
          message={notice}
          variant="success"
          onDismiss={() => setNotice(null)}
        />
      ) : null}

      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Paid" count={countStatus(rows, 'Paid')} tone="paid" />
        <StatCard
          label="Pending"
          count={countStatus(rows, 'Pending')}
          tone="pending"
        />
        <StatCard
          label="Overdue"
          count={countStatus(rows, 'Overdue')}
          tone="overdue"
        />
        <StatCard
          label="Draft"
          count={countStatus(rows, 'Draft')}
          tone="draft"
        />
      </section>

      <Card className="mb-4 p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <SearchBar value={keyword} onChange={setKeyword} />
          </div>
          <Button
            variant="ghost"
            onClick={clearFilters}
            disabled={!canClear}
            className="sm:self-auto"
          >
            Clear
          </Button>
        </div>
        <Filters
          status={status}
          fromDate={fromDate}
          toDate={toDate}
          onStatusChange={(value) => {
            setStatus(value);
            goToFirstPage();
          }}
          onFromDateChange={(value) => {
            setFromDate(value);
            goToFirstPage();
          }}
          onToDateChange={(value) => {
            setToDate(value);
            goToFirstPage();
          }}
        />
        <div className="mt-3 grid grid-cols-1 gap-3 md:hidden">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Sort by
            </span>
            <select
              value={sortBy ?? ''}
              onChange={(event) => {
                const value = event.target.value;
                setSortBy(value ? (value as InvoiceSortBy) : undefined);
                setOrdering('DESC');
                goToFirstPage();
              }}
              className={selectClass}
            >
              <option value="">Default</option>
              <option value="invoiceDate">Invoice Date</option>
              <option value="dueDate">Due Date</option>
              <option value="totalAmount">Total Amount</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Direction
            </span>
            <select
              value={ordering}
              disabled={!sortBy}
              onChange={(event) => {
                setOrdering(event.target.value as InvoiceOrdering);
                goToFirstPage();
              }}
              className={`${selectClass} disabled:opacity-50`}
            >
              <option value="ASC">ASC</option>
              <option value="DESC">DESC</option>
            </select>
          </label>
        </div>
      </Card>

      {error ? (
        <p
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Card className="overflow-hidden">
        {loading ? (
          <LoadingBlock label="Loading invoices…" />
        ) : rows.length === 0 && !error ? (
          <p className="px-4 py-8 text-center text-slate-500">
            No invoices found
          </p>
        ) : rows.length > 0 ? (
          <div className="p-3 md:p-0">
            <Table
              columns={COLUMNS}
              rows={rows}
              sortBy={sortBy}
              ordering={ordering}
              onSort={handleSort}
              onRowClick={(row) => navigate(`/invoices/${row.invoiceId}`)}
              getRowKey={(row) => row.invoiceId}
              framed={false}
            />
          </div>
        ) : null}

        <div className="border-t border-slate-200 px-4 py-3">
          <Pagination
            page={paging.page}
            pageSize={pageSize}
            total={paging.total}
            onPageChange={setPage}
            onPageSizeChange={(next) => {
              setPageSize(next);
              setPage(1);
            }}
          />
        </div>
      </Card>
    </main>
  );
}

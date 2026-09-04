import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { invoicesApi } from '../api/invoices.ts';
import { Avatar } from '../components/Avatar.tsx';
import { BackButton } from '../components/BackButton.tsx';
import { Card, SectionCard } from '../components/Card.tsx';
import { KeyValueList } from '../components/KeyValueList.tsx';
import { LoadingBlock } from '../components/Spinner.tsx';
import { SummaryPanel, formatMoney } from '../components/SummaryPanel.tsx';
import { Table, type TableColumn } from '../components/Table.tsx';
import type { InvoiceDetail as InvoiceDetailData } from '../types/invoice.ts';

type InvoiceItem = InvoiceDetailData['items'][number];

function display(value: string | null | undefined): string {
  return value && value.length > 0 ? value : '—';
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function taxPercent(subTotal: number, tax: number): number {
  if (subTotal <= 0) {
    return 0;
  }
  return Math.round((tax / subTotal) * 100);
}

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(null);

    invoicesApi
      .get(id)
      .then((res) => {
        if (!cancelled) {
          setInvoice(res.data);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true);
          setInvoice(null);
          return;
        }
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message
          : null;
        setError(
          typeof message === 'string' ? message : 'Unable to load invoice',
        );
        setInvoice(null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <BackButton to="/" />

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <LoadingBlock label="Loading invoice…" />
        </div>
      ) : notFound ? (
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Invoice not found
          </h1>
          <p className="mt-2 text-slate-600">
            This invoice does not exist or is no longer available.
          </p>
          <div className="mt-4">
            <BackButton to="/" />
          </div>
        </Card>
      ) : error ? (
        <p
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : invoice ? (
        <DetailBody invoice={invoice} />
      ) : null}
    </main>
  );
}

function DetailBody({ invoice }: { invoice: InvoiceDetailData }) {
  const currency = invoice.currency;
  const itemColumns: Array<TableColumn<InvoiceItem>> = [
    { id: 'name', header: 'Name', render: (item) => item.name },
    {
      id: 'quantity',
      header: 'Qty',
      align: 'right',
      render: (item) => String(item.quantity),
    },
    {
      id: 'rate',
      header: 'Rate',
      align: 'right',
      render: (item) => formatMoney(currency, item.rate),
    },
    {
      id: 'total',
      header: 'Total',
      align: 'right',
      render: (item) => formatMoney(currency, round2(item.quantity * item.rate)),
    },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {invoice.invoiceNumber}
        </h1>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] xl:grid-cols-[minmax(0,1fr)_30rem]">
        <div className="space-y-4">
          <SectionCard title="Invoice information">
            <KeyValueList
              caps
              rows={[
                { label: 'Invoice ID', value: invoice.invoiceId },
                { label: 'Invoice number', value: invoice.invoiceNumber },
                { label: 'Invoice date', value: invoice.invoiceDate },
                { label: 'Due date', value: invoice.dueDate },
                { label: 'Currency', value: invoice.currency },
                { label: 'Description', value: display(invoice.description) },
                { label: 'Created at', value: invoice.createdAt },
                {
                  label: 'Invoice reference',
                  value: display(invoice.invoiceReference),
                },
                { label: 'Created by', value: invoice.createdBy },
              ]}
            />
          </SectionCard>

          <SectionCard title="Customer information">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <Avatar name={invoice.customer.fullname} size="lg" />
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">
                  {invoice.customer.fullname}
                </p>
                <p className="truncate text-sm text-slate-500">
                  {invoice.customer.email}
                </p>
              </div>
            </div>
            <KeyValueList
              caps
              rows={[
                { label: 'Customer name', value: invoice.customer.fullname },
                { label: 'Email', value: invoice.customer.email },
                {
                  label: 'Mobile',
                  value: display(invoice.customer.mobileNumber),
                },
                {
                  label: 'Address',
                  value: display(invoice.customer.address),
                },
              ]}
            />
          </SectionCard>

          <SectionCard title="Line items">
            <Table
              columns={itemColumns}
              rows={invoice.items}
              getRowKey={(item) => item.id}
              framed={false}
            />
          </SectionCard>
        </div>

        <aside className="lg:sticky lg:top-24">
          <SummaryPanel
            title="Amounts"
            currency={currency}
            subTotal={invoice.invoiceSubTotal}
            taxAmount={invoice.totalTax}
            taxPercent={taxPercent(invoice.invoiceSubTotal, invoice.totalTax)}
            discount={invoice.totalDiscount}
            total={invoice.totalAmount}
            totalPaid={invoice.totalPaid}
            outstanding={invoice.balanceAmount}
            status={invoice.status}
            signedDiscount={false}
          />
        </aside>
      </div>
    </div>
  );
}

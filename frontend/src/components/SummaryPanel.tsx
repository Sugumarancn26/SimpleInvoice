import type { ReactNode } from 'react';
import { Card } from './Card.tsx';
import { StatusBadge } from './StatusBadge.tsx';

export function formatMoney(currency: string, amount: number): string {
  return `${currency}$${amount.toFixed(2)}`;
}

function AmountRow({
  label,
  value,
  emphasize = false,
  danger = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt
        className={
          emphasize ? 'font-semibold text-slate-900' : 'text-slate-500'
        }
      >
        {label}
      </dt>
      <dd
        className={
          danger
            ? 'font-semibold text-red-600'
            : emphasize
              ? 'text-base font-bold text-slate-900'
              : 'font-medium text-slate-800'
        }
      >
        {value}
      </dd>
    </div>
  );
}

export function SummaryPanel({
  title = 'Summary',
  currency,
  subTotal,
  taxAmount,
  taxPercent,
  discount,
  total,
  totalPaid,
  outstanding,
  status,
  signedDiscount = true,
  children,
}: {
  title?: string;
  currency: string;
  subTotal: number;
  taxAmount: number;
  taxPercent: number;
  discount: number;
  total: number;
  totalPaid?: number;
  outstanding?: number;
  status?: string;
  signedDiscount?: boolean;
  children?: ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
      <dl className="space-y-3 text-sm">
        <AmountRow label="Subtotal" value={formatMoney(currency, subTotal)} />
        <AmountRow
          label={`Tax (${taxPercent}%)`}
          value={formatMoney(currency, taxAmount)}
        />
        <AmountRow
          label="Discount"
          value={`${signedDiscount ? '-' : ''}${formatMoney(currency, discount)}`}
        />
        <div className="border-t border-slate-200 pt-3">
          <AmountRow
            label="Total"
            value={formatMoney(currency, total)}
            emphasize
          />
        </div>
        {totalPaid != null ? (
          <div className="border-t border-slate-200 pt-3">
            <AmountRow
              label="Total paid"
              value={formatMoney(currency, totalPaid)}
            />
          </div>
        ) : null}
        {outstanding != null ? (
          <AmountRow
            label="Outstanding"
            value={formatMoney(currency, outstanding)}
            danger
          />
        ) : null}
        {status ? (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <dt className="text-slate-500">Invoice status</dt>
            <dd>
              <StatusBadge status={status} />
            </dd>
          </div>
        ) : null}
      </dl>
      {children ? <div className="mt-5">{children}</div> : null}
    </Card>
  );
}

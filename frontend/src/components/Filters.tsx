import type { InvoiceStatusFilter } from '../types/invoice.ts';
import { DateInput } from './DateInput.tsx';

const STATUSES: Array<'' | InvoiceStatusFilter> = [
  '',
  'Draft',
  'Pending',
  'Paid',
  'Overdue',
];

const labelClass =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400';
const selectClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500';

export function Filters({
  status,
  fromDate,
  toDate,
  onStatusChange,
  onFromDateChange,
  onToDateChange,
}: {
  status: '' | InvoiceStatusFilter;
  fromDate: string;
  toDate: string;
  onStatusChange: (value: '' | InvoiceStatusFilter) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className={labelClass}>Status</span>
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as '' | InvoiceStatusFilter)
            }
            className={selectClass}
          >
            {STATUSES.map((value) => (
              <option key={value || 'all'} value={value}>
                {value || 'All'}
              </option>
            ))}
          </select>
        </label>
        <div className="block">
          <label htmlFor="fromDate" className={labelClass}>
            From date
          </label>
          <DateInput
            id="fromDate"
            value={fromDate}
            onChange={(value) => {
              onFromDateChange(value);
              if (toDate && value && toDate < value) {
                onToDateChange('');
              }
            }}
          />
        </div>
        <div className="block">
          <label htmlFor="toDate" className={labelClass}>
            To date
          </label>
          <DateInput
            id="toDate"
            value={toDate}
            min={fromDate || undefined}
            onChange={onToDateChange}
          />
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Date range matches invoice date and due date.
      </p>
    </div>
  );
}

import type { ReactNode } from 'react';
import type { InvoiceOrdering, InvoiceSortBy } from '../types/invoice.ts';

export type TableColumn<T> = {
  id: string;
  header: string;
  sortField?: InvoiceSortBy;
  align?: 'left' | 'right';
  render: (row: T) => ReactNode;
};

function SortMark({
  active,
  ordering,
}: {
  active: boolean;
  ordering?: InvoiceOrdering;
}) {
  return (
    <span
      className={`ml-1 inline-block text-[10px] leading-none ${
        active ? 'text-slate-500' : 'text-slate-300'
      }`}
      aria-hidden="true"
    >
      {active && ordering === 'ASC' ? '▲' : '▼'}
    </span>
  );
}

export function Table<T>({
  columns,
  rows,
  sortBy,
  ordering,
  onSort,
  onRowClick,
  getRowKey,
  framed = true,
}: {
  columns: Array<TableColumn<T>>;
  rows: T[];
  sortBy?: InvoiceSortBy;
  ordering?: InvoiceOrdering;
  onSort?: (field: InvoiceSortBy) => void;
  onRowClick?: (row: T) => void;
  getRowKey: (row: T) => string;
  framed?: boolean;
}) {
  return (
    <>
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => {
          const body = (
            <dl className="grid grid-cols-1 gap-2">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="flex items-start justify-between gap-3"
                >
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {column.header}
                  </dt>
                  <dd className="text-sm font-medium text-slate-900">
                    {column.render(row)}
                  </dd>
                </div>
              ))}
            </dl>
          );

          return (
            <li key={getRowKey(row)}>
              {onRowClick ? (
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm"
                >
                  {body}
                </button>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div
        className={
          framed
            ? 'hidden overflow-x-auto rounded-xl border border-slate-200 md:block'
            : 'hidden overflow-x-auto md:block'
        }
      >
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${
                    column.align === 'right' ? 'text-right' : ''
                  }`}
                  aria-sort={
                    column.sortField && sortBy === column.sortField
                      ? ordering === 'ASC'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {column.sortField && onSort ? (
                    <button
                      type="button"
                      onClick={() => {
                        const field = column.sortField;
                        if (field) {
                          onSort(field);
                        }
                      }}
                      className="inline-flex items-center hover:text-slate-600"
                    >
                      {column.header}
                      <SortMark
                        active={sortBy === column.sortField}
                        ordering={ordering}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className={`group border-b border-slate-100 last:border-b-0 ${
                  onRowClick ? 'cursor-pointer hover:bg-sky-50' : ''
                }`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`px-4 py-3.5 text-slate-800 ${
                      column.align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function deriveStatus(
  status: 'Draft' | 'Pending' | 'Paid',
  dueDate: Date,
): string {
  const today = new Date(new Date().toISOString().slice(0, 10)); // UTC calendar date
  if (status !== 'Paid' && dueDate < today) return 'Overdue';
  return status;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  AUD: 'AU$',
  USD: '$',
  GBP: '£',
};

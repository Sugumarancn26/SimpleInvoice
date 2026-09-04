export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateInvoiceTotals(input: {
  quantity: number;
  rate: number;
  taxPercent: number;
  discount: number;
  totalPaid?: number;
}) {
  const subTotal = round2(input.quantity * input.rate);
  const taxAmount = round2(subTotal * (input.taxPercent / 100));
  const totalAmount = round2(subTotal + taxAmount - input.discount);
  const balanceAmount = round2(totalAmount - (input.totalPaid ?? 0));
  return { subTotal, taxAmount, totalAmount, balanceAmount };
}

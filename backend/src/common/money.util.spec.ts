import { calculateInvoiceTotals } from './money.util';

// Appendix A: Honda RC150 × 2 @ 1000, tax 10%, discount 20, totalPaid 1451.34
const appendixA = calculateInvoiceTotals({
  quantity: 2,
  rate: 1000,
  taxPercent: 10,
  discount: 20,
  totalPaid: 1451.34,
});

describe('calculateInvoiceTotals §2.3.2', () => {
  it('subTotal = quantity × rate', () => {
    expect(appendixA.subTotal).toBe(2000);
  });

  it('taxAmount = subTotal × (tax% / 100)', () => {
    expect(appendixA.taxAmount).toBe(200);
  });

  it('totalAmount = subTotal + taxAmount - discount', () => {
    expect(appendixA.totalAmount).toBe(2180);
  });

  it('balanceAmount = totalAmount - totalPaid', () => {
    expect(appendixA.balanceAmount).toBe(728.66);
  });
});

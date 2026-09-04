import { deriveStatus } from './date.util';

function utcDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function utcToday(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

const pastDue = utcDate('2020-01-01');
const futureDue = utcDate('2099-12-31');

describe('deriveStatus §2.3.2', () => {
  it('Paid never returns Overdue', () => {
    expect(deriveStatus('Paid', pastDue)).toBe('Paid');
  });

  it('unpaid + past due returns Overdue', () => {
    expect(deriveStatus('Draft', pastDue)).toBe('Overdue');
    expect(deriveStatus('Pending', pastDue)).toBe('Overdue');
  });

  it('unpaid + future due does not return Overdue', () => {
    expect(deriveStatus('Draft', futureDue)).toBe('Draft');
    expect(deriveStatus('Pending', futureDue)).toBe('Pending');
  });

  it('unpaid + dueDate equal to today does not return Overdue (spec: dueDate < today)', () => {
    expect(deriveStatus('Pending', utcToday())).toBe('Pending');
  });
});

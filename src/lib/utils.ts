import type { BillingCycleType, KnownService, BankImportTransaction } from '../types';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
  JPY: '¥',
  BRL: 'R$',
  MXN: 'Mex$'
};

export function formatCurrency(amount: number, currency = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getDaysUntil(targetDateStr: string): number {
  if (!targetDateStr) return 999;
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateNextChargeDate(startDateStr: string, cycle: BillingCycleType): string {
  const start = new Date(startDateStr || Date.now());
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let next = new Date(start);

  if (cycle === 'one_time') {
    return startDateStr;
  }

  // Advance next date until it's today or in the future
  while (next < now) {
    if (cycle === 'weekly') {
      next.setDate(next.getDate() + 7);
    } else if (cycle === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else if (cycle === 'quarterly') {
      next.setMonth(next.getMonth() + 3);
    } else if (cycle === 'yearly') {
      next.setFullYear(next.getFullYear() + 1);
    }
  }

  return next.toISOString().split('T')[0];
}

export function calculateMonthlySpend(cost: number, cycle: BillingCycleType): number {
  switch (cycle) {
    case 'weekly':
      return cost * 4.33;
    case 'monthly':
      return cost;
    case 'quarterly':
      return cost / 3;
    case 'yearly':
      return cost / 12;
    case 'one_time':
      return 0;
    default:
      return cost;
  }
}

export function matchUrlToKnownService(input: string, knownServices: KnownService[]): KnownService | null {
  if (!input) return null;
  const cleaned = input.toLowerCase().trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  for (const srv of knownServices) {
    if (srv.domain.toLowerCase().includes(cleaned) || cleaned.includes(srv.domain.toLowerCase())) {
      return srv;
    }
    for (const alias of srv.aliases) {
      if (alias.toLowerCase() === cleaned || cleaned.includes(alias.toLowerCase())) {
        return srv;
      }
    }
  }
  return null;
}

export function parseBankCsv(csvText: string, knownServices: KnownService[]): Partial<BankImportTransaction>[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const results: Partial<BankImportTransaction>[] = [];
  const header = lines[0].toLowerCase().split(',');

  // Identify column indices
  let dateIdx = header.findIndex(h => h.includes('date') || h.includes('time'));
  let descIdx = header.findIndex(h => h.includes('description') || h.includes('merchant') || h.includes('payee') || h.includes('name') || h.includes('details'));
  let amountIdx = header.findIndex(h => h.includes('amount') || h.includes('total') || h.includes('debit') || h.includes('cost'));

  if (dateIdx === -1) dateIdx = 0;
  if (descIdx === -1) descIdx = 1;
  if (amountIdx === -1) amountIdx = 2;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length <= Math.max(dateIdx, descIdx, amountIdx)) continue;

    const dateStr = cols[dateIdx];
    const desc = cols[descIdx];
    const rawAmt = cols[amountIdx];

    if (!desc || !rawAmt) continue;

    const amount = Math.abs(parseFloat(rawAmt.replace(/[^0-9.-]/g, '')));
    if (isNaN(amount) || amount === 0) continue;

    const matchedService = matchUrlToKnownService(desc, knownServices);

    results.push({
      merchant_name: desc,
      amount,
      currency: 'USD',
      transaction_date: dateStr || new Date().toISOString().split('T')[0],
      suggested_service_slug: matchedService?.slug,
      status: 'pending'
    });
  }

  return results;
}

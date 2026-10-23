export interface PendingPay {
  tab: 'consult' | 'shop' | 'learn';
  referenceId: string;
  payRef: string;
}

const PENDING = 'fat_pending_pay';
const LAST = 'fat_last_pay';

function readStore(key: string): PendingPay | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw) as PendingPay;
    if (!p?.payRef || !p?.referenceId) return null;
    return p;
  } catch {
    return null;
  }
}

function writeStore(key: string, p: PendingPay): void {
  const raw = JSON.stringify(p);
  localStorage.setItem(key, raw);
  sessionStorage.setItem(key, raw);
  window.dispatchEvent(new Event('fat-pay-updated'));
}

function clearStore(key: string): void {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

export function savePendingPay(p: PendingPay): void {
  writeStore(PENDING, p);
}

export function readPendingPay(): PendingPay | null {
  return readStore(PENDING);
}

export function clearPendingPay(): void {
  clearStore(PENDING);
}

export function saveLastPay(p: PendingPay): void {
  writeStore(LAST, p);
}

export function readLastPay(): PendingPay | null {
  return readStore(LAST);
}

export function paystackReturnReference(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('reference') || params.get('trxref');
  return ref && ref.trim() ? ref.trim() : null;
}

const CONSULT = 'fat_consult_snapshot';

export interface ConsultSnapshot {
  result: {
    referenceId: string;
    expert: {
      id: string;
      name: string;
      credentials: string;
      specialties: string[];
      language: string;
      rating: number;
      responseWindow: string;
    };
    status: 'under review';
  };
  name: string;
  email: string;
  concern: string;
  preferredTime: string;
}

export function saveConsultSnapshot(s: ConsultSnapshot): void {
  sessionStorage.setItem(CONSULT, JSON.stringify(s));
}

export function readConsultSnapshot(): ConsultSnapshot | null {
  try {
    const raw = sessionStorage.getItem(CONSULT);
    if (!raw) return null;
    const s = JSON.parse(raw) as ConsultSnapshot;
    if (!s?.result?.referenceId) return null;
    return s;
  } catch {
    return null;
  }
}

export function clearConsultSnapshot(): void {
  sessionStorage.removeItem(CONSULT);
}

export function clearPayQuery(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has('pay') && !url.searchParams.has('reference') && !url.searchParams.has('trxref')) return;
  url.searchParams.delete('pay');
  url.searchParams.delete('reference');
  url.searchParams.delete('trxref');
  const qs = url.searchParams.toString();
  window.history.replaceState({}, '', `${url.pathname}${qs ? `?${qs}` : ''}${url.hash}`);
}

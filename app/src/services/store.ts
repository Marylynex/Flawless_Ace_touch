export interface StoredRequest {
  referenceId: string;
  name: string;
  email: string;
  concern: string;
  preferredTime: string;
  expertName: string;
  paid: boolean;
  payRef: string | null;
  createdAt: string;
  status: 'under review';
}

const KEY = 'fat_requests';

const SEED: StoredRequest[] = [
  {
    referenceId: 'FAT-SEED01',
    name: 'Adaeze N.',
    email: 'adaeze@example.com',
    concern: 'acne',
    preferredTime: 'Weekday evening',
    expertName: 'Dr. Amara Osei',
    paid: true,
    payRef: 'FAT-SEEDPAY1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'under review',
  },
  {
    referenceId: 'FAT-SEED02',
    name: 'Brian O.',
    email: 'brian@example.com',
    concern: 'pigmentation',
    preferredTime: 'Weekend morning',
    expertName: 'Dr. Lena Fischer',
    paid: false,
    payRef: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'under review',
  },
];

function read(): StoredRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function write(rows: StoredRequest[]): void {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function listRequests(): StoredRequest[] {
  return [...read(), ...SEED].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function recordRequest(r: Omit<StoredRequest, 'paid' | 'payRef' | 'createdAt' | 'status'>): void {
  const rows = read();
  rows.push({ ...r, paid: false, payRef: null, createdAt: new Date().toISOString(), status: 'under review' });
  write(rows);
}

export function markPaid(referenceId: string, payRef: string): void {
  write(read().map((r) => (r.referenceId === referenceId ? { ...r, paid: true, payRef } : r)));
}

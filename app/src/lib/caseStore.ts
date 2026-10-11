import { promises as fs } from 'fs';
import path from 'path';

export interface CaseRecord {
  id: string;
  name: string;
  email: string;
  concern: string;
  details: string;
  photoName: string | null;
  preferredTime: string;
  expertName: string;
  status: 'submitted' | 'under review' | 'answered';
  paid: boolean;
  payRef: string | null;
  createdAt: string;
}

const FILE = path.join(process.cwd(), 'data', 'cases.json');
let memory: CaseRecord[] | null = null; // fallback when the FS is read-only (hosted functions)

function seed(): CaseRecord[] {
  const now = Date.now();
  return [
    {
      id: 'FAT-SEED01', name: 'Adaeze N.', email: 'adaeze@example.com', concern: 'acne',
      details: 'Breakouts along the jawline.', photoName: null, preferredTime: 'Weekday evening',
      expertName: 'Dr. Amara Osei', status: 'under review', paid: true, payRef: 'FAT-SEEDPAY1',
      createdAt: new Date(now - 86400000).toISOString(),
    },
    {
      id: 'FAT-SEED02', name: 'Brian O.', email: 'brian@example.com', concern: 'pigmentation',
      details: 'Dark spots after acne.', photoName: null, preferredTime: 'Weekend morning',
      expertName: 'Dr. Lena Fischer', status: 'submitted', paid: false, payRef: null,
      createdAt: new Date(now - 3600000).toISOString(),
    },
  ];
}

export async function listCases(): Promise<CaseRecord[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    return JSON.parse(raw) as CaseRecord[];
  } catch {
    if (!memory) {
      memory = seed();
      try {
        await fs.mkdir(path.dirname(FILE), { recursive: true });
        await fs.writeFile(FILE, JSON.stringify(memory, null, 2));
      } catch {
        // read-only FS (hosted): keep memory-only
      }
    }
    return memory;
  }
}

async function save(cases: CaseRecord[]): Promise<void> {
  memory = cases;
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(cases, null, 2));
  } catch {
    // read-only FS: memory-only, fine for prototype
  }
}

export async function createCase(c: Omit<CaseRecord, 'id' | 'status' | 'paid' | 'payRef' | 'createdAt'> & { referenceId: string }): Promise<CaseRecord> {
  const cases = await listCases();
  const rec: CaseRecord = {
    id: c.referenceId, name: c.name, email: c.email, concern: c.concern,
    details: c.details, photoName: c.photoName, preferredTime: c.preferredTime,
    expertName: c.expertName, status: 'under review', paid: false, payRef: null,
    createdAt: new Date().toISOString(),
  };
  cases.unshift(rec);
  await save(cases);
  return rec;
}

export async function updateCase(id: string, patch: Partial<Pick<CaseRecord, 'status' | 'paid' | 'payRef'>>): Promise<CaseRecord | null> {
  const cases = await listCases();
  const rec = cases.find((c) => c.id === id);
  if (!rec) return null;
  Object.assign(rec, patch);
  await save(cases);
  return rec;
}

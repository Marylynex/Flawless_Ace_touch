import { promises as fs } from 'fs';
import path from 'path';
import { getDb, ensureSchema } from './db';

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

export function usesPostgres(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

// ---------- Postgres backend (Neon) ----------

interface CaseRow {
  id: string;
  name: string;
  email: string;
  concern: string;
  details: string;
  photo_name: string | null;
  preferred_time: string;
  expert_name: string;
  status: CaseRecord['status'];
  paid: boolean;
  pay_ref: string | null;
  created_at: string;
}

function toRecord(r: CaseRow): CaseRecord {
  return {
    id: r.id, name: r.name, email: r.email, concern: r.concern, details: r.details,
    photoName: r.photo_name, preferredTime: r.preferred_time, expertName: r.expert_name,
    status: r.status, paid: r.paid, payRef: r.pay_ref,
    createdAt: typeof r.created_at === 'string' ? r.created_at : new Date(r.created_at).toISOString(),
  };
}

async function pgList(): Promise<CaseRecord[]> {
  const sql = getDb();
  if (!sql) throw new Error('no-db');
  await ensureSchema();
  const rows = (await sql`SELECT * FROM cases ORDER BY created_at DESC`) as unknown as CaseRow[];
  if (rows.length === 0) {
    for (const s of seed()) {
      await sql`INSERT INTO cases (id, name, email, concern, details, photo_name, preferred_time, expert_name, status, paid, pay_ref, created_at)
        VALUES (${s.id}, ${s.name}, ${s.email}, ${s.concern}, ${s.details}, ${s.photoName}, ${s.preferredTime}, ${s.expertName}, ${s.status}, ${s.paid}, ${s.payRef}, ${s.createdAt})`;
    }
    const seeded = (await sql`SELECT * FROM cases ORDER BY created_at DESC`) as unknown as CaseRow[];
    return seeded.map(toRecord);
  }
  return rows.map(toRecord);
}

async function pgCreate(c: Omit<CaseRecord, 'status' | 'paid' | 'payRef' | 'createdAt'>): Promise<CaseRecord> {
  const sql = getDb();
  if (!sql) throw new Error('no-db');
  await ensureSchema();
  const createdAt = new Date().toISOString();
  await sql`INSERT INTO cases (id, name, email, concern, details, photo_name, preferred_time, expert_name, status, paid, pay_ref, created_at)
    VALUES (${c.id}, ${c.name}, ${c.email}, ${c.concern}, ${c.details}, ${c.photoName}, ${c.preferredTime}, ${c.expertName}, 'under review', FALSE, NULL, ${createdAt})`;
  return { ...c, status: 'under review', paid: false, payRef: null, createdAt };
}

async function pgUpdate(
  id: string,
  patch: Partial<Pick<CaseRecord, 'status' | 'paid' | 'payRef'>>,
): Promise<CaseRecord | null> {
  const sql = getDb();
  if (!sql) throw new Error('no-db');
  await ensureSchema();
  if (patch.status !== undefined) {
    await sql`UPDATE cases SET status = ${patch.status} WHERE id = ${id}`;
  }
  if (patch.paid !== undefined) {
    await sql`UPDATE cases SET paid = ${patch.paid} WHERE id = ${id}`;
  }
  if (patch.payRef !== undefined) {
    await sql`UPDATE cases SET pay_ref = ${patch.payRef} WHERE id = ${id}`;
  }
  const rows = (await sql`SELECT * FROM cases WHERE id = ${id} LIMIT 1`) as unknown as CaseRow[];
  return rows.length ? toRecord(rows[0]) : null;
}

// ---------- JSON-file backend (local fallback) ----------

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

async function fileList(): Promise<CaseRecord[]> {
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

async function fileSave(cases: CaseRecord[]): Promise<void> {
  memory = cases;
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(cases, null, 2));
  } catch {
    // read-only FS: memory-only, fine for prototype
  }
}

// ---------- Public API (Postgres when DATABASE_URL is set, else file) ----------

export async function listCases(): Promise<CaseRecord[]> {
  if (usesPostgres()) return pgList();
  return fileList();
}

export async function createCase(c: Omit<CaseRecord, 'id' | 'status' | 'paid' | 'payRef' | 'createdAt'> & { referenceId: string }): Promise<CaseRecord> {
  if (usesPostgres()) {
    const { referenceId, ...rest } = c;
    return pgCreate({ ...rest, id: referenceId });
  }
  const cases = await fileList();
  const rec: CaseRecord = {
    id: c.referenceId, name: c.name, email: c.email, concern: c.concern,
    details: c.details, photoName: c.photoName, preferredTime: c.preferredTime,
    expertName: c.expertName, status: 'under review', paid: false, payRef: null,
    createdAt: new Date().toISOString(),
  };
  cases.unshift(rec);
  await fileSave(cases);
  return rec;
}

export async function updateCase(id: string, patch: Partial<Pick<CaseRecord, 'status' | 'paid' | 'payRef'>>): Promise<CaseRecord | null> {
  if (usesPostgres()) return pgUpdate(id, patch);
  const cases = await fileList();
  const rec = cases.find((c) => c.id === id);
  if (!rec) return null;
  Object.assign(rec, patch);
  await fileSave(cases);
  return rec;
}

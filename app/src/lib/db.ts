import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false, false> | null | undefined;

export function getDb(): NeonQueryFunction<false, false> | null {
  if (client !== undefined) return client;
  const url = process.env.DATABASE_URL;
  client = url ? neon(url) : null;
  return client;
}

export async function ensureSchema(): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;
  await sql`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      concern TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '',
      photo_name TEXT,
      preferred_time TEXT NOT NULL DEFAULT '',
      expert_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'under review',
      paid BOOLEAN NOT NULL DEFAULT FALSE,
      pay_ref TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS cases_email_idx ON cases (email);
  `;
  return true;
}

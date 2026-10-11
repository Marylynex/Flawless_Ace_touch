import { NextResponse } from 'next/server';
import { listCases, createCase } from '@/lib/caseStore';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const cases = await listCases();
  const filtered = email
    ? cases.filter((c) => c.email.toLowerCase() === email.toLowerCase())
    : cases;
  return NextResponse.json({ cases: filtered });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    referenceId?: string; name?: string; email?: string; concern?: string;
    details?: string; photoName?: string | null; preferredTime?: string; expertName?: string;
  };
  if (!body.referenceId || !body.name || !body.email || !body.concern) {
    return NextResponse.json({ error: 'reference-name-email-concern-required' }, { status: 400 });
  }
  const rec = await createCase({
    referenceId: body.referenceId,
    name: body.name,
    email: body.email,
    concern: body.concern,
    details: body.details || '',
    photoName: body.photoName ?? null,
    preferredTime: body.preferredTime || '',
    expertName: body.expertName || '',
  });
  return NextResponse.json({ case: rec }, { status: 201 });
}

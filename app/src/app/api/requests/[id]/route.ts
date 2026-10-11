import { NextResponse } from 'next/server';
import { updateCase } from '@/lib/caseStore';
import { rateLimited, clientIp } from '@/lib/safety';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (rateLimited(`admin:${clientIp(req)}`, 60)) {
    return NextResponse.json({ error: 'too-many-requests' }, { status: 429 });
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    status?: 'submitted' | 'under review' | 'answered'; paid?: boolean; payRef?: string;
  };
  const patch: { status?: 'submitted' | 'under review' | 'answered'; paid?: boolean; payRef?: string } = {};
  if (body.status && ['submitted', 'under review', 'answered'].includes(body.status)) patch.status = body.status;
  if (typeof body.paid === 'boolean') patch.paid = body.paid;
  if (typeof body.payRef === 'string') patch.payRef = body.payRef;
  const rec = await updateCase(decodeURIComponent(id), patch);
  if (!rec) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  return NextResponse.json({ case: rec });
}

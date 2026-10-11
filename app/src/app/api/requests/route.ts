import { NextResponse } from 'next/server';
import { listCases, createCase } from '@/lib/caseStore';
import { escapeHtml, rateLimited, clientIp } from '@/lib/safety';
import { Resend } from 'resend';

const CONCERNS = ['acne', 'dryness', 'pigmentation', 'sensitivity', 'uneven-tone', 'early-aging'];

async function notifySpecialist(rec: {
  id: string; name: string; email: string; concern: string;
  details: string; preferredTime: string; expertName: string;
}): Promise<void> {
  const inbox = process.env.SPECIALIST_INBOX;
  const apiKey = process.env.RESEND_API_KEY;
  if (!inbox || !apiKey) return; // not configured — skip silently
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: inbox,
      subject: `New consultation case ${rec.id} - ${rec.concern}`,
      html: `<p>A new consultation request needs review.</p>
<p>Case: <strong>${escapeHtml(rec.id)}</strong><br/>Client: <strong>${escapeHtml(rec.name)}</strong> (${escapeHtml(rec.email)})<br/>Concern: <strong>${escapeHtml(rec.concern)}</strong><br/>Preferred time: <strong>${escapeHtml(rec.preferredTime || '-')}</strong><br/>Matched expert: <strong>${escapeHtml(rec.expertName || '-')}</strong></p>
<p>Client notes:</p><blockquote>${escapeHtml(rec.details || '-')}</blockquote>
<p>Open the admin portal to review this case. Mock prototype data.</p>`,
    });
  } catch (err) {
    console.error('[requests] specialist notify failed:', err instanceof Error ? err.message : err);
  }
}

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
  if (rateLimited(`req:${clientIp(req)}`, 30)) {
    return NextResponse.json({ error: 'too-many-requests' }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    referenceId?: string; name?: string; email?: string; concern?: string;
    details?: string; photoName?: string | null; preferredTime?: string; expertName?: string;
  };
  const name = (body.name || '').trim().slice(0, 100);
  const email = (body.email || '').trim().slice(0, 254);
  const concern = (body.concern || '').trim();
  if (!body.referenceId || !name || !/.+@.+\..+/.test(email) || !CONCERNS.includes(concern)) {
    return NextResponse.json({ error: 'valid-payload-required' }, { status: 400 });
  }
  const rec = await createCase({
    referenceId: String(body.referenceId).slice(0, 32),
    name,
    email,
    concern,
    details: (body.details || '').slice(0, 2000),
    photoName: null, // filenames are client-local mock data; never trust or store them
    preferredTime: (body.preferredTime || '').slice(0, 60),
    expertName: (body.expertName || '').slice(0, 100),
  });
  await notifySpecialist(rec);
  return NextResponse.json({ case: rec }, { status: 201 });
}

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml, rateLimited, clientIp } from '@/lib/safety';

export async function POST(req: Request) {
  if (rateLimited(`email:${clientIp(req)}`, 10)) {
    return NextResponse.json({ error: 'too-many-requests' }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    to?: string;
    name?: string;
    concern?: string;
    referenceId?: string;
    expertName?: string;
  };
  const to = (body.to || '').trim();
  if (!to || !/.+@.+\..+/.test(to)) {
    return NextResponse.json({ error: 'valid-recipient-required' }, { status: 400 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'email-not-configured' }, { status: 500 });
  }
  const name = escapeHtml((body.name || 'there').slice(0, 100));
  const concern = escapeHtml((body.concern || '-').slice(0, 60));
  const referenceId = escapeHtml((body.referenceId || '-').slice(0, 32));
  const expertName = escapeHtml((body.expertName || '-').slice(0, 100));
  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: `Your Flawless AceTouch consultation request ${referenceId}`,
      html: `<p>Hi ${name},</p>
<p>Thanks for requesting a skin consultation with <strong>Flawless AceTouch</strong>.</p>
<p>Concern: <strong>${concern}</strong><br/>Reference: <strong>${referenceId}</strong><br/>Matched expert: <strong>${expertName}</strong> (mock)</p>
<p>Your request is under review. This is a prototype message with mock data — not medical advice.</p>`,
    });
    const data = result as unknown as { data?: { id?: string } | null };
    return NextResponse.json({ sent: true, id: data?.data?.id ?? null });
  } catch (err) {
    console.error('[send-email] failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'send-failed' }, { status: 502 });
  }
}

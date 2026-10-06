import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    to?: string;
    name?: string;
    concern?: string;
    referenceId?: string;
    expertName?: string;
  };
  const { to, name, concern, referenceId, expertName } = body;
  if (!to || !/.+@.+\..+/.test(to)) {
    return NextResponse.json({ error: 'valid-recipient-required' }, { status: 400 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'email-not-configured' }, { status: 500 });
  }
  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: `Your Flawless AceTouch consultation request ${referenceId || ''}`.trim(),
      html: `<p>Hi ${name || 'there'},</p>
<p>Thanks for requesting a skin consultation with <strong>Flawless AceTouch</strong>.</p>
<p>Concern: <strong>${concern || '-'}</strong><br/>Reference: <strong>${referenceId || '-'}</strong><br/>Matched expert: <strong>${expertName || '-'}</strong> (mock)</p>
<p>Your request is under review. This is a prototype message with mock data — not medical advice.</p>`,
    });
    const data = result as unknown as { data?: { id?: string } | null };
    return NextResponse.json({ sent: true, id: data?.data?.id ?? null });
  } catch (err) {
    console.error('[send-email] failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'send-failed' }, { status: 502 });
  }
}

import { NextResponse } from 'next/server';
import { rateLimited, clientIp } from '@/lib/safety';

const SITE = 'https://flawlessace.netlify.app';

function hostAllowed(hostname: string): boolean {
  return (
    hostname === 'flawlessace.netlify.app' ||
    hostname.endsWith('.netlify.app') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  );
}

function callbackUrl(req: Request, candidate?: string): string {
  const forwardedHost = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(',')[0].trim();
  const proto = (req.headers.get('x-forwarded-proto') || 'https').split(',')[0].trim();
  const headerOrigin = req.headers.get('origin') || '';

  const candidates = [candidate, headerOrigin, forwardedHost ? `${proto}://${forwardedHost}` : '', SITE];
  for (const raw of candidates) {
    if (!raw) continue;
    try {
      const url = new URL(raw);
      if (hostAllowed(url.hostname)) {
        return `${url.origin}/?pay=return`;
      }
    } catch {
      // try next candidate
    }
  }
  return `${SITE}/?pay=return`;
}

export async function POST(req: Request) {
  if (rateLimited(`pay:${clientIp(req)}`, 20)) {
    return NextResponse.json({ error: 'too-many-requests' }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    amountNgn?: number;
    callbackUrl?: string;
  };
  const { email, amountNgn } = body;
  if (!email || !/.+@.+\..+/.test(email) || !amountNgn || Number(amountNgn) <= 0) {
    return NextResponse.json({ error: 'email-and-amount-required' }, { status: 400 });
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const reference =
    'FAT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const callback_url = callbackUrl(req, body.callbackUrl);
  if (secret) {
    try {
      const r = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify({
          email,
          amount: Math.round(Number(amountNgn) * 100),
          reference,
          currency: 'NGN',
          callback_url,
        }),
      });
      const data = (await r.json()) as { status?: boolean; message?: string; data?: { authorization_url?: string; reference?: string } };
      if (!r.ok || !data?.status) {
        return NextResponse.json({ error: 'paystack-error', detail: data?.message || 'init failed' }, { status: 502 });
      }
      return NextResponse.json({
        mock: false,
        authorization_url: data.data?.authorization_url,
        reference: data.data?.reference,
        callback_url,
      });
    } catch (err) {
      console.error('[payments] init failed:', err instanceof Error ? err.message : err);
      return NextResponse.json({ error: 'paystack-unreachable' }, { status: 502 });
    }
  }
  return NextResponse.json({
    mock: true,
    authorization_url: '#mock-paystack-checkout',
    reference,
    amountNgn: Number(amountNgn),
    callback_url,
    note: 'Mock checkout — no real charge. Add PAYSTACK_SECRET_KEY to .env.local for live test mode.',
  });
}

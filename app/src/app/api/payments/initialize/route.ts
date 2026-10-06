import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; amountNgn?: number };
  const { email, amountNgn } = body;
  if (!email || !/.+@.+\..+/.test(email) || !amountNgn || Number(amountNgn) <= 0) {
    return NextResponse.json({ error: 'email-and-amount-required' }, { status: 400 });
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const reference =
    'FAT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  if (secret) {
    try {
      const r = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ email, amount: Math.round(Number(amountNgn) * 100), reference, currency: 'NGN' }),
      });
      const data = (await r.json()) as { status?: boolean; message?: string; data?: { authorization_url?: string; reference?: string } };
      if (!r.ok || !data?.status) {
        return NextResponse.json({ error: 'paystack-error', detail: data?.message || 'init failed' }, { status: 502 });
      }
      return NextResponse.json({
        mock: false,
        authorization_url: data.data?.authorization_url,
        reference: data.data?.reference,
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
    note: 'Mock checkout — no real charge. Add PAYSTACK_SECRET_KEY to .env.local for live test mode.',
  });
}

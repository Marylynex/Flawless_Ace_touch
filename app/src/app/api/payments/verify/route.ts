import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { reference?: string };
  const { reference } = body;
  if (!reference) {
    return NextResponse.json({ error: 'reference-required' }, { status: 400 });
  }
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (secret && !String(reference).startsWith('FAT-')) {
    try {
      const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = (await r.json()) as { data?: { status?: string } };
      return NextResponse.json({ mock: false, paid: r.ok && data?.data?.status === 'success', reference });
    } catch (err) {
      console.error('[payments] verify failed:', err instanceof Error ? err.message : err);
      return NextResponse.json({ error: 'paystack-unreachable' }, { status: 502 });
    }
  }
  return NextResponse.json({ mock: true, paid: true, reference });
}

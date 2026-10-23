import { NextResponse } from 'next/server';
import { rateLimited, clientIp } from '@/lib/safety';
import { groqChat, groqConfigured, SKIN_EDUCATOR } from '@/lib/groq';

export async function POST(req: Request) {
  if (rateLimited(`ai:${clientIp(req)}`, 20)) {
    return NextResponse.json({ error: 'too-many-requests' }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as { question?: string };
  const question = (body.question || '').trim().slice(0, 1000);
  if (!question) {
    return NextResponse.json({ error: 'question-required' }, { status: 400 });
  }
  if (!groqConfigured()) {
    return NextResponse.json({ error: 'ai-not-configured' }, { status: 500 });
  }
  try {
    const answer = await groqChat([
      { role: 'system', content: SKIN_EDUCATOR },
      { role: 'user', content: question },
    ]);
    return NextResponse.json({ answer });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'ai-unavailable';
    if (msg === 'groq-not-configured') {
      return NextResponse.json({ error: 'ai-not-configured' }, { status: 500 });
    }
    return NextResponse.json({ error: 'ai-unavailable' }, { status: 502 });
  }
}

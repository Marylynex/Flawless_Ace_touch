import { NextResponse } from 'next/server';

const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { question?: string };
  const question = (body.question || '').trim();
  if (!question) {
    return NextResponse.json({ error: 'question-required' }, { status: 400 });
  }
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: 'ai-not-configured' }, { status: 500 });
  }
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 600,
        messages: [
          {
            role: 'system',
            content:
              'You are the Flawless AceTouch skin-education assistant. Explain skincare and cosmetic formulation topics in plain, friendly language. Give general educational information only: never diagnose conditions, never prescribe treatments, and always suggest consulting a dermatologist for personal advice. Keep answers under 200 words.',
          },
          { role: 'user', content: question.slice(0, 1000) },
        ],
      }),
    });
    if (!r.ok) {
      console.error('[ask-ai] groq error:', r.status);
      return NextResponse.json({ error: 'ai-unavailable' }, { status: 502 });
    }
    const data = (await r.json()) as { choices?: { message?: { content?: string } }[] };
    return NextResponse.json({ answer: data?.choices?.[0]?.message?.content || 'No answer returned.' });
  } catch (err) {
    console.error('[ask-ai] failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'ai-unavailable' }, { status: 502 });
  }
}

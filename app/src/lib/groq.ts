const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export function groqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

function groqModel(): string {
  return process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChoice {
  message?: {
    role?: string;
    content?: string | null;
    reasoning?: string | null;
  };
}

export async function groqChat(
  messages: GroqMessage[],
  opts?: { maxTokens?: number; temperature?: number },
): Promise<string> {
  const key = (process.env.GROQ_API_KEY || '').trim();
  if (!key) throw new Error('groq-not-configured');

  const model = groqModel();
  const payload: Record<string, unknown> = {
    model,
    temperature: opts?.temperature ?? 0.4,
    max_completion_tokens: opts?.maxTokens ?? 600,
    messages,
  };
  if (model.includes('gpt-oss') || model.includes('qwen')) {
    payload.reasoning_effort = 'low';
  }

  const r = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(payload),
  });
  const data = (await r.json().catch(() => ({}))) as {
    error?: { message?: string };
    choices?: GroqChoice[];
  };
  if (!r.ok) {
    const detail = data.error?.message || `status ${r.status}`;
    console.error('[groq] error:', detail);
    throw new Error('groq-unavailable');
  }
  const msg = data.choices?.[0]?.message;
  const text = (msg?.content || msg?.reasoning || '').trim();
  return text || 'No answer returned.';
}

export const SKIN_EDUCATOR =
  'You are the Flawless AceTouch skin-education assistant. Explain skincare and cosmetic formulation in plain, friendly language. Give general educational information only: never diagnose conditions, never prescribe treatments, and always suggest consulting a dermatologist or aesthetician for personal advice. Keep answers under 200 words.';

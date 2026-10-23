import mockExperts from '../data/mockExperts.json';

export interface Expert {
  id: string;
  name: string;
  credentials: string;
  role?: string;
  specialties: string[];
  language: string;
  rating: number;
  responseWindow: string;
}

export interface ConsultationRequest {
  name: string;
  email: string;
  concern: string;
  details: string;
  photoName: string | null;
  preferredTime: string;
}

export interface MatchResult {
  referenceId: string;
  expert: Expert;
  status: 'under review';
}

// Hardcoded demo user — no real authentication in this prototype.
export const demoUser = { name: 'Demo Guest' };

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function submitRequest(req: ConsultationRequest): Promise<MatchResult> {
  await wait(900); // simulate network + matching
  const experts = mockExperts as Expert[];
  const expert =
    experts.find((e) => e.specialties.includes(req.concern)) ?? experts[0];
  const referenceId = 'FAT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  await recordServerCase(req, referenceId, expert.name);
  return { referenceId, expert, status: 'under review' };
}

export interface EmailStatus {
  sent: boolean;
  message: string;
}

export interface ServerCase {
  id: string;
  name: string;
  email: string;
  concern: string;
  details: string;
  photoName: string | null;
  preferredTime: string;
  expertName: string;
  status: 'submitted' | 'under review' | 'answered';
  paid: boolean;
  payRef: string | null;
  createdAt: string;
}

async function recordServerCase(req: ConsultationRequest, referenceId: string, expertName: string): Promise<void> {
  try {
    await fetch(`${API}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referenceId, name: req.name, email: req.email, concern: req.concern,
        details: req.details, photoName: req.photoName,
        preferredTime: req.preferredTime, expertName,
      }),
    });
  } catch {
    // server unreachable (e.g. static preview) — local match still works
  }
}

export async function listServerCases(email?: string): Promise<ServerCase[]> {
  const url = email ? `${API}/api/requests?email=${encodeURIComponent(email)}` : `${API}/api/requests`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not load forms.');
  const data = (await res.json()) as { cases: ServerCase[] };
  return data.cases;
}

export async function patchServerCase(
  id: string,
  patch: { status?: ServerCase['status']; paid?: boolean; payRef?: string },
): Promise<void> {
  await fetch(`${API}/api/requests/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}

const API = '';

export interface SkinSearchResult {
  query: string;
  analyzed: boolean;
  analysisNote: string;
  answer: string;
  scores: { type: string; uiScore: number }[];
  concerns: string[];
  products: {
    id: string;
    name: string;
    concerns: string[];
    priceNgn: number;
    size: string;
    blurb: string;
    ingredient: string;
  }[];
  tips: { concern: string; title: string; body: string; ingredient: string }[];
  articles: { id: string; title: string; tags: string[] }[];
}

export async function searchSkin(query: string, photo: File | null): Promise<SkinSearchResult> {
  const form = new FormData();
  form.append('query', query);
  if (photo) form.append('photo', photo);
  const res = await fetch(`${API}/api/skin-search`, { method: 'POST', body: form });
  const data = (await res.json().catch(() => ({}))) as SkinSearchResult & { error?: string };
  if (!res.ok) {
    if (data.error === 'perfect-corp-not-configured') {
      throw new Error('Perfect Corp is not configured. Restart the app after saving PERFECT_CORP_API_KEY.');
    }
    if (data.error === 'too-many-requests') throw new Error('Too many searches — wait a minute and try again.');
    if (data.error === 'analysis-failed') throw new Error('Perfect Corp could not analyse that photo. Use a clear, front-facing selfie.');
    throw new Error('Skin-care search is unavailable right now.');
  }
  return data;
}

export async function askAi(question: string): Promise<string> {
  const res = await fetch(`${API}/api/ask-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
  if (!res.ok) {
    if (data.error === 'ai-not-configured') {
      throw new Error('AI research is not configured yet — add GROQ_API_KEY to app/.env.local and restart the email server.');
    }
    throw new Error('The research assistant is unavailable right now. Try again later.');
  }
  return data.answer || 'No answer returned.';
}

export interface PaymentInit {
  mock: boolean;
  authorization_url: string;
  reference: string;
  amountNgn?: number;
  note?: string;
}

export async function initPayment(email: string, amountNgn: number, callbackUrl?: string): Promise<PaymentInit> {
  const res = await fetch(`${API}/api/payments/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      amountNgn,
      callbackUrl: callbackUrl || (typeof window !== 'undefined' ? `${window.location.origin}/?pay=return` : undefined),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof data.detail === 'string' ? data.detail : '';
    throw new Error(detail || 'Could not start the payment. Try again, or use a normal email address.');
  }
  return data as PaymentInit;
}

export async function verifyPayment(reference: string): Promise<{ paid: boolean; mock: boolean }> {
  const res = await fetch(`${API}/api/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Could not verify the payment.');
  return data as { paid: boolean; mock: boolean };
}

// Calls the local email side-server (needs `npm run email-server`).
// Never fails the consultation if email is unavailable — reports status instead.
export async function sendConfirmation(req: {
  to: string;
  name: string;
  concern: string;
  referenceId: string;
  expertName: string;
}): Promise<EmailStatus> {
  try {
    const res = await fetch(`${API}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (res.ok) return { sent: true, message: `Confirmation email sent to ${req.to}.` };
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (data.error === 'email-not-configured') {
      return { sent: false, message: 'Matched, but no confirmation email was sent — the Resend key is not configured yet.' };
    }
    return { sent: false, message: 'Matched, but the confirmation email could not be sent.' };
  } catch {
    return { sent: false, message: 'Matched, but the email server is offline (run `npm run email-server`).' };
  }
}

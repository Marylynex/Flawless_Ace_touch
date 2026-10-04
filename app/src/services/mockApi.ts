import mockExperts from '../data/mockExperts.json';

export interface Expert {
  id: string;
  name: string;
  credentials: string;
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
  return { referenceId, expert, status: 'under review' };
}

export interface EmailStatus {
  sent: boolean;
  message: string;
}

const API = 'http://localhost:3001';

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

export async function initPayment(email: string, amountNgn: number): Promise<PaymentInit> {
  const res = await fetch(`${API}/api/payments/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amountNgn }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Could not start the payment. Check the email server is running.');
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
    const res = await fetch('http://localhost:3001/api/send-email', {
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

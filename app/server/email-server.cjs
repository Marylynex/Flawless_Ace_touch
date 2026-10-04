// Flawless AceTouch — local email side-server (Vite + React app).
// Run: npm run email-server   (from the app/ folder)
// Reads the Resend key from app/.env.local — the browser never sees it.
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Resend } = require('resend');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const apiKey = process.env.RESEND_API_KEY || process.env.VITE_API_KEY;
if (process.env.VITE_API_KEY && !process.env.RESEND_API_KEY) {
  console.warn('[email-server] WARNING: using VITE_API_KEY — rename it to RESEND_API_KEY so it is not exposed to the browser.');
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/send-email', async (req, res) => {
  const { to, name, concern, referenceId, expertName } = req.body || {};
  if (!to || !/.+@.+\..+/.test(to)) {
    return res.status(400).json({ error: 'valid-recipient-required' });
  }
  if (!apiKey || apiKey === 'your_key_here') {
    return res.status(500).json({ error: 'email-not-configured' });
  }
  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: `Your Flawless AceTouch consultation request ${referenceId || ''}`.trim(),
      html: `<p>Hi ${name || 'there'},</p>
<p>Thanks for requesting a skin consultation with <strong>Flawless AceTouch</strong>.</p>
<p>Concern: <strong>${concern || '—'}</strong><br/>Reference: <strong>${referenceId || '—'}</strong><br/>Matched expert: <strong>${expertName || '—'}</strong> (mock)</p>
<p>Your request is under review. This is a prototype message with mock data — not medical advice.</p>`,
    });
    return res.json({ sent: true, id: result?.data?.id || null });
  } catch (err) {
    console.error('[email-server] send failed:', err?.message || err);
    return res.status(502).json({ error: 'send-failed' });
  }
});

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const MOCK_FEE_NGN = 5000;

app.post('/api/ask-ai', async (req, res) => {
  const { question } = req.body || {};
  if (!question || !String(question).trim()) {
    return res.status(400).json({ error: 'question-required' });
  }
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey || groqKey === 'your_key_here') {
    return res.status(500).json({ error: 'ai-not-configured' });
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
            content: 'You are the Flawless AceTouch skin-education assistant. Explain skincare and cosmetic formulation topics in plain, friendly language. Give general educational information only: never diagnose conditions, never prescribe treatments, and always suggest consulting a dermatologist for personal advice. Keep answers under 200 words.',
          },
          { role: 'user', content: String(question).slice(0, 1000) },
        ],
      }),
    });
    if (!r.ok) {
      console.error('[server] groq error:', r.status);
      return res.status(502).json({ error: 'ai-unavailable' });
    }
    const data = await r.json();
    const answer = data?.choices?.[0]?.message?.content || 'No answer returned.';
    return res.json({ answer });
  } catch (err) {
    console.error('[server] ask-ai failed:', err?.message || err);
    return res.status(502).json({ error: 'ai-unavailable' });
  }
});

app.post('/api/payments/initialize', async (req, res) => {
  const { email, amountNgn } = req.body || {};
  if (!email || !/.+@.+\..+/.test(email) || !amountNgn || Number(amountNgn) <= 0) {
    return res.status(400).json({ error: 'email-and-amount-required' });
  }
  const reference = 'FAT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  if (PAYSTACK_SECRET) {
    try {
      const r = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${PAYSTACK_SECRET}` },
        body: JSON.stringify({ email, amount: Math.round(Number(amountNgn) * 100), reference, currency: 'NGN' }),
      });
      const data = await r.json();
      if (!r.ok || !data?.status) return res.status(502).json({ error: 'paystack-error', detail: data?.message || 'init failed' });
      return res.json({ mock: false, authorization_url: data.data.authorization_url, reference: data.data.reference });
    } catch (err) {
      console.error('[server] paystack init failed:', err?.message || err);
      return res.status(502).json({ error: 'paystack-unreachable' });
    }
  }
  return res.json({
    mock: true,
    authorization_url: '#mock-paystack-checkout',
    reference,
    amountNgn: Number(amountNgn),
    note: 'Mock checkout — no real charge. Add PAYSTACK_SECRET_KEY to .env.local for live test mode.',
  });
});

app.post('/api/payments/verify', async (req, res) => {
  const { reference } = req.body || {};
  if (!reference) return res.status(400).json({ error: 'reference-required' });
  if (PAYSTACK_SECRET && !String(reference).startsWith('FAT-')) {
    try {
      const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      });
      const data = await r.json();
      const paid = r.ok && data?.data?.status === 'success';
      return res.json({ mock: false, paid, reference });
    } catch (err) {
      console.error('[server] paystack verify failed:', err?.message || err);
      return res.status(502).json({ error: 'paystack-unreachable' });
    }
  }
  return res.json({ mock: true, paid: true, reference });
});

app.get('/api/config', (_req, res) => {
  res.json({ feeNgn: MOCK_FEE_NGN, paystackLive: Boolean(PAYSTACK_SECRET), aiReady: Boolean(process.env.GROQ_API_KEY) });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`[email-server] listening on http://localhost:${PORT}`));

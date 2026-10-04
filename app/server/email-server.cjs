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

const PORT = 3001;
app.listen(PORT, () => console.log(`[email-server] listening on http://localhost:${PORT}`));

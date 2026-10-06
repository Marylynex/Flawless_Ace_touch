'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { submitRequest, sendConfirmation, type EmailStatus, type MatchResult } from './services/mockApi';
import mockExperts from './data/mockExperts.json';
import skinTips from './data/skinTips.json';
import LearnLibrary from './components/LearnLibrary';
import ResearchChat from './components/ResearchChat';
import PaymentCard from './components/PaymentCard';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { getSession, logout, type User } from './services/auth';
import { recordRequest, markPaid } from './services/store';

const CONCERNS = [
  { value: 'acne', label: 'Acne / breakouts' },
  { value: 'dryness', label: 'Dryness' },
  { value: 'pigmentation', label: 'Pigmentation / dark spots' },
  { value: 'sensitivity', label: 'Sensitivity / redness' },
  { value: 'uneven-tone', label: 'Uneven tone' },
  { value: 'early-aging', label: 'Early aging / fine lines' },
];

const TIMES = ['Weekday morning', 'Weekday afternoon', 'Weekday evening', 'Weekend morning', 'Weekend afternoon'];

const STEPS = [
  { n: '1', title: 'Tell us about your skin', body: 'Goals, concerns, routine and an optional photo. Two minutes, guided.' },
  { n: '2', title: 'Meet your matched expert', body: 'We pair you with a vetted dermatologist or skin expert for your concern.' },
  { n: '3', title: 'Get your routine', body: 'A clear AM/PM plan with healthy product picks, reviewed by your expert.' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(() => getSession());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [concern, setConcern] = useState('acne');
  const [details, setDetails] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [preferredTime, setPreferredTime] = useState(TIMES[0]);
  const [fileKey, setFileKey] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);

  const tip = skinTips.find((t) => t.concern === concern) ?? skinTips[0];

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (mock upload only).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Mock photo must be 8 MB or smaller.');
      return;
    }
    setError('');
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoName(file.name);
    setPhotoUrl(URL.createObjectURL(file)); // local preview only — nothing is uploaded
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !details.trim()) {
      setError('Please add your name and a short description of your concern.');
      return;
    }
    if (!/.+@.+\..+/.test(email.trim())) {
      setError('Please add a valid email address for the confirmation.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await submitRequest({
        name: name.trim(),
        email: email.trim(),
        concern,
        details: details.trim(),
        photoName,
        preferredTime,
      });
      setResult(res);
      recordRequest({
        referenceId: res.referenceId,
        name: name.trim(),
        email: email.trim(),
        concern,
        preferredTime,
        expertName: res.expert.name,
      });
      setEmailStatus(
        await sendConfirmation({
          to: email.trim(),
          name: name.trim(),
          concern,
          referenceId: res.referenceId,
          expertName: res.expert.name,
        }),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setEmailStatus(null);
    setName('');
    setEmail('');
    setDetails('');
    setPhotoName(null);
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setError('');
    setFileKey((k) => k + 1); // clear the file input element
  }

  const firstName = name.split(' ')[0] || 'there';

  function handleLogout() {
    logout();
    setUser(null);
    reset();
  }

  if (!user) {
    return (
      <div className="wrap">
        <Login onLogin={setUser} />
        <footer className="footer">
          General skincare guidance only - not a medical diagnosis. Mock data only.
        </footer>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="userbar">
        <span>Logged in as <strong>{user.name}</strong> ({user.role})</span>
        <button className="btn-link" type="button" onClick={handleLogout}>Log out</button>
      </div>
      {user.role === 'admin' ? (
        <>
          <header className="hero">
            <span className="eyebrow">Flawless AceTouch - Admin</span>
            <h1>Platform overview</h1>
            <p className="subtitle">Requests, experts, payments and learn content. Mock data only.</p>
          </header>
          <AdminDashboard />
        </>
      ) : (
      <>
      <header className="hero">
        <span className="eyebrow">Flawless AceTouch - Prototype</span>
        <h1>Know your skin. Love your routine.</h1>
        <p className="subtitle">
          Tell us about your skin and a vetted expert reviews your case and builds
          your routine. Mock data only - nothing leaves your browser.
        </p>
        <div className="stats">
          <div><strong>12</strong><span>vetted experts (mock)</span></div>
          <div><strong>24h</strong><span>typical response</span></div>
          <div><strong>4.9</strong><span>average rating</span></div>
        </div>
      </header>

      {!result ? (
        <>
          <section className="card">
            <h2>How it works</h2>
            <div className="steps">
              {STEPS.map((s) => (
                <div className="step" key={s.n}>
                  <div className="step-n">{s.n}</div>
                  <strong>{s.title}</strong>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Meet some of our experts</h2>
            <p className="muted">Mock profiles for this prototype.</p>
            <div className="experts">
              {(mockExperts as { id: string; name: string; credentials: string; rating: number }[]).map((ex) => (
                <div className="expert-card" key={ex.id}>
                  <div className="avatar">{ex.name.charAt(0)}</div>
                  <strong>{ex.name}</strong>
                  <span className="muted">{ex.credentials}</span>
                  <span className="rating">* {ex.rating}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2>Request Skin Consultation</h2>
            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name" type="text" placeholder="e.g. Jane Doe"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email" type="text" placeholder="e.g. jane@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
                <div className="help">Used only for the confirmation email (mock prototype).</div>
              </div>
              <div className="field">
                <label>What bothers you most?</label>
                <div className="pills">
                  {CONCERNS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={concern === c.value ? 'pill active' : 'pill'}
                      onClick={() => setConcern(c.value)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="tip">
                <strong>Skin school: {tip.title}</strong>
                <p>{tip.body}</p>
                <span>{tip.ingredient}</span>
              </div>
              <div className="field">
                <label htmlFor="details">Describe your skin concern</label>
                <textarea
                  id="details" placeholder="e.g. Breakouts along my jawline; skin feels tight after cleansing..."
                  value={details} onChange={(e) => setDetails(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="photo">Photo upload (optional, mock only)</label>
                <input id="photo" key={fileKey} type="file" accept="image/*" onChange={onPhoto} />
                <div className="help">Preview stays on this page - no upload, no storage.</div>
                {photoUrl && (
                  <div className="preview"><img src={photoUrl} alt="Mock upload preview" /></div>
                )}
              </div>
              <div className="field">
                <label htmlFor="time">Preferred consultation time</label>
                <select id="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)}>
                  {TIMES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {error && <div className="field"><div className="err">{error}</div></div>}
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Matching you with an expert...' : 'Book Consultation'}
              </button>
            </form>
          </section>
        </>
      ) : (
        <section className="card result">
          <div className="check">OK</div>
          <h2>You are matched, {firstName}!</h2>
          <p className="ref">Reference: {result.referenceId} - Preferred time: {preferredTime}</p>
          <div className="expert">
            <div className="avatar lg">{result.expert.name.charAt(0)}</div>
            <div>
              <strong>{result.expert.name}</strong>
              <div>{result.expert.credentials} - Rating {result.expert.rating} - {result.expert.language}</div>
              <div>Responds {result.expert.responseWindow} (mock).</div>
            </div>
          </div>
          <ul className="timeline">
            <li className="done">Submitted - we received your request</li>
            <li className="now">Under review - {result.expert.name.split(' ')[0]} is reviewing your case</li>
            <li className="todo">Answered - expect your routine {result.expert.responseWindow}</li>
          </ul>
          <div className="tip">
            <strong>While you wait - {tip.title}</strong>
            <p>{tip.body}</p>
            <span>{tip.ingredient}</span>
          </div>
          <div className="disclaimer" style={emailStatus?.sent ? { background: 'var(--success-soft)' } : undefined}>
            {emailStatus ? ((emailStatus.sent ? 'Sent: ' : '') + emailStatus.message) : 'Sending confirmation...'}
          </div>
          <PaymentCard email={email} referenceId={result.referenceId} onPaid={(ref, payRef) => markPaid(ref, payRef)} />
          <button className="btn-link" type="button" onClick={reset}>Submit another request</button>
        </section>
      )}

      {!result && (
        <>
          <LearnLibrary />
          <ResearchChat />
        </>
      )}

      <footer className="footer">
        General skincare guidance only - not a medical diagnosis. All experts, tips and replies
        in this prototype are mock data.
      </footer>
      </>
      )}
    </div>
  );
}

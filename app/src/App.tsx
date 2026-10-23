'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { submitRequest, sendConfirmation, patchServerCase, verifyPayment, type EmailStatus, type MatchResult } from './services/mockApi';
import mockExperts from './data/mockExperts.json';
import skinTips from './data/skinTips.json';
import LearnLibrary from './components/LearnLibrary';
import SkinSearch from './components/SkinSearch';
import LearnVideos from './components/LearnVideos';
import PaymentCard from './components/PaymentCard';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import Shop from './components/Shop';
import { getSession, logout, type User } from './services/auth';
import { recordRequest, markPaid } from './services/store';
import { clearConsultSnapshot, clearPayQuery, clearPendingPay, paystackReturnReference, readConsultSnapshot, readPendingPay, saveConsultSnapshot, saveLastPay } from './services/paySession';
import { productsForConcern } from './data/products';

type Tab = 'home' | 'consult' | 'shop' | 'learn';

const CONCERNS = [
  { value: 'acne', label: 'Acne / breakouts' },
  { value: 'dryness', label: 'Dryness' },
  { value: 'pigmentation', label: 'Pigmentation / dark spots' },
  { value: 'sensitivity', label: 'Sensitivity / redness' },
  { value: 'uneven-tone', label: 'Uneven tone' },
  { value: 'early-aging', label: 'Early aging / fine lines' },
  { value: 'stretch-marks', label: 'Stretch marks' },
  { value: 'rosacea', label: 'Butterfly rash / rosacea' },
];

const TIMES = ['Weekday morning', 'Weekday afternoon', 'Weekday evening', 'Weekend morning', 'Weekend afternoon'];

const STEPS = [
  { n: '1', title: 'Tell us about your skin', body: 'Goals, concerns, routine and an optional photo. Two minutes, guided.' },
  { n: '2', title: 'Meet your matched expert', body: 'One dermatologist and three aestheticians, matched to your concern.' },
  { n: '3', title: 'Get your routine — then shop it', body: 'A clear AM/PM plan, with prescribed products you can buy here.' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
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
  const prescribed = productsForConcern(concern);

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
    setPhotoUrl(URL.createObjectURL(file));
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
      saveConsultSnapshot({
        result: res,
        name: name.trim(),
        email: email.trim(),
        concern,
        preferredTime,
      });
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
    clearConsultSnapshot();
    setResult(null);
    setEmailStatus(null);
    setName('');
    setEmail('');
    setDetails('');
    setPhotoName(null);
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setError('');
    setFileKey((k) => k + 1);
  }

  const firstName = name.split(' ')[0] || 'there';

  useEffect(() => {
    setUser(getSession());
    setSessionReady(true);
  }, []);

  useEffect(() => {
    const snap = readConsultSnapshot();
    if (snap) {
      setResult(snap.result);
      setName(snap.name);
      setEmail(snap.email);
      setConcern(snap.concern);
      setPreferredTime(snap.preferredTime);
    }
    const pending = readPendingPay();
    const returning = Boolean(paystackReturnReference());
    if (returning && pending?.tab) setTab(pending.tab as Tab);
    else if (snap) setTab('consult');
  }, []);

  useEffect(() => {
    if (!user) return;
    const returned = paystackReturnReference();
    if (!returned) return;
    const pending = readPendingPay();
    if (pending?.tab) setTab(pending.tab as Tab);
    let cancelled = false;
    verifyPayment(returned)
      .then((v) => {
        if (cancelled || !v.paid || !pending) return;
        saveLastPay({ ...pending, payRef: returned });
        if (pending.tab === 'consult') {
          markPaid(pending.referenceId, returned);
          patchServerCase(pending.referenceId, { paid: true, payRef: returned }).catch(() => {});
        }
        clearPendingPay();
        clearPayQuery();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  function handleLogout() {
    logout();
    setUser(null);
    reset();
    setTab('home');
  }

  const experts = mockExperts as {
    id: string;
    name: string;
    credentials: string;
    role: string;
    rating: number;
    specialties: string[];
  }[];

  if (!sessionReady) {
    return <div className="shell" />;
  }

  if (!user) {
    return (
      <div className="shell">
        <Login onLogin={setUser} />
        <footer className="footer">
          General skincare guidance only — not a medical diagnosis. Mock data only.
        </footer>
      </div>
    );
  }

  const nav: { id: Tab; label: string }[] = user.role === 'admin'
    ? []
    : [
        { id: 'home', label: 'Home' },
        { id: 'consult', label: 'Consult' },
        { id: 'shop', label: 'Shop' },
        { id: 'learn', label: 'Learn' },
      ];

  return (
    <div className="shell">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => setTab('home')}>
          <span className="logo">FA</span>
          <span>
            <strong>Flawless AceTouch</strong>
            <em>Skin care, expert-led</em>
          </span>
        </button>
        {nav.length > 0 && (
          <nav className="nav" aria-label="Primary">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? 'nav-link active' : 'nav-link'}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
        <div className="userchip">
          <span>{user.name}</span>
          <button className="btn-link" type="button" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      {user.role === 'admin' ? (
        <>
          <section className="hero">
            <span className="eyebrow">Admin studio</span>
            <h1>Keep every form moving</h1>
            <p className="subtitle">Review consultation forms, experts, payments and the learn library.</p>
          </section>
          <AdminDashboard />
        </>
      ) : (
        <>
          {tab === 'home' && (
            <>
              <section className="hero">
                <span className="eyebrow">Know your skin · love your routine</span>
                <h1>Expert skincare that feels like a studio visit.</h1>
                <p className="subtitle">
                  Start your skin-care journey with us, buy products and learn more about skincare.
                </p>
                <div className="stats">
                  <div><strong>1 + 3</strong><span>dermatologist &amp; aestheticians</span></div>
                  <div><strong>24h</strong><span>typical response</span></div>
                  <div><strong>4.9</strong><span>average rating</span></div>
                </div>
              </section>

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
                <div className="section-head">
                  <div>
                    <h2>Your clinic team</h2>
                    <p className="muted">One dermatologist and three aestheticians — including Dr. Chioma Nwokolo.</p>
                  </div>
                </div>
                <div className="experts">
                  {experts.map((ex) => (
                    <div className="expert-card" key={ex.id}>
                      <div className="avatar">{ex.name.replace(/^Dr\.\s/, '').charAt(0)}</div>
                      <span className="role-tag">{ex.role}</span>
                      <strong>{ex.name}</strong>
                      <span className="muted">{ex.credentials}</span>
                      <span className="rating">★ {ex.rating}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {tab === 'consult' && (
            <>
              {!result ? (
                <section className="card consult-card">
                  <div className="section-head">
                    <div>
                      <h2>Consultation form</h2>
                      <p className="muted">Share what bothers you. A matched expert reviews your form and builds your plan.</p>
                    </div>
                  </div>
                  <form onSubmit={onSubmit}>
                    <div className="grid-2">
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
                        <div className="help">Used only for the confirmation (mock prototype).</div>
                      </div>
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
                    <div className="grid-2">
                      <div className="field">
                        <label htmlFor="photo">Photo (optional, mock only)</label>
                        <input id="photo" key={fileKey} type="file" accept="image/*" onChange={onPhoto} />
                        <div className="help">Preview stays on this page — no upload, no storage.</div>
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
                    </div>
                    {error && <div className="field"><div className="err">{error}</div></div>}
                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                      {submitting ? 'Matching you with an expert...' : 'Submit consultation form'}
                    </button>
                  </form>
                </section>
              ) : (
                <section className="card result">
                  <div className="check">✓</div>
                  <h2>Your form is in, {firstName}</h2>
                  <p className="ref">Reference: {result.referenceId} · Preferred time: {preferredTime}</p>
                  <div className="expert">
                    <div className="avatar lg">{result.expert.name.replace(/^Dr\.\s/, '').charAt(0)}</div>
                    <div>
                      <strong>{result.expert.name}</strong>
                      <div>{result.expert.credentials} · Rating {result.expert.rating} · {result.expert.language}</div>
                      <div>Responds {result.expert.responseWindow} (mock).</div>
                    </div>
                  </div>
                  <ul className="timeline">
                    <li className="done">Submitted — we received your form</li>
                    <li className="now">Your form is currently being reviewed by {result.expert.name}</li>
                    <li className="todo">Answered — expect your routine {result.expert.responseWindow}</li>
                  </ul>
                  <div className="tip">
                    <strong>While you wait — {tip.title}</strong>
                    <p>{tip.body}</p>
                    <span>{tip.ingredient}</span>
                  </div>
                  <div className="disclaimer" style={emailStatus?.sent ? { background: 'var(--success-soft)' } : undefined}>
                    {emailStatus ? ((emailStatus.sent ? 'Sent: ' : '') + emailStatus.message) : 'Sending confirmation...'}
                  </div>
                  <PaymentCard
                    email={email}
                    referenceId={result.referenceId}
                    returnTab="consult"
                    onPaid={(ref, payRef) => {
                      markPaid(ref, payRef);
                      patchServerCase(ref, { paid: true, payRef }).catch(() => {});
                    }}
                  />

                  <div className="prescribed-block">
                    <h3>Prescribed for your concern</h3>
                    <p className="muted">Buy these picks on the platform. Add them in Shop — they are already highlighted for you.</p>
                    <ul className="plain-list">
                      {prescribed.map((p) => (
                        <li key={p.id}><strong>{p.name}</strong> <span className="muted">— {p.ingredient}</span></li>
                      ))}
                    </ul>
                    <button className="btn btn-primary" type="button" onClick={() => setTab('shop')}>
                      Buy prescribed products
                    </button>
                  </div>

                  <button className="btn-link" type="button" onClick={reset}>Submit another form</button>
                </section>
              )}
            </>
          )}

          {tab === 'shop' && (
            <Shop
              email={user.email}
              highlightIds={result ? prescribed.map((p) => p.id) : undefined}
              heading={result ? 'Buy your prescribed products' : 'Shop skin care'}
              sub={result
                ? 'These formulas are highlighted from your consultation. Pay on the platform and we pack the order (mock).'
                : 'Dermatologist- and aesthetician-aligned formulas. Purchase on Flawless AceTouch.'}
            />
          )}

          {tab === 'learn' && (
            <>
              <SkinSearch onShop={() => setTab('shop')} />
              <LearnVideos email={user.email} />
              <LearnLibrary />
            </>
          )}

          <footer className="footer">
            General skincare guidance only — not a medical diagnosis. Experts, tips and replies in this prototype are mock data.
          </footer>
        </>
      )}
    </div>
  );
}

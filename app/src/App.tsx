import { useState, type ChangeEvent, type FormEvent } from 'react';
import { submitRequest, type MatchResult } from './services/mockApi';

const CONCERNS = [
  { value: 'acne', label: 'Acne / breakouts' },
  { value: 'dryness', label: 'Dryness' },
  { value: 'pigmentation', label: 'Pigmentation / dark spots' },
  { value: 'sensitivity', label: 'Sensitivity / redness' },
  { value: 'uneven-tone', label: 'Uneven tone' },
  { value: 'early-aging', label: 'Early aging / fine lines' },
];

const TIMES = ['Weekday morning', 'Weekday afternoon', 'Weekday evening', 'Weekend morning', 'Weekend afternoon'];

export default function App() {
  const [name, setName] = useState('');
  const [concern, setConcern] = useState('acne');
  const [details, setDetails] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [preferredTime, setPreferredTime] = useState(TIMES[0]);
  const [fileKey, setFileKey] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

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
    setError('');
    setSubmitting(true);
    try {
      const res = await submitRequest({
        name: name.trim(),
        concern,
        details: details.trim(),
        photoName,
        preferredTime,
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setName('');
    setDetails('');
    setPhotoName(null);
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setError('');
    setFileKey((k) => k + 1); // clear the file input element
  }

  return (
    <div className="wrap">
      <header className="hero">
        <span className="eyebrow">Flawless AceTouch · Prototype</span>
        <h1>Request a skin consultation</h1>
        <p className="subtitle">
          Tell us about your skin and we will match you with a skin expert.
          Mock data only — nothing leaves your browser.
        </p>
      </header>

      {!result ? (
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
              <label htmlFor="concern">Skin concern</label>
              <select id="concern" value={concern} onChange={(e) => setConcern(e.target.value)}>
                {CONCERNS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="details">Describe your skin concern</label>
              <textarea
                id="details" placeholder="e.g. Breakouts along my jawline; skin feels tight after cleansing…"
                value={details} onChange={(e) => setDetails(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="photo">Photo upload (optional, mock only)</label>
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
            {error && <div className="field"><div className="err">{error}</div></div>}
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Matching you with an expert…' : 'Book Consultation'}
            </button>
          </form>
        </section>
      ) : (
        <section className="card result">
          <div className="check">✓</div>
          <h2>You're matched, {name.split(' ')[0] || 'there'}!</h2>
          <p className="ref">Reference: {result.referenceId} · Preferred time: {preferredTime}</p>
          <div className="expert">
            <strong>{result.expert.name}</strong>
            <div>{result.expert.credentials} · ★ {result.expert.rating} · {result.expert.language}</div>
            <div>Responds {result.expert.responseWindow} (mock).</div>
          </div>
          <ul className="timeline">
            <li className="done">Submitted — we received your request</li>
            <li className="now">Under review — {result.expert.name.split(' ')[0]} is reviewing your case</li>
            <li className="todo">Answered — expect your routine {result.expert.responseWindow}</li>
          </ul>
          <div className="disclaimer">
            General skincare guidance only — not a medical diagnosis. All experts and replies in this
            prototype are mock data.
          </div>
          <button className="btn-link" type="button" onClick={reset}>← Submit another request</button>
        </section>
      )}
    </div>
  );
}

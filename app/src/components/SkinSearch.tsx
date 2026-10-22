'use client';

import { useState, type FormEvent } from 'react';
import { searchSkin, type SkinSearchResult } from '../services/mockApi';
import { formatNgn } from '../data/products';

const STARTERS = [
  'Niacinamide for oily skin',
  'Butterfly rash / rosacea',
  'Stretch marks care',
  'Dark spots and SPF',
];

export default function SkinSearch({ onShop }: { onShop?: () => void }) {
  const [query, setQuery] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SkinSearchResult | null>(null);

  function onFile(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function submit(e?: FormEvent, starter?: string) {
    e?.preventDefault();
    const q = (starter ?? query).trim();
    if (starter) setQuery(starter);
    if (!q && !photo) {
      setError('Type a skin concern or add a selfie.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      setResult(await searchSkin(q, photo));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>AI skin-care search</h2>
          <p className="muted">Ask about a concern, or add a selfie for Perfect Corp skin analysis. Results point to products you can buy here.</p>
        </div>
      </div>

      <form onSubmit={(e) => submit(e)}>
        <div className="field">
          <label htmlFor="skin-q">What are you looking for?</label>
          <input
            id="skin-q"
            type="text"
            placeholder="e.g. redness on cheeks, stretch marks, niacinamide..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="skin-photo">Optional selfie (front-facing)</label>
          <input
            id="skin-photo"
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
          <div className="help">Photo is sent to Perfect Corp for analysis only through our server. Not a medical diagnosis.</div>
          {preview && (
            <div className="preview"><img src={preview} alt="Selfie preview" /></div>
          )}
        </div>
        {error && <div className="err">{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Searching with Perfect Corp...' : 'Search skin care'}
        </button>
      </form>

      <div className="pills" style={{ marginTop: 16 }}>
        {STARTERS.map((s) => (
          <button key={s} type="button" className="pill" onClick={() => submit(undefined, s)} disabled={busy}>
            {s}
          </button>
        ))}
      </div>

      {result && (
        <div className="search-results">
          {result.analyzed && (
            <>
              <h3>Perfect Corp analysis</h3>
              <p className="muted">{result.analysisNote}</p>
              {result.scores.length === 0 ? (
                <p className="muted">Analysis finished, but no concern scores were returned for this photo.</p>
              ) : (
                <ul className="score-list">
                  {result.scores.map((s) => (
                    <li key={s.type}>
                      <span>{s.type.replace(/_/g, ' ')}</span>
                      <div className="score-bar"><i style={{ width: `${Math.min(100, Math.max(0, s.uiScore))}%` }} /></div>
                      <strong>{s.uiScore}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {result.concerns.length > 0 && (
            <p className="muted">Matched concerns: {result.concerns.join(', ')}</p>
          )}

          <h3>Products you can buy here</h3>
          {result.products.length === 0 ? (
            <p className="muted">No matching products yet. Try another phrase or add a selfie.</p>
          ) : (
            <div className="product-grid">
              {result.products.map((p) => (
                <article className="product-card" key={p.id}>
                  <div className="product-mark">{p.name.charAt(0)}</div>
                  <strong>{p.name}</strong>
                  <span className="muted">{p.size}</span>
                  <p>{p.blurb}</p>
                  <span className="ingredient">{p.ingredient}</span>
                  <div className="product-foot">
                    <span className="price">{formatNgn(p.priceNgn)}</span>
                    {onShop && (
                      <button className="btn btn-secondary" type="button" onClick={onShop}>
                        Open shop
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {result.tips.length > 0 && (
            <>
              <h3>Skin school</h3>
              {result.tips.map((t) => (
                <div className="tip" key={t.title}>
                  <strong>{t.title}</strong>
                  <p>{t.body}</p>
                  <span>{t.ingredient}</span>
                </div>
              ))}
            </>
          )}

          {result.articles.length > 0 && (
            <>
              <h3>Learn more</h3>
              <ul className="plain-list">
                {result.articles.map((a) => (
                  <li key={a.id}><strong>{a.title}</strong></li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}

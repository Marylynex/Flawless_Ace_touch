'use client';

import { useCallback, useEffect, useState } from 'react';
import { listServerCases, patchServerCase, type ServerCase } from '../services/mockApi';
import mockExperts from '../data/mockExperts.json';
import learnArticles from '../data/learnArticles.json';

const NEXT_STATUS: Record<ServerCase['status'], ServerCase['status']> = {
  submitted: 'under review',
  'under review': 'answered',
  answered: 'submitted',
};

export default function AdminDashboard() {
  const [cases, setCases] = useState<ServerCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCases(await listServerCases());
    } catch {
      setError('Could not load cases from the server. Is the app server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function advance(c: ServerCase) {
    const next = NEXT_STATUS[c.status];
    setCases((rows) => rows.map((r) => (r.id === c.id ? { ...r, status: next } : r)));
    try {
      await patchServerCase(c.id, { status: next });
    } catch {
      setError('Status change could not be saved.');
    }
  }

  const paid = cases.filter((r) => r.paid).length;
  const experts = mockExperts as { id: string; name: string; credentials: string; rating: number; responseWindow: string }[];
  const articles = learnArticles as { id: string; title: string; minutes: number; level: string }[];

  return (
    <>
      <section className="card">
        <h2>Admin overview</h2>
        <div className="stats">
          <div><strong>{loading ? '-' : cases.length}</strong><span>cases on server</span></div>
          <div><strong>{loading ? '-' : paid}</strong><span>paid (mock)</span></div>
          <div><strong>{experts.length}</strong><span>experts (mock)</span></div>
          <div><strong>{articles.length}</strong><span>learn articles</span></div>
        </div>
        <button className="btn btn-secondary" type="button" onClick={refresh}>Refresh cases</button>
        {error && <p className="err" style={{ marginTop: 10 }}>{error}</p>}
      </section>

      <section className="card">
        <h2>Cases</h2>
        <p className="muted">Stored on the server - visible from any device. Tap a status to advance it.</p>
        {loading ? (
          <p className="muted">Loading cases...</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Concern</th>
                  <th>Expert</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.name}<br /><span className="muted">{r.email}</span></td>
                    <td>{r.concern}</td>
                    <td>{r.expertName}</td>
                    <td>
                      <button type="button" className="badge info" onClick={() => advance(r)} title="Tap to advance status">
                        {r.status} -&gt;
                      </button>
                    </td>
                    <td>{r.paid ? <span className="badge success">paid</span> : <span className="badge error">unpaid</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Experts (mock)</h2>
        <div className="experts">
          {experts.map((ex) => (
            <div className="expert-card" key={ex.id}>
              <div className="avatar">{ex.name.charAt(0)}</div>
              <strong>{ex.name}</strong>
              <span className="muted">{ex.credentials}</span>
              <span className="rating">* {ex.rating} - {ex.responseWindow}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Learn library (mock)</h2>
        <ul className="plain-list">
          {articles.map((a) => (
            <li key={a.id}><strong>{a.title}</strong> <span className="muted">- {a.minutes} min, {a.level}</span></li>
          ))}
        </ul>
      </section>
    </>
  );
}

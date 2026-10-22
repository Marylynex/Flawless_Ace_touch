'use client';

import { useEffect, useState } from 'react';
import { listServerCases, type ServerCase } from '../services/mockApi';

export default function MyForms({ email }: { email: string }) {
  const [forms, setForms] = useState<ServerCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listServerCases(email)
      .then(setForms)
      .catch(() => setForms([]))
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) {
    return (
      <section className="card">
        <h2>My forms</h2>
        <p className="muted">Loading your forms...</p>
      </section>
    );
  }

  if (forms.length === 0) {
    return (
      <section className="card">
        <h2>My forms</h2>
        <p className="muted">You have not sent a consultation form yet. Start from Consult when you are ready.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>My forms</h2>
          <p className="muted">Track every consultation form you have sent.</p>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Concern</th>
              <th>Expert</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.concern}</td>
                <td>{r.expertName}</td>
                <td><span className="badge info">{r.status}</span></td>
                <td>{r.paid ? <span className="badge success">paid</span> : <span className="badge error">unpaid</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

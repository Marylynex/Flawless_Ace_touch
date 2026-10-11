'use client';

import { useEffect, useState } from 'react';
import { listServerCases, type ServerCase } from '../services/mockApi';

export default function MyCases({ email }: { email: string }) {
  const [cases, setCases] = useState<ServerCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listServerCases(email)
      .then(setCases)
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) return null;
  if (cases.length === 0) return null;

  return (
    <section className="card">
      <h2>My cases</h2>
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
            {cases.map((r) => (
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

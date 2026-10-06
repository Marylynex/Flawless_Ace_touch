import { listRequests } from '../services/store';
import mockExperts from '../data/mockExperts.json';
import learnArticles from '../data/learnArticles.json';

export default function AdminDashboard() {
  const requests = listRequests();
  const paid = requests.filter((r) => r.paid).length;
  const experts = mockExperts as { id: string; name: string; credentials: string; rating: number; responseWindow: string }[];
  const articles = learnArticles as { id: string; title: string; minutes: number; level: string }[];

  return (
    <>
      <section className="card">
        <h2>Admin overview</h2>
        <div className="stats">
          <div><strong>{requests.length}</strong><span>consultation requests</span></div>
          <div><strong>{paid}</strong><span>paid (mock)</span></div>
          <div><strong>{experts.length}</strong><span>experts (mock)</span></div>
          <div><strong>{articles.length}</strong><span>learn articles</span></div>
        </div>
      </section>

      <section className="card">
        <h2>Consultation requests</h2>
        <p className="muted">Session requests plus mock seed rows. Mock data only.</p>
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
              {requests.map((r) => (
                <tr key={r.referenceId}>
                  <td>{r.referenceId}</td>
                  <td>{r.name}<br /><span className="muted">{r.email}</span></td>
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

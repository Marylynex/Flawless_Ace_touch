import { useState } from 'react';
import { askAi } from '../services/mockApi';

interface Msg {
  role: 'user' | 'ai';
  text: string;
}

const STARTERS = [
  'What does niacinamide do?',
  'How do I layer vitamin C and sunscreen?',
  'What is an emulsifier in simple terms?',
];

export default function ResearchChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setBusy(true);
    try {
      const answer = await askAi(q);
      setMsgs((m) => [...m, { role: 'ai', text: answer }]);
    } catch (err) {
      setMsgs((m) => [...m, { role: 'ai', text: err instanceof Error ? err.message : 'Something went wrong.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>Research with AI</h2>
      <p className="muted">Ask about skincare science and cosmetic formulation. Powered by Groq (mock key off by default).</p>
      <div className="pills">
        {STARTERS.map((s) => (
          <button key={s} type="button" className="pill" onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="chat">
        {msgs.length === 0 && (
          <p className="muted">Try a starter above, or type your own question about ingredients, routines or formulation.</p>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'msg user' : 'msg ai'}>
            {m.text}
          </div>
        ))}
        {busy && <div className="msg ai">Thinking...</div>}
      </div>
      <form
        className="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          type="text"
          placeholder="e.g. Are ceramides good for oily skin?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          Ask
        </button>
      </form>
      <p className="muted">General education only - never a diagnosis. For personal advice, book a consultation above.</p>
    </section>
  );
}

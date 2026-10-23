'use client';

import { useState, type FormEvent } from 'react';
import { login, register, startSession, type User } from '../services/auth';

export default function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [created, setCreated] = useState<User | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    try {
      if (mode === 'signup') {
        setCreated(register(name, email, password));
      } else {
        onLogin(login(email, password));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  function fill(email: string, password: string) {
    setError('');
    try {
      onLogin(login(email, password));
    } catch (err) {
      setMode('login');
      setEmail(email);
      setPassword(password);
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  function switchMode(m: 'login' | 'signup') {
    setMode(m);
    setError('');
    setCreated(null);
  }

  if (created) {
    return (
      <>
        <section className="hero">
          <span className="eyebrow">Welcome in</span>
          <h1>Your studio pass is ready</h1>
          <p className="subtitle">Hi {created.name} — your customer account is set. Next up: a consultation form or a browse of the shop.</p>
        </section>
        <section className="card result">
          <div className="check">✓</div>
          <h2>Signup successful</h2>
          <p className="ref">Account {created.email} is set up.</p>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              startSession(created);
              onLogin(created);
            }}
          >
            Continue — log me in
          </button>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Flawless AceTouch</span>
        <h1>Skincare, guided by real experts.</h1>
        <p className="subtitle">
          Trust us to give you a flawless skin, top quality skincare products &amp; a vast knowledge on skincare.
        </p>
      </section>
      <section className="card auth-card">
        <div className="pills">
          <button type="button" className={mode === 'signup' ? 'pill active' : 'pill'} onClick={() => switchMode('signup')}>
            Sign up
          </button>
          <button type="button" className={mode === 'login' ? 'pill active' : 'pill'} onClick={() => switchMode('login')}>
            Log in
          </button>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="su-name">Full name</label>
              <input id="su-name" type="text" placeholder="e.g. Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" type="text" placeholder="e.g. jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" placeholder={mode === 'signup' ? 'At least 4 characters' : 'Your password'} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="field"><div className="err">{error}</div></div>}
          <button className="btn btn-primary" type="submit">
            {mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>
        <div className="demo-accounts">
          <p className="muted">Skip the forms with a one-tap demo account:</p>
          <div className="btn-row">
            <button className="btn btn-secondary" type="button" onClick={() => fill('customer@demo.local', 'customer123')}>
              Use customer account
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => fill('admin@demo.local', 'admin123')}>
              Use admin account
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

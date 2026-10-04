import { useState } from 'react';
import { initPayment, verifyPayment } from '../services/mockApi';

const FEE_NGN = 5000;

export default function PaymentCard({ email, referenceId }: { email: string; referenceId: string }) {
  const [state, setState] = useState<'idle' | 'ready' | 'verifying' | 'paid' | 'error'>('idle');
  const [payRef, setPayRef] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    try {
      const init = await initPayment(email, FEE_NGN);
      setPayRef(init.reference);
      setNote(init.mock ? (init.note || 'Mock checkout - no real charge.') : 'Redirect to Paystack to complete payment.');
      setState('ready');
      if (!init.mock && init.authorization_url && init.authorization_url !== '#mock-paystack-checkout') {
        window.open(init.authorization_url, '_blank', 'noopener');
      }
    } catch {
      setState('error');
    } finally {
      setBusy(false);
    }
  }

  async function confirmPaid() {
    setState('verifying');
    try {
      const v = await verifyPayment(payRef);
      setState(v.paid ? 'paid' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'paid') {
    return (
      <div className="pay-card success">
        <strong>Service charge paid - NGN {FEE_NGN.toLocaleString()}</strong>
        <p className="muted">Receipt: {payRef} (consultation {referenceId}). Your expert review proceeds.</p>
      </div>
    );
  }

  return (
    <div className="pay-card">
      <strong>Service charge: NGN {FEE_NGN.toLocaleString()}</strong>
      <p className="muted">Covers expert review of your consultation (mock payment - no real charge).</p>
      {state === 'idle' && (
        <button className="btn btn-primary" type="button" onClick={start} disabled={busy}>
          {busy ? 'Starting checkout...' : 'Pay service charge'}
        </button>
      )}
      {state === 'ready' && (
        <>
          <p className="muted">Checkout reference: {payRef}. {note}</p>
          <button className="btn btn-primary" type="button" onClick={confirmPaid}>
            I have completed payment (mock)
          </button>
        </>
      )}
      {state === 'verifying' && <p className="muted">Verifying payment...</p>}
      {state === 'error' && (
        <p className="err">Payment could not be completed. Make sure the email server is running, then try again.</p>
      )}
    </div>
  );
}

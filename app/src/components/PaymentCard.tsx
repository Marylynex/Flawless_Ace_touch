'use client';

import { useEffect, useRef, useState } from 'react';
import { initPayment, verifyPayment } from '../services/mockApi';
import { formatNgn } from '../data/products';
import {
  clearPayQuery,
  clearPendingPay,
  paystackReturnReference,
  readLastPay,
  readPendingPay,
  saveLastPay,
  savePendingPay,
} from '../services/paySession';

const FEE_NGN = 5000;

export default function PaymentCard({
  email,
  referenceId,
  onPaid,
  amountNgn = FEE_NGN,
  title = 'Consultation fee',
  description = 'Covers expert review of your form (mock payment — no real charge).',
  successNote,
  returnTab = 'consult',
}: {
  email: string;
  referenceId: string;
  onPaid?: (referenceId: string, payRef: string) => void;
  amountNgn?: number;
  title?: string;
  description?: string;
  successNote?: string;
  returnTab?: 'consult' | 'shop' | 'learn';
}) {
  const [state, setState] = useState<'idle' | 'ready' | 'verifying' | 'paid' | 'error'>('idle');
  const [payRef, setPayRef] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;

  useEffect(() => {
    const last = readLastPay();
    if (last && last.referenceId === referenceId) {
      setPayRef(last.payRef);
      setState('paid');
      return;
    }

    const returned = paystackReturnReference();
    const pending = readPendingPay();
    const matchesCard = pending && (pending.referenceId === referenceId || pending.payRef === returned);
    if (pending && pending.referenceId === referenceId && !returned) {
      setPayRef(pending.payRef);
      setState('ready');
      setNote('If Paystack already charged you, confirm below to finish and stay on this page.');
      return;
    }
    if (!returned || !matchesCard) return;

    let cancelled = false;
    setPayRef(returned);
    setState('verifying');
    verifyPayment(returned)
      .then((v) => {
        if (cancelled) return;
        if (v.paid) {
          saveLastPay({ ...pending, payRef: returned });
          clearPendingPay();
          clearPayQuery();
          onPaidRef.current?.(referenceId, returned);
          setState('paid');
        } else {
          setState('error');
        }
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [referenceId]);

  async function start() {
    setBusy(true);
    try {
      const callbackUrl = `${window.location.origin}/?pay=return`;
      const init = await initPayment(email, amountNgn, callbackUrl);
      setPayRef(init.reference);
      savePendingPay({ tab: returnTab, referenceId, payRef: init.reference });
      setNote(init.mock ? (init.note || 'Mock checkout — no real charge.') : 'Taking you to Paystack. You will return here automatically after payment.');
      setState('ready');
      if (!init.mock && init.authorization_url && init.authorization_url !== '#mock-paystack-checkout') {
        window.location.assign(init.authorization_url);
        return;
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
      if (v.paid) {
        saveLastPay({ tab: returnTab, referenceId, payRef });
        clearPendingPay();
        if (onPaid) onPaid(referenceId, payRef);
        setState('paid');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  if (state === 'paid') {
    return (
      <div className="pay-card success">
        <strong>{title} paid — {formatNgn(amountNgn)}</strong>
        <p className="muted">{successNote || `Receipt: ${payRef} (form ${referenceId}). Your expert review proceeds.`}</p>
      </div>
    );
  }

  return (
    <div className="pay-card">
      <strong>{title}: {formatNgn(amountNgn)}</strong>
      <p className="muted">{description}</p>
      {state === 'idle' && (
        <button className="btn btn-primary" type="button" onClick={start} disabled={busy}>
          {busy ? 'Starting checkout...' : `Pay ${formatNgn(amountNgn)}`}
        </button>
      )}
      {state === 'ready' && (
        <>
          <p className="muted">Checkout reference: {payRef}. {note}</p>
          <button className="btn btn-primary" type="button" onClick={confirmPaid}>
            I have completed payment — return to Flawless AceTouch
          </button>
        </>
      )}
      {state === 'verifying' && <p className="muted">Confirming Paystack payment and bringing you back...</p>}
      {state === 'error' && (
        <p className="err">Payment could not be completed. If you paid, wait a moment and refresh — we will verify the return automatically.</p>
      )}
    </div>
  );
}

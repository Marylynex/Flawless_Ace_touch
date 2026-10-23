'use client';

import { useEffect, useState } from 'react';
import PaymentCard from './PaymentCard';
import learnVideos from '../data/learnVideos.json';
import { formatNgn } from '../data/products';
import { readLastPay } from '../services/paySession';

const TOKEN_NGN = 1500;
const KEY = 'fat_learn_videos';

interface Video {
  id: string;
  title: string;
  source: string;
  minutes: number;
  topic: string;
  youtubeId: string;
}

function unlockedKey(email: string) {
  return `${KEY}:${email.toLowerCase()}`;
}

function isUnlocked(email: string): boolean {
  try {
    return localStorage.getItem(unlockedKey(email)) === '1';
  } catch {
    return false;
  }
}

function unlock(email: string) {
  localStorage.setItem(unlockedKey(email), '1');
}

export default function LearnVideos({ email }: { email: string }) {
  const videos = learnVideos as Video[];
  const [open, setOpen] = useState(() => isUnlocked(email) || readLastPay()?.tab === 'learn');
  const [active, setActive] = useState<string | null>(videos[0]?.id ?? null);
  const current = videos.find((v) => v.id === active) ?? videos[0];

  useEffect(() => {
    if (isUnlocked(email) || readLastPay()?.tab === 'learn') setOpen(true);
  }, [email]);

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <h2>Video teachings</h2>
          <p className="muted">
            Real skincare lessons. Register with a token fee of {formatNgn(TOKEN_NGN)} to unlock the classroom.
          </p>
        </div>
      </div>

      {!open ? (
        <PaymentCard
          email={email}
          referenceId={`LEARN-${email.replace(/[^a-z0-9]/gi, '').slice(0, 12).toUpperCase()}`}
          returnTab="learn"
          amountNgn={TOKEN_NGN}
          title="Learn registration"
          description="One-time token fee to unlock video teachings on this account."
          successNote="Registration paid. The video classroom is unlocked on this device."
          onPaid={() => {
            unlock(email);
            setOpen(true);
          }}
        />
      ) : (
        <>
          <p className="muted">Classroom unlocked. Pick a lesson below.</p>
          <div className="video-picks">
            {videos.map((v) => (
              <button
                key={v.id}
                type="button"
                className={active === v.id ? 'article-card active' : 'article-card'}
                onClick={() => setActive(v.id)}
              >
                <strong>{v.title}</strong>
                <span className="muted">{v.minutes} min · {v.topic}</span>
                <span className="tags">{v.source}</span>
              </button>
            ))}
          </div>
          {current && (
            <div className="video-frame">
              <iframe
                title={current.title}
                src={`https://www.youtube.com/embed/${current.youtubeId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <p className="muted">{current.title} — {current.source}. Educational only, not personal medical advice.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

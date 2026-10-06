'use client';

import { useState } from 'react';
import learnArticles from '../data/learnArticles.json';

interface Article {
  id: string;
  title: string;
  minutes: number;
  level: string;
  tags: string[];
  paragraphs: string[];
}

export default function LearnLibrary() {
  const [openId, setOpenId] = useState<string | null>(null);
  const articles = learnArticles as Article[];
  const open = articles.find((a) => a.id === openId);

  return (
    <section className="card">
      <h2>Learn: skincare and formulation school</h2>
      <p className="muted">Short, plain-language lessons. Mock educational content for this prototype.</p>
      <div className="learn-grid">
        {articles.map((a) => (
          <button
            key={a.id}
            type="button"
            className={openId === a.id ? 'article-card active' : 'article-card'}
            onClick={() => setOpenId(openId === a.id ? null : a.id)}
          >
            <strong>{a.title}</strong>
            <span className="muted">{a.minutes} min read - {a.level}</span>
            <span className="tags">{a.tags.join('  |  ')}</span>
          </button>
        ))}
      </div>
      {open && (
        <article className="article-full">
          <h3>{open.title}</h3>
          {open.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="muted">General education only - not personal advice. Ask your matched expert for guidance about your own skin.</p>
        </article>
      )}
    </section>
  );
}

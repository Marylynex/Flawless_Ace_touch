import { NextResponse } from 'next/server';
import { clientIp, rateLimited } from '@/lib/safety';
import { analyzeSkinPhoto, perfectCorpConfigured, type SkinScore } from '@/lib/perfectCorp';
import { groqChat, groqConfigured, SKIN_EDUCATOR } from '@/lib/groq';
import { PRODUCTS, productsForConcern, type Product } from '@/data/products';
import skinTips from '@/data/skinTips.json';
import learnArticles from '@/data/learnArticles.json';

export const runtime = 'nodejs';
export const maxDuration = 60;

const TYPE_TO_CONCERN: Record<string, string> = {
  acne: 'acne',
  pore: 'acne',
  oiliness: 'acne',
  redness: 'rosacea',
  moisture: 'dryness',
  texture: 'uneven-tone',
  age_spot: 'pigmentation',
  wrinkle: 'early-aging',
  dark_circle_v2: 'early-aging',
};

const GOOD_WHEN_HIGH = new Set(['moisture', 'radiance', 'firmness']);

interface Article {
  id: string;
  title: string;
  tags: string[];
  paragraphs: string[];
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function concernsFromScores(scores: SkinScore[]): string[] {
  const ranked = scores
    .map((s) => {
      const severity = GOOD_WHEN_HIGH.has(s.type) ? 100 - s.uiScore : s.uiScore;
      return { ...s, severity };
    })
    .filter((s) => s.type !== 'skin_type')
    .sort((a, b) => b.severity - a.severity);

  const concerns = ranked
    .filter((s) => s.severity >= 40)
    .map((s) => TYPE_TO_CONCERN[s.type])
    .filter((c): c is string => Boolean(c));
  return uniq(concerns).slice(0, 3);
}

function searchCatalog(query: string) {
  const q = query.toLowerCase().trim();
  const tokens = q.split(/[^a-z0-9+]+/).filter((t) => t.length > 2);
  const hit = (text: string) => {
    const hay = text.toLowerCase();
    if (q && hay.includes(q)) return true;
    return tokens.some((t) => hay.includes(t));
  };

  const products = PRODUCTS.filter((p) =>
    hit(`${p.name} ${p.blurb} ${p.ingredient} ${p.concerns.join(' ')}`),
  );
  const tips = (skinTips as { concern: string; title: string; body: string; ingredient: string }[]).filter((t) =>
    hit(`${t.concern} ${t.title} ${t.body} ${t.ingredient}`),
  );
  const articles = (learnArticles as Article[]).filter((a) =>
    hit(`${a.title} ${a.tags.join(' ')} ${a.paragraphs.join(' ')}`),
  );
  return { products, tips, articles };
}

function productsFromConcerns(concerns: string[]): Product[] {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const c of concerns) {
    for (const p of productsForConcern(c)) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
    }
  }
  return out.slice(0, 6);
}

export async function POST(req: Request) {
  if (rateLimited(`skin:${clientIp(req)}`, 8)) {
    return NextResponse.json({ error: 'too-many-requests' }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: 'valid-payload-required' }, { status: 400 });

  const query = String(form.get('query') || '').trim().slice(0, 200);
  const photo = form.get('photo');
  const file = photo instanceof File && photo.size > 0 ? photo : null;

  if (!query && !file) {
    return NextResponse.json({ error: 'query-or-photo-required' }, { status: 400 });
  }
  if (file) {
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'image-required' }, { status: 400 });
    }
    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json({ error: 'photo-too-large' }, { status: 400 });
    }
  }

  let scores: SkinScore[] = [];
  let analysisNote = '';
  if (file) {
    if (!perfectCorpConfigured()) {
      return NextResponse.json({ error: 'perfect-corp-not-configured' }, { status: 500 });
    }
    try {
      scores = await analyzeSkinPhoto(file);
    } catch (err) {
      console.error('[skin-search] analysis failed:', err instanceof Error ? err.message : err);
      return NextResponse.json({ error: 'analysis-failed' }, { status: 502 });
    }
    analysisNote = 'Scores come from Perfect Corp AI Skin Analysis. Educational only — not a diagnosis.';
  }

  const catalog = query ? searchCatalog(query) : { products: [], tips: [], articles: [] };
  const fromPhoto = concernsFromScores(scores);
  const fromQuery = catalog.products.flatMap((p) => p.concerns);
  const concerns = uniq([...fromPhoto, ...fromQuery]).slice(0, 4);

  const products = uniqById([
    ...productsFromConcerns(fromPhoto),
    ...catalog.products,
  ]).slice(0, 6);

  const tips = (fromPhoto.length
    ? (skinTips as { concern: string; title: string; body: string; ingredient: string }[]).filter((t) =>
        fromPhoto.includes(t.concern),
      )
    : catalog.tips
  ).slice(0, 4);

  const articles = catalog.articles.slice(0, 4);

  const fallback = buildAnswer({ query, scores, tips, products, articles: catalog.articles, analyzed: Boolean(file) });
  const answer = groqConfigured()
    ? await groqAnswer({ query, scores, tips, products, analyzed: Boolean(file), fallback })
    : fallback;

  return NextResponse.json({
    query,
    analyzed: Boolean(file),
    analysisNote,
    answer,
    scores,
    concerns,
    products,
    tips,
    articles: articles.map((a) => ({ id: a.id, title: a.title, tags: a.tags })),
  });
}

function buildAnswer(input: {
  query: string;
  scores: SkinScore[];
  tips: { title: string; body: string }[];
  products: Product[];
  articles: Article[];
  analyzed: boolean;
}): string {
  const parts: string[] = [];
  if (input.analyzed && input.scores.length) {
    const top = [...input.scores]
      .filter((s) => s.type !== 'skin_type')
      .sort((a, b) => b.uiScore - a.uiScore)
      .slice(0, 3)
      .map((s) => `${s.type.replace(/_/g, ' ')} (${s.uiScore})`)
      .join(', ');
    parts.push(`Perfect Corp skin analysis is in. The strongest readings are ${top}. This is educational scoring, not a medical diagnosis.`);
  } else if (input.analyzed) {
    parts.push('Perfect Corp finished the selfie scan, but no concern scores came back. Try a clearer, front-facing photo in even light.');
  }
  if (input.tips[0]) parts.push(input.tips[0].body);
  else if (input.articles[0]?.paragraphs[0]) parts.push(input.articles[0].paragraphs[0]);
  else if (input.query) {
    parts.push(`On “${input.query}”: keep the routine simple, patch-test new actives, and use sunscreen by day. Book Consult if you need a personal plan.`);
  }
  if (input.products.length) {
    parts.push(`You can buy related care here: ${input.products.slice(0, 3).map((p) => p.name).join(', ')}.`);
  }
  return parts.join('\n\n');
}

async function groqAnswer(input: {
  query: string;
  scores: SkinScore[];
  tips: { title: string; body: string }[];
  products: Product[];
  analyzed: boolean;
  fallback: string;
}): Promise<string> {
  const scoreLine = input.scores
    .filter((s) => s.type !== 'skin_type')
    .sort((a, b) => b.uiScore - a.uiScore)
    .slice(0, 6)
    .map((s) => `${s.type}: ${s.uiScore}`)
    .join(', ');
  const tipLine = input.tips.map((t) => t.body).join(' ');
  const productLine = input.products.slice(0, 4).map((p) => p.name).join(', ');
  const user = [
    input.query ? `Question: ${input.query}` : 'The user sent a selfie for skin education.',
    input.analyzed ? `Perfect Corp analysis scores (0-100, not a diagnosis): ${scoreLine || 'none returned'}.` : '',
    tipLine ? `Studio notes: ${tipLine}` : '',
    productLine ? `Products available on this platform: ${productLine}.` : '',
    'Write a helpful skincare education answer. Mention Perfect Corp only if scores were provided. Do not diagnose.',
  ]
    .filter(Boolean)
    .join('\n');
  try {
    return await groqChat(
      [
        { role: 'system', content: SKIN_EDUCATOR },
        { role: 'user', content: user },
      ],
      { maxTokens: 450 },
    );
  } catch {
    return input.fallback;
  }
}

function uniqById(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

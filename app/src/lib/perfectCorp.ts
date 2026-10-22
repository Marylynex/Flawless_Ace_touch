import crypto from 'crypto';

const API_HOST = 'https://yce-api-01.makeupar.com';
const SD_ACTIONS = [
  'acne',
  'pore',
  'texture',
  'redness',
  'oiliness',
  'moisture',
  'wrinkle',
  'age_spot',
  'skin_type',
] as const;

export interface SkinScore {
  type: string;
  uiScore: number;
  rawScore?: number;
}

type Json = Record<string, unknown>;

function asRecord(v: unknown): Json {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : {};
}

export function perfectCorpConfigured(): boolean {
  return Boolean(process.env.PERFECT_CORP_API_KEY);
}

function apiKey(): string {
  return (process.env.PERFECT_CORP_API_KEY || '').trim();
}

function secretKey(): string {
  return (process.env.PERFECT_CORP_SECRET_KEY || '').trim();
}

function toPem(raw: string): string {
  const body = raw
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s/g, '');
  const lines = body.match(/.{1,64}/g)?.join('\n') ?? body;
  return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}

function encryptIdToken(clientId: string, secret: string): string {
  const payload = `client_id=${clientId}&timestamp=${Date.now()}`;
  const encrypted = crypto.publicEncrypt(
    { key: toPem(secret), padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(payload),
  );
  return encrypted.toString('base64');
}

let cachedToken: { value: string; exp: number } | null = null;

async function rsaAccessToken(): Promise<string | null> {
  const clientId = apiKey();
  const secret = secretKey();
  if (!clientId || clientId.startsWith('sk-') || !secret || !secret.startsWith('MIG')) return null;
  if (cachedToken && cachedToken.exp > Date.now()) return cachedToken.value;

  const res = await fetch(`${API_HOST}/s2s/v1.0/client/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, id_token: encryptIdToken(clientId, secret) }),
  });
  const data = asRecord(await res.json().catch(() => ({})));
  const result = asRecord(data.result);
  const token = typeof result.access_token === 'string' ? result.access_token : null;
  if (!token) return null;
  cachedToken = { value: token, exp: Date.now() + 90 * 60 * 1000 };
  return token;
}

async function authHeaders(): Promise<HeadersInit> {
  const rsa = await rsaAccessToken();
  const token = rsa || apiKey();
  return { Authorization: `Bearer ${token}` };
}

async function pcFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = { ...(await authHeaders()), ...(init.headers as Record<string, string> | undefined) };
  return fetch(`${API_HOST}${path}`, { ...init, headers });
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function uploadImage(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || 'image/jpeg';
  const fileName = (file.name || 'selfie.jpg').slice(0, 80);

  const meta = await pcFetch('/s2s/v2.0/file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [{ content_type: contentType, file_name: fileName, file_size: buf.length }],
    }),
  });
  const metaJson = asRecord(await meta.json().catch(() => ({})));
  const files = (asRecord(metaJson.data).files as unknown[]) || [];
  const first = asRecord(files[0]);
  const fileId = typeof first.file_id === 'string' ? first.file_id : '';
  const requests = Array.isArray(first.requests) ? first.requests : [];
  const upload = asRecord(requests[0]);
  const url = typeof upload.url === 'string' ? upload.url : '';
  const uploadHeaders = asRecord(upload.headers);
  if (!fileId || !url) {
    throw new Error('Perfect Corp could not start the photo upload.');
  }

  const putHeaders: Record<string, string> = {};
  if (typeof uploadHeaders['Content-Type'] === 'string') putHeaders['Content-Type'] = uploadHeaders['Content-Type'];
  else putHeaders['Content-Type'] = contentType;
  if (typeof uploadHeaders['Content-Length'] === 'string') putHeaders['Content-Length'] = uploadHeaders['Content-Length'];

  const put = await fetch(url, { method: 'PUT', headers: putHeaders, body: buf });
  if (!put.ok) throw new Error('Could not upload the selfie to Perfect Corp.');
  return fileId;
}

function parseScores(payload: Json): SkinScore[] {
  const data = asRecord(payload.data);
  const results = asRecord(data.results);
  const output = Array.isArray(results.output) ? results.output : [];
  const scores: SkinScore[] = [];
  for (const row of output) {
    const r = asRecord(row);
    const type = typeof r.type === 'string' ? r.type : '';
    if (!type) continue;
    const ui = typeof r.ui_score === 'number' ? r.ui_score : Number(r.ui_score);
    const raw = typeof r.raw_score === 'number' ? r.raw_score : Number(r.raw_score);
    const uiScore = Number.isFinite(ui) ? ui : Number.isFinite(raw) ? raw : 0;
    scores.push({ type, uiScore: Math.round(uiScore), rawScore: Number.isFinite(raw) ? raw : undefined });
  }
  return scores;
}

export async function analyzeSkinPhoto(file: File): Promise<SkinScore[]> {
  const fileId = await uploadImage(file);
  const created = await pcFetch('/s2s/v2.0/task/skin-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      src_file_id: fileId,
      dst_actions: [...SD_ACTIONS],
      format: 'json',
    }),
  });
  const createdJson = asRecord(await created.json().catch(() => ({})));
  if (!created.ok) {
    const err = typeof createdJson.error === 'string' ? createdJson.error : 'skin-analysis-failed';
    throw new Error(err);
  }
  const taskId = String(asRecord(createdJson.data).task_id || '');
  if (!taskId) throw new Error('Perfect Corp did not return a task id.');

  for (let i = 0; i < 16; i += 1) {
    await wait(2000);
    const poll = await pcFetch(`/s2s/v2.0/task/skin-analysis/${encodeURIComponent(taskId)}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const pollJson = asRecord(await poll.json().catch(() => ({})));
    const status = String(asRecord(pollJson.data).task_status || pollJson.task_status || '');
    if (status === 'success') return parseScores(pollJson);
    if (status === 'error') {
      const err = typeof pollJson.error === 'string' ? pollJson.error : 'The skin analysis could not finish.';
      throw new Error(err);
    }
  }
  throw new Error('Skin analysis is still running. Try again in a moment.');
}

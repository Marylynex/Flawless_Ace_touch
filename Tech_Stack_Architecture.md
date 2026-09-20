# Tech Stack & Architecture — Flawless AceTouch (MVP)

## 1. Proposed Stack (web-first)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (React, App Router) + TypeScript + Tailwind + shadcn/ui | Fast MVP, SSR for SEO/educational content, easy form wizards |
| Backend | Next.js Route Handlers / tRPC-lite (Node) for MVP; extract to NestJS/Fastify if needed | Keep one deployable initially |
| DB | Postgres (Supabase or Neon) + Prisma | Relational profiles/routines, easy auth + storage |
| Object storage | S3-compatible (Supabase Storage / Cloudflare R2) | Skin photos, formula PDFs |
| Auth | Supabase Auth / Auth.js (email magic-link + Google) | Low friction for 25–45 audience |
| LLM | Hosted LLM API (OpenAI/Anthropic) behind server only | Consultation dialogue, summaries; never sole decision-maker |
| Rules engine | TypeScript module `recommendation-engine/` (JSON rules + scoring) | Deterministic, auditable product matching; LLM only explains |
| Product catalog | Postgres table + admin CSV import | No marketplace in MVP |
| Jobs/Email | Trigger.dev or Inngest + Resend | Check-in reminders (2–4 wk), NPS survey |
| Analytics | PostHog (self-host option) | Events in Analytics_Events.md, funnels |
| Hosting | Vercel (web) + Supabase/Neon (data) | <$100/mo at MVP scale, zero-ops |

No native app in MVP. Responsive web only.

## 2. System Diagram (text)

```
[Browser: Next.js] --HTTPS--> [Next.js Server: Auth, Consult API, Rules Engine]
        |                              |           |           |
   Upload photo                  [Postgres]   [R2/S3]   [LLM API (server-side)]
        |                              |
[PostHog analytics] <--- events --- [Browser + Server]
[Resend/Inngest] <-- reminders (check-in, NPS)
```

## 3. Data Flow

**Consultation → Recommendation → Formulation**

1. `POST /consultations` creates Consultation (step=welcome). Client wizard posts answers + optional photo URL per step.
2. Server validates, stores `ConsultationStep` answers, updates `SkinProfile` draft.
3. On final step: Rules Engine scores Products against profile (skinType, concerns, sensitivities, preferences, conflicts) → top N with `reason` codes.
4. LLM generates plain-language Analysis summary (top 2–3 priorities) + routine order + lifestyle tips from engine output. Stored as `Recommendation` (engine JSON + LLM text separately for audit).
5. If eligible (rules: e.g. sensitivity/complex concerns), offer `CustomFormula` draft: suggested actives → user adjusts texture/scent/intensity → formula concept saved → optional order flag (manual fulfillment in MVP).
6. Scheduler creates CheckIn due in 2–4 weeks + email reminder. CheckIn compares JournalEntries + self-ratings to refine.

Photo flow: client → presigned URL → R2 → URL stored on Consultation; never sent to LLM vendor without explicit consent flag (privacy).

## 4. Auth

- Magic-link + Google OAuth. Sessions via httpOnly cookies (Supabase/Auth.js).
- Roles: `user`, `admin` (catalog/formula review). No esthetician role in MVP (async only, no live video per PRD §9).
- Rate-limit consultation completion + uploads per user/IP.

## 5. Privacy / Safety Notes (MVP-critical)

- Explicit consent checkbox for photo upload + optional LLM processing; photos private by default, signed URLs with expiry.
- No medical diagnosis; hard-coded disclaimer + blocklist (e.g. suspected infection, severe lesions → "see dermatologist" message, no recommendation).
- PII minimization: store only needed lifestyle data; delete photos on account deletion (cascade job).
- Allergies/sensitivities are hard filters, never soft-scored.
- Audit trail: keep engine version + rule scores with each Recommendation.

## 6. Hosting / Cost Notes

- Vercel Hobby→Pro (~$20) + Supabase Pro ($25) + R2 (pennies) + LLM pay-per-use (~$0.01–0.05/consultation with short prompts) + PostHog free tier + Resend free tier.
- Scale triggers to revisit: >10k MAU → extract backend; >100k photos → CDN + lifecycle rules; multiregion only if latency/compliance demands.
- Backups: daily Postgres PITR; R2 versioning for photos.

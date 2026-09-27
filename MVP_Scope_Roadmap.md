# MVP Scope & Roadmap — Flawless AceTouch
Derived from `Flawless_Acetouch_PRD.md` v1.1 (Sept 2026). V1 is mock-only, async-only expert marketplace: intake → matching → async expert review → recommendations → custom formulation. No diagnosis/prescription, no live video.

## 1. MoSCoW (PRD §4, §5, §9)

**Must have (V1):**
- 7-step async consultation: Welcome/Goals → Profile Discovery (+ mock photos) → Expert Matching + request submit → Mock expert review (top 2–3 priorities) → Routine + product suggestions (expert-endorsed) → Custom formula teaser → Action plan + check-in invite
- Expert matching (mock directory: filter by specialty/language/availability) + request submission with matched-expert profile shown
- Request status tracking: submitted → under review → answered, with expected response window displayed
- Mock expert replies: named expert (name, credentials, photo) + structured analysis + recommendations; mock follow-up reply at check-in
- Healthy product suggestion engine (rules-based matching + curated catalog, ≤5 picks per routine, with why-it-fits + order-of-use)
- Custom formulation flow: ingredient suggestion → preferences (texture/fragrance-free/intensity) → formula concept → save / order intent
- Progress check-in (2–4 wk): short re-quiz + refine routine
- Saved Routines & Formulas, Skin Journal (light notes), onboarding
- Safety: allergy/sensitivity capture, disclaimer, derm-referral triggers, photo consent

**Should have (V1.1):**
- Photo upload (optional) with basic guidance + manual review prompt
- Educational insights library (concern → ingredient mapping, skippable cards)
- Lifestyle tips engine, routine conflict checker (e.g., retinoid + AHA/BHA stacking)
- Email/SMS check-in reminders, NPS + clarity/confidence survey
- Affiliate link tracking + conversion analytics

**Could have (V2+):**
- Men / teens-acne / 50+ mature-skin tracks
- Real-time video consults (deferred from V1; V1 is async request-based only)
- AI photo analysis, subscription auto-refill custom formula, advanced journaling/charts

**Won't have in V1 (per PRD §9; diagnosis never in scope, video deferred to V2+):**
- Formal medical diagnosis/prescription (V1 experts give general skincare guidance only; all mock)
- Makeup tutorials / look creation
- Third-party seller marketplace
- Community/social features

## 2. Version Plan

### V1 — Core Loop (6–8 weeks)
Goal: user completes intake → matched to mock expert → tracks request → gets expert-backed routine → returns for 1 check-in.
- Weeks 1–2: IA, consult questionnaire + copy, product catalog schema (30–50 curated healthy SKUs), mock expert directory schema + matching rules, design system
- Weeks 3–4: Intake + matching + request-status flow + mock expert reply render + routine output page + saved items + journal MVP
- Weeks 5–6: Custom formula configurator (no lab integration — concept + order-intent), check-in flow with mock follow-up reply, disclaimers/consent, analytics (incl. match success, response time)
- Weeks 7–8: QA, safety review, content QA (derm-advisor review of mappings), closed beta (n=50–100 women 25–45), harden

### V1.1 — Trust + Retention (weeks 9–14)
- Photo upload, conflict checker, education cards, reminders, affiliate tracking, expanded catalog (100+ SKUs)

### V2 — Expansion (Q2+)
- New audience tracks, real-time video consult pilot (only after async V1 validated), custom formula fulfillment partner, subscriptions

## 3. Milestones & Exit Criteria

| Milestone | Date | Exit criteria |
|---|---|---|
| M1 Design freeze | W2 | Consult script + routine template + formula concept approved; safety copy signed off |
| M2 Consult usable | W4 | ≥80% internal testers complete intake + match + submit in <10 min; status (submitted/under review/answered) + response window render; mock expert reply renders with name/credentials + ≤5 products + why-fit |
| M3 Full loop | W6 | Check-in + save + formula-intent work E2E incl. mock follow-up reply; zero P0 safety bugs (allergy/pregnancy flags fire; no diagnosis language) |
| M4 Beta ready | W7 | 50 beta users onboarded; consent + retention + disclaimer instrumented |
| M5 V1 launch | W8 | ≥60% intake→request-submit, ≥90% match success, ≥4.2/5 clarity score, mock median submitted→answered <48h displayed correctly, ≥30% check-in return (beta cohort), 0 unresolved safety/legal blockers |

V1 launch gate: all Must-haves live (matching + status + mock replies verified), safety review passed, catalog advisor-approved, analytics on PRD §8 metrics (incl. match success, response time).

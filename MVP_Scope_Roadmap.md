# MVP Scope & Roadmap — Flawless AceTouch
Derived from `Flawless_Acetouch_PRD.md` v1.0 (Sept 2026).

## 1. MoSCoW (PRD §4, §5, §9)

**Must have (V1):**
- 6-step async consultation: Welcome/Goals → Profile Discovery → Analysis (top 2–3 priorities) → Routine + product suggestions → Custom formula teaser → Action plan + check-in invite
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

**Could have (V2):**
- Men / teens-acne / 50+ mature-skin tracks
- Live video consults (derm/advisor marketplace — still 1P only, no 3P marketplace)
- AI photo analysis, subscription auto-refill custom formula, advanced journaling/charts

**Won't have (per PRD §9, all versions in scope period):**
- Medical diagnosis/treatment of skin disease
- Makeup tutorials / look creation
- Third-party seller marketplace
- Community/social features

## 2. Version Plan

### V1 — Core Loop (6–8 weeks)
Goal: user completes consult → gets usable routine → returns for 1 check-in.
- Weeks 1–2: IA, consult questionnaire + copy, product catalog schema (30–50 curated healthy SKUs), design system
- Weeks 3–4: Consult flow + rules engine + routine output page + saved items + journal MVP
- Weeks 5–6: Custom formula configurator (no lab integration — concept + order-intent), check-in flow, disclaimers/consent, analytics
- Weeks 7–8: QA, safety review, content QA (derm-advisor review of mappings), closed beta (n=50–100 women 25–45), harden

### V1.1 — Trust + Retention (weeks 9–14)
- Photo upload, conflict checker, education cards, reminders, affiliate tracking, expanded catalog (100+ SKUs)

### V2 — Expansion (Q2+)
- New audience tracks, live consult pilot (1:1 async video → live), custom formula fulfillment partner, subscriptions

## 3. Milestones & Exit Criteria

| Milestone | Date | Exit criteria |
|---|---|---|
| M1 Design freeze | W2 | Consult script + routine template + formula concept approved; safety copy signed off |
| M2 Consult usable | W4 | ≥80% internal testers complete consult in <10 min; routine renders with ≤5 products + why-fit |
| M3 Full loop | W6 | Check-in + save + formula-intent work E2E; zero P0 safety bugs (allergy/pregnancy flags fire) |
| M4 Beta ready | W7 | 50 beta users onboarded; consent + retention + disclaimer instrumented |
| M5 V1 launch | W8 | ≥60% consult completion, ≥4.2/5 clarity score, ≥30% check-in return (beta cohort), 0 unresolved safety/legal blockers |

V1 launch gate: all Must-haves live, safety review passed, catalog advisor-approved, analytics on PRD §8 metrics.

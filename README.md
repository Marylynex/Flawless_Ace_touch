# Flawless Ace Touch

Personalized online skincare consultation platform — understand your skin, get healthy cosmetic product suggestions, and optionally create a custom formulation tailored to your needs.

## Vision

Replace skincare confusion and trial-and-error with clarity, confidence, and results-focused guidance — without requiring a dermatologist visit or endless product research.

## Core Value

After a guided consultation, every user leaves knowing:

- What their skin needs most right now
- Which healthy products will actually help
- How to use them correctly (order, frequency, AM/PM)
- Whether a custom-formulated product would add meaningful value

**Experience principles:** Functional · Engaging · Productive
**Tone:** Supportive, expert, reassuring — like a knowledgeable beauty advisor.

## Features (V1)

1. **Online Skincare Consultation** — 6-step flow:
   Welcome & Goal Setting → Skin Profile Discovery → Analysis & Insights → Personalized Recommendations → Custom Formulation Option → Next Steps & Follow-Up
2. **Healthy Product Suggestions** — non-irritating, effective, transparent formulas matched to concerns, routine, and preferences. Focused list, with clear why-it-fits reasons.
3. **Custom Formulation** — optional personalized serum / moisturizer / treatment: review suggested key ingredients → adjust texture/scent/intensity → review formula concept → order or save.
4. **Supporting features** — progress check-ins (2–4 weeks), skin journal, bite-size educational insights, saved routines & formulas, gentle onboarding.

See `Flawless_Acetouch_PRD.md` for the full PRD v1.0.

## Target Audience

- **Primary:** Women 25–45 investing in skincare but overwhelmed by generic advice (acne/breakouts, early aging, uneven tone, sensitivity, dryness/combination; values clean, effective, transparent ingredients).
- **Future:** Men, teens/young adults (acne), women 50+ (mature skin).

## Repository Contents

| File | Purpose |
|---|---|
| `Flawless_Acetouch_PRD.md` | Product Requirements Document v1.0 |
| `Consultation_Questionnaire_Spec.md` | Exact consultation questions, branching, photo rules |
| `User_Stories_Acceptance_Criteria.md` | User stories + acceptance criteria |
| `Recommendation_Engine_Rules.md` | Profile → priorities → routine/product mapping, conflict rules |
| `User_Journey_Wireframes.md` | Screen-by-screen flow (12 screens) |
| `Tech_Stack_Architecture.md` | Proposed stack, data flow, hosting |
| `Data_Model.md` | Schemas: User, SkinProfile, Consultation, Recommendation, Product, CustomFormula, CheckIn, Journal |
| `API_Spec.md` | REST endpoints + examples |
| `Analytics_Events.md` | Events mapped to success metrics |
| `MVP_Scope_Roadmap.md` | MoSCoW, V1 / V1.1 / V2 milestones |
| `Competitor_Analysis.md` | Proven, Curology, Atolla/Yoil, Apostrophe + positioning |
| `Legal_Safety_Guardrails.md` | Disclaimers, allergy/pregnancy flags, photo consent, privacy |
| `Pricing_Business_Model.md` | Monetization options + V1 recommendation |
| `Brand_Tone_Guide.md` | Voice, do/don'ts, sample copy |
| `Custom_Formulation_Ops.md` | Ingredient library, QC, lead time, reorder |
| `Test_Plan_UAT.md` | 25 test cases mapped to success metrics |

## Out of Scope (V1)

Medical diagnosis/treatment, makeup tutorials, live video consultations, third-party marketplace, community/social features.

## Success Metrics

Consultation completion rate · clarity/confidence score · save/act rate · formulation explore/order rate · check-in return rate · satisfaction / NPS.

## Getting Started

This repo currently contains product + planning docs. App implementation (web: Next.js/React + Node, Postgres, object storage for photos) is tracked in `Tech_Stack_Architecture.md` and `MVP_Scope_Roadmap.md`.

```bash
git clone https://github.com/Marylynex/Flawless_Ace_touch.git
cd Flawless_Ace_touch
```

## Contributing

1. Create a feature branch
2. Keep docs consistent with the PRD's 6-step flow and safety guardrails (no medical diagnosis)
3. Open a PR with a clear description

## License

All rights reserved — see repository owner for licensing.

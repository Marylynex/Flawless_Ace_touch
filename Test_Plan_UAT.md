# Flawless AceTouch — Test Plan & UAT
v1.1 | Sept 2026 | Maps to PRD v1.1 Sec 8 success metrics (mock-only, async-only; no diagnosis/prescription, no live video)

## 1. Metric → coverage map
| PRD Sec 8 metric | Test cases |
|---|---|
| Complete a full intake + submit request | TC-01–TC-04, TC-21–TC-22 |
| Match success rate and time-to-match | TC-21, TC-25 |
| Expert response time (submitted → answered) | TC-22, TC-25 |
| Clarity & confidence after consultation | TC-05–TC-07, TC-23 |
| Save or act on recommendations | TC-08–TC-10 |
| Explore / complete custom formulation | TC-11–TC-15 |
| Return for progress check-ins | TC-16–TC-18 |
| Satisfaction / likelihood to recommend | TC-19–TC-20 |
| Edge cases | EC-01–EC-05 |

## 2. UAT cases (30 total: TC-01–TC-25 + EC-01–EC-05; TC-01–TC-20 & EC unchanged)

### Consultation completion
- **TC-01 Happy-path 6-step consult:** Steps: complete Welcome → Profile → Analysis → Recommendations → Formulation offer → Next steps in one session. Pass: reaches action plan; routine + next-step CTA shown.
- **TC-02 Resume interrupted consult:** Steps: quit at step 3, return via onboarding link. Pass: answers preserved; resumes at step 3.
- **TC-03 Photo optional:** Steps: complete consult twice — with and without photo upload. Pass: both complete; no-photo path never blocks.
- **TC-04 Time-boxed consult:** Steps: complete first consult noting elapsed time. Pass: completable in one focused session (~5–8 min for happy path).

### Clarity & confidence
- **TC-05 Analysis summary:** Steps: finish profile, read Analysis. Pass: shows top 2–3 priorities in plain language with why-it-matters; tone check per Brand_Tone_Guide.
- **TC-06 Routine usability:** Steps: open Recommendations. Pass: AM/PM order, frequency, amounts shown; ≤3 hero actions prioritized.
- **TC-07 Lifestyle tips skippable:** Steps: skip educational/lifestyle blocks. Pass: plan still complete; no blocker.

### Save / act
- **TC-08 Save routine:** Steps: save routine, log out, log back in. Pass: routine intact under Saved.
- **TC-09 Act on product:** Steps: tap through a suggested product (details/how-to-use). Pass: why-it-fits + usage shown; outbound/act event logged.
- **TC-10 Focused list:** Steps: review suggestion count. Pass: focused list (e.g., ≤5 items), matched to concerns, no duplicates/conflicts with current routine.

### Formulation
- **TC-11 Offer only when valuable:** Steps: run consult for (a) user well-served by ready-made, (b) user with gap (e.g., fragrance sensitivity). Pass: (a) soft/absent offer, (b) clear optional offer, never pressuring.
- **TC-12 Ingredient review:** Steps: open formulation with sensitivity flag set. Pass: flagged allergen excluded; 2–4 actives with purpose + % range + caution shown.
- **TC-13 Preferences:** Steps: set texture/scent/intensity (incl. Strong with sensitive flag). Pass: fragrance-free default for sensitive; Strong requires acknowledgement or is gated.
- **TC-14 Concept card:** Steps: generate concept. Pass: purpose, ≤3 benefits, routine slot, full ingredients, price/lead time, Order + Save-for-later CTAs.
- **TC-15 Order vs save:** Steps: (a) place order, (b) save-for-later then resume. Pass: (a) status trackable; (b) resumable, surfaced once neutrally at check-in.

### Check-ins & retention
- **TC-16 Check-in flow (2–4 wk):** Steps: complete follow-up. Pass: reviews results, celebrates progress, offers ≤1 refinement.
- **TC-17 Journal + save:** Steps: add skin note; revisit saved routine/formula. Pass: note persisted; saved items accessible.
- **TC-18 Next-steps loop:** Steps: finish consult and check-in. Pass: each ends with a clear next step + check-in invitation.

### Satisfaction
- **TC-19 Satisfaction prompt:** Steps: rate clarity/confidence + likelihood to recommend after consult. Pass: 1–5 captured; low score offers "what was unclear?" follow-up.
- **TC-20 Tone audit:** Steps: review all strings against Brand_Tone_Guide §7 checklist. Pass: no medical/absolute/fear language; disclaimer present.

### Expert marketplace — matching, status, mock replies (V1.1, mock-only async)
- **TC-21 Match success:** Steps: submit intakes for 3 concern profiles (acne, sensitivity, uneven tone); observe matched mock expert. Pass: match succeeds each time; specialty/language shown; selection rationale visible; no dead-end.
- **TC-22 Status transitions:** Steps: submit request; advance mock clock through submitted → under review → answered. Pass: status badge + timeline update in order; answered state unlocks expert reply; no skipping/regression.
- **TC-23 Expert reply render:** Steps: open answered request. Pass: header shows named expert (name, credentials, photo) + response date; body shows top 2–3 priorities in plain language + endorsed routine; tone per Brand_Tone_Guide.
- **TC-24 Photo-skip with expert flow:** Steps: complete intake + match + submit with mock photo, then repeat skipping photo. Pass: both submit and get mock reply; no-photo path shows "add photos later for a more tailored review" note, never blocks.
- **TC-25 Response-window display:** Steps: check match confirmation and status screens. Pass: expected window (e.g., "typically replies within 24–48 hours") shown at submit and during under-review; elapsed/window state consistent; no real-time-video or booking UI present.

### Edge cases
- **EC-01 Sensitive/allergic user:** Steps: consult with allergy + past reaction; attempt formulation with that allergen. Pass: allergen blocked everywhere; gentle alternatives + pause/patch guidance shown.
- **EC-02 Photo skip:** Steps: skip photo, give minimal answers. Pass: consult completes with safe generic-first advice + invitation to add detail later.
- **EC-03 Conflicting actives:** Steps: request high-% exfoliant + retinoid in one formula / routine. Pass: hard block or separated AM/PM with warning; requires confirm.
- **EC-04 Overwhelm / minimal-effort user:** Steps: select "minimal time" + "simple routine". Pass: routine ≤3 steps; no upsell pressure.
- **EC-05 Medical red flag:** Steps: enter persistent/worsening condition language. Pass: no diagnosis; shows "see a dermatologist" guidance + cosmetic-only disclaimer.

## 3. UAT exit criteria
- 100% of TC-01–TC-25 + EC-01–EC-05 executed; ≥95% pass, no open P1 (safety/blocker) defects.
- Spot-check PRD Sec 8 analytics events fire: intake completion, request submit, match success/time-to-match, submitted→answered response time, clarity score, save/act, formulation explore/order, check-in return, NPS.

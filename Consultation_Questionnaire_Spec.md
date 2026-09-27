# Consultation Questionnaire Spec - Flawless AceTouch v1.1

Covers PRD Steps 1-3: Welcome & Goal Setting + Skin Profile Discovery + Expert Request payload. Time budget: <5 min (~18 questions, 1 photo optional, mock-only). All experts/replies mock in V1; no diagnosis, no live video.

## Design rules
- One question per screen, progress bar (Step X of Y), Back/Skip where allowed.
- Required vs Optional marked. Optional never blocks.
- Conversational copy: supportive/expert/reassuring. One-line "why we ask" helper per screen.
- All multi-selects capped (max 3) to force prioritization.
- Every answer maps to the expert request payload (see bottom section).

## Step 1 - Welcome & Goal Setting (Q1-Q3)

**Q1. Primary goal** | multi-select max 3 | Required
Options: Clearer skin / fewer breakouts; Less dryness; Less oiliness/shine; Fade dark spots / even tone; Calm redness/sensitivity; Soften fine lines / firmness; Build simple routine; Prep for event; Just understand my skin
Branching: if "Calm redness/sensitivity" -> add sensitivity deep-dive (Q9a). If "Prep for event" -> ask event date (Q1a date, Optional).

**Q2. Biggest frustration** (free text, 280 chars) | Optional
Placeholder: "e.g. moisturizer pills, foundation clings, tried vitamin C and it stung..."
Validation: trim, no PII warning.

**Q3. Time & effort** | single-select | Required
Options: Minimal (~5 min, 2-3 steps) / Balanced (~10 min, 3-4 steps) / Dedicated (10+ min, 4-5 steps + weekly treatment)
Drives routine length in expert-approved plan.

## Step 2 - Skin Profile Discovery (Q4-Q14 + photo, mock-only)

**Q4. Skin type right now** | single-select + photo hint | Required
Oily / Dry / Combination / Balanced-Normal / Not sure. Helper: "Cleanse tonight, wait 1 hr, how does T-zone vs cheeks feel?"

**Q5. Main concerns** | multi-select max 3 | Required
Acne/breakouts; Blackheads/enlarged pores; Dryness/flaking; Oiliness; Sensitivity/redness; Uneven tone/dark spots; Dullness; Fine lines/wrinkles; Loss of firmness; Dehydration/tightness.
Also drives expert matching (specialty).

**Q6. Breakout pattern** | single-select | Required if Q5 includes acne/breakouts, else Optional
Hormonal (jawline/cycle); Frequent all-over; Occasional (stress/event); Past acne, now marks only.

**Q7. Lifestyle** | multi-chip multi-select | Optional (at least 1 encouraged)
Sleep <6h; High stress; High sun exposure; Dry/AC climate; Humid climate; Hard water; Heavy makeup daily; Sweat/exercise 3x+/wk; Diet triggers noted (dairy/sugar).
Each maps to lifestyle tip slot in Recommendation Engine.

**Q8. Current routine** | per-step checklist + free text | Optional
AM/PM: cleanser, treatment, moisturizer, SPF (names optional, 100 chars each). Plus: "What do you love / hate about current products?" (2 x 140 chars).

**Q9. Sensitivities & allergies** | multi-select + text | Required (select "None" to pass)
Fragrance; Essential oils; Niacinamide>5%; Vitamin C; Retinoids; AHAs/BHAs; Benzoyl peroxide; Sunscreen filters; Latex; Nuts/oils; None. Free text: past reaction (Optional, 200 chars).
**Q9a (conditional). Reaction severity** | single-select | Required if any sensitivity selected
Redness/itch <24h / Breakout / Rash/swelling / Needed medical care -> if last, show disclaimer + exclude strong actives, flag "patch-test only, no diagnosis."

**Q10. Preferences** | multi-select | Required (min 1)
Gentle/minimal; Clean/transparent ingredients; Fragrance-free; Vegan/cruelty-free; Budget-friendly; Premium OK; Fast visible results; Pregnancy/breastfeeding-safe.
Also used for expert matching (e.g. language/specialty notes) and product filtering.

**Q10a. Language / expert preference** | single-select + multi | Optional
Preferred language; optional expert gender/specialty note. Feeds matching only.

**Q11. Ingredients to avoid** | text + presets | Optional
Presets: silicones, drying alcohols, coconut oil, talc. Free text 140 chars.

**Q12. Climate & season** | single-select + auto | Optional
Auto-detect region (permission-gated); manual: Hot-humid / Hot-dry / Cold-dry / Mild. Used for texture weighting.

**Q13. Age band** | single-select | Required
25-29 / 30-34 / 35-39 / 40-45. (PRD primary audience; no free DOB.)

**Q14. Photo upload (MOCK-ONLY in V1)** | 1-3 images | Optional but encouraged
Rules: use mock/test images only in the prototype - no real patient photos; stored locally, never uploaded to a server. Front + left/right cheek framing, natural light, no makeup/filter, face only, JPG/PNG/HEIC max 8MB each, min 720px. Client-side blur/brightness check; reject + retry message. Consent checkbox required before attach: "I consent to sharing these mock photos with the matched expert for my consultation (V1: mock review only)." No nude/eye-closeup; auto-crop face oval preview. If skipped -> continue with "Not sure" skin type allowed.

## Step 3 - Expert request payload (what intake submits)
On "Send request to [Expert]", the app builds one structured payload and stores it locally:
- goals: Q1 (+Q1a), frustration Q2, effort tier Q3
- skin profile: Q4-Q6, lifestyle Q7, current routine Q8
- safety: Q9/Q9a, avoid-list Q11, medical-guardrail flags
- preferences: Q10, language Q10a, climate Q12, age band Q13
- photos: Q14 mock images (count + local refs) + consent timestamp
- meta: matched expert ID, submitted-at, expected response window, status = submitted
Matching inputs: Q5 concerns -> specialty; Q10a -> language; mock availability. Status machine: submitted -> under review -> answered (mock transition). Follow-up check-ins reuse this payload shape plus delta answers.

## Validation & safety
- Required gates: Q1, Q3, Q4, Q5, Q9, Q10, Q13. All else skippable.
- Max lengths enforced; strip URLs.
- Medical guardrail: keywords (mole changing, open sore, severe cystic pain, hair loss patch) -> soft-block: "We can't diagnose this - consider a dermatologist" + allow cosmetic-only continue.
- No live video, no formal diagnosis/prescription language; expert replies are mock general-skincare guidance only.

## Time estimate
- Fast path (minimum required + 1 mock photo): ~3 min. Full path: ~4.5 min. Progress saver: draft autosaved locally, resume within 7 days.

## Conversational UX notes
- Tone examples: "Got it - let's calm the sensitivity first, glow second." / "Last one, then we match you with your expert."
- Micro-affirmations after Q5 and Q10 ("This already narrows it down a lot").
- Allow edit from pre-submit review and from Analysis screen ("Not quite? Adjust answers" -> resubmits draft).
- Keyboard-first, large tap targets, 16px+ inputs; WCAG AA contrast.

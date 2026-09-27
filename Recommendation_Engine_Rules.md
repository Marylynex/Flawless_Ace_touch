# Recommendation Engine Rules — Flawless AceTouch v1.1 (expert-reviewed)

Pipeline: SkinProfile → Priority scoring → Top 2–3 priorities → Draft routine + products + tips → Expert approval → Final recommendation + expert endorsement note. Rules produce a DRAFT for expert review; nothing publishes without expert sign-off (mock expert in V1). Every output keeps a reason string.

## 1. Inputs (from Questionnaire Spec)
Goals (Q1), effort tier (Q3), skin type (Q4), concerns (Q5–Q6), lifestyle (Q7), current routine (Q8), exclusions (Q9–Q11), preferences (Q10), climate (Q12), age band (Q13), photo signals (optional boost ±1).

## 2. Priority scoring
Concern categories: Acne, Sensitivity/Barrier, Dryness/Dehydration, Oiliness/Pores, Tone/Spots, Dullness, Lines/Firmness.

Score per category (0–10):
- +4 if in Q5 main concerns; +2 if primary goal maps to it; +1 if Q6 pattern matches (acne); +1 photo boost (max +1); +1 age rule (35+ → Lines/Firmness; 25–34 with acne focus → Acne).
- Sensitivity override: if Q9a = rash/medical → Sensitivity floor = 7 regardless of score.
- Effort guardrail: Minimal tier caps active categories at 2.

Rank desc; take top 2 (Minimal) or 3 (Balanced/Dedicated). Tie-break order: Sensitivity > Acne > Barrier/Dryness > Tone > Oiliness > Dullness > Lines. Log scores for Analysis screen ("why this matters").

## 3. Routine assembly
Base by effort: Minimal = cleanser + moisturizer + SPF (AM) / cleanser + treatment + moisturizer (PM). Balanced adds 1 treatment + weekly exfoliant. Dedicated adds eye/antioxidant slot + 2x weekly mask/treatment.
- Assign each priority ≥1 active step; fill rest with support (hydration/SPF).
- Order template: AM cleanse → tone (opt) → antioxidant → moisturize → SPF; PM cleanse → exfoliant OR retinoid → treatment serum → moisturize.
- Frequency + amount on every step ("pea-size, PM 2x/wk, build to alternate nights").

## 4. Product matching (3–6 items)
Filter → rank → cap: keep ≤2 per step, total ≤6.
- Healthy-formula filters (hard): exclude user Q9/Q11 allergens; if preference fragrance-free → fragrance + essential oils out; acne/oily → non-comedogenic only; sensitivity → alcohol-free + pH 4.5–6 + no high-% acids; pregnancy-safe → no retinoids, no high salicylic, no hydroquinone.
- Rank: concern match (+3), preference match (+1 each), current-routine keep-if-loved (+2, avoid dupes), budget mix (ensure ≥1 accessible if "budget" set).
- Each card: concern tag, why-it-fits (1 line), filter badges, usage pointer.

## 5. Conflict rules (must-pass validation)
- Retinoid ∥ AHA/BHA/benzoyl peroxide/vit-C (L-ascorbic) on same night → alternate nights; show "Mon/Thu exfoliate, Tue/Sat retinoid" style split.
- Benzoyl peroxide ∥ retinoid same routine → AM/PM split or alternate days.
- Vitamin C (AM) + SPF mandatory pairing note.
- Max 1 strong exfoliant + 1 retinoid per routine; Minimal tier gets neither above 0.5% retinol / 8% AHA unless acne-severe.
- Niacinamide >5% excluded if Q9 flags it; layering order: thinnest→thickest, acids before retinoids never together.
- If conflict unresolvable within effort tier → drop lower-priority active, keep barrier support. Validator blocks publish on violation.

## 6. Lifestyle tips (2–3, mapped from Q7/Q12)
Sleep<6h → wind-down + pillowcase note; high sun → reapply SPF q2h hook; dry/AC → humidifier + lukewarm cleanse; humid → gel texture; heavy makeup → double-cleanse PM; sweat 3x+ → rinse post-workout. One line each, dismissible.

## 7. Custom-formula trigger
Show only if: (a) sensitivity + fragrance-free need unmet by catalog, OR (b) 2+ top priorities coverable by one serum/moisturizer, OR (c) user selected "fast results"+"premium OK" with tone/lines priority. Else "routine covers it" state. Concept inherits all filters + conflicts.

## 8. Fallbacks
No photo → proceed on answers. All products filtered out → relax premium/budget first, never safety filters; if still empty → barrier-repair default + "add more options soon" note.

## 9. Expert review gate (V1.1)
Draft status: rules output is `draft` linked to ConsultationRequest. Mock expert may: approve as-is, adjust priorities/products (logged in scores), or add expertNote endorsement (1–2 lines, shown on recommendation card). Validator re-runs conflict/healthy-filter rules after any expert edit; blocks publish on violation.

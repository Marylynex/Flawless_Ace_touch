# Flawless AceTouch — Custom Formulation Ops
v1.0 | Sept 2026 | Companion to PRD v1.0 (Sec 4.3, Sec 5)

> Scope: optional custom serum / moisturizer / treatment. Presented only when it adds meaningful value. Cosmetic only — no medical claims.

## 1. Formulation flow (4 steps)

```
[Consultation profile] → 1. Ingredient review → 2. Preferences → 3. Formula concept → 4. Order / Save-for-later
```

### Step 1 — Ingredient review
- Show 2–4 suggested key actives derived from profile + goals + allergy/sensitivity flags.
- Each: name, purpose in plain language, typical % range, caution (e.g., "start 2–3x/week PM").
- Auto-exclude flagged allergens; surface conflicts (see §4).
- User can remove / swap within allowed alternatives.

### Step 2 — Preferences
- Texture: light gel / lotion / rich cream (serum: watery / gel / light oil).
- Scent: fragrance-free (default for sensitive) or light natural scent (choose 1 of 3).
- Intensity: Gentle / Standard / Strong — Strong gated: requires no high-sensitivity flag + confirms patch-test acknowledgement.
- User confirms routine slot (e.g., "PM after cleansing, before moisturizer").

### Step 3 — Formula concept
One-page card:
- Purpose (1 line) + key benefits (≤3 bullets) + how it fits into routine (AM/PM, order, frequency).
- Full INCI-style ingredient list, % of key actives, fragrance status.
- Usage + patch-test instructions, pause criteria.
- Price, size (e.g., 30 ml), lead time. CTA: **Order** / **Save for later**.

### Step 4 — Order or Save-for-later
- **Order:** confirm address → QC batch → ship with usage card. Status trackable (Received → In formulation → QC passed → Shipped).
- **Save-for-later:** stored under Saved Routines & Formulas with concept + preferences; one-tap resume; reminder at check-in (no pushy upsell).

## 2. Base + actives library (example)

**Bases:**
| Base | Best for | Notes |
|---|---|---|
| Fragrance-free gel serum | Oily/combo, sensitive | Layers under SPF |
| Light lotion | Combo, daily AM | Fast-absorbing |
| Rich ceramide cream | Dry/sensitive, PM | Barrier support |

**Actives (illustrative ranges, QC confirms final %):**
| Active | Helps with | Typical range | Conflicts / cautions |
|---|---|---|---|
| Niacinamide | Tone, barrier | 2–5% | — |
| Hyaluronic acid / glycerin | Hydration | 0.5–2% / 3–7% | — |
| Azelaic acid derivative | Marks, redness-prone | 5–10% | Don't stack with strong exfoliants same night |
| Low-% bakuchiol | Early firmness (gentle retinol alt) | 0.5–1% | PM only |
| Vitamin C derivative (SAP/MAP) | Brightening | 3–5% | Separate from benzoyl peroxide |
| Salicylic acid | Breakout-prone | 0.5–2% | Not with retinoid same routine step; sensitive → Gentle only |

## 3. Safety & conflict rules
- Hard block: known allergen, flagged past reaction, incompatible combo (e.g., high-% AHA + retinoid in one formula).
- Soft warning (requires explicit confirm): Strong intensity for sensitive user; >2 exfoliating/brightening actives in one formula.
- Copy pattern: "We swapped X for Y because you noted [allergy/sensitivity] — same goal, gentler path."
- Every order ships with patch-test + pause guidance; cosmetic-only disclaimer.

## 4. QC checklist (per batch)
- [ ] Formula matches approved concept (% within tolerance, fragrance status correct)
- [ ] Allergen / conflict re-check passed
- [ ] pH in range for base type; appearance/scent spot-check
- [ ] Label: name, full ingredients, usage, batch #, expiry/PAO, disclaimer
- [ ] Photo/log retained for traceability

## 5. Lead time & reorder
- Standard lead time: **5–7 business days** formulation + shipping time; shown before order confirm.
- Reorder: one tap from Saved; prompts quick check ("Any new sensitivity?") before repeat batch.
- Adjust: intensity/texture tweaks create v2 concept linked to v1; history retained.

## 6. Save-for-later behavior
- Auto-saved on exit at any step; resumable.
- Check-in surfaces it once, neutrally: "Still curious about your saved serum concept? Peek or dismiss."
- Analytics: track explore rate, order rate, save→order conversion (PRD Sec 8).

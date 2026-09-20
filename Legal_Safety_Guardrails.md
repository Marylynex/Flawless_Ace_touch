# Legal & Safety Guardrails — Flawless AceTouch
Not legal advice. Have counsel review before launch. Applies to V1 (cosmetic-only, no diagnosis).

## 1. No-Diagnosis Disclaimer (copy — show at consult start + routine output)
> Flawless AceTouch provides general cosmetic and educational information only. It is not medical advice, diagnosis, or treatment. If you have a medical skin condition or are unsure, please see a dermatologist or healthcare professional.

- Require explicit checkbox: "I understand this is not medical advice." Block consult until accepted.
- Repeat short form on every routine PDF/share: "Cosmetic info only — not medical advice."

## 2. Allergy / Sensitivity Handling
- Mandatory intake: known allergies (fragrance, nut oils, latex, etc.), past reactions, sensitivity level, current Rx topicals.
- Rules: any flagged allergen → hard-exclude ingredient/SKU; high-sensitivity → default fragrance-free + patch-test prompt.
- Patch-test copy: "Apply a pea-size amount behind ear/forearm, wait 24–48h. Stop use and rinse if burning, swelling, or rash occurs."
- Log allergy inputs + exclusions for audit; never recommend a product containing a stated allergen.

## 3. Pregnancy / Nursing Actives Flags
- Ask: "Pregnant, trying to conceive, or nursing?" If yes/unsure → conservative mode.
- Auto-flag + exclude or warn: retinoids (tretinoin, retinol, retinal), hydroquinone, high-dose salicylic acid (>2% leave-on), chemical sunscreens (oxybenzone preference to mineral), essential-oil-heavy fragrances.
- Copy: "This ingredient is typically avoided in pregnancy. We've excluded it — please confirm with your OB/GYN or dermatologist."
- Require OB/derm confirmation step before any custom formula with actives in this cohort.

## 4. Photo Consent + Retention
- Optional upload only. Consent checkbox: purpose (consult personalization), who sees it (advisor/system), retention period.
- Default retention: delete originals after 12 months or on account deletion (sooner on request). Thumbnails for routine history ≤ same period.
- No public display, no training use without separate opt-in. Store encrypted, access-logged.

## 5. Data Privacy (GDPR/CCPA basics)
- Lawful basis + purpose limitation; data minimization (collect only PRD §4.1 fields).
- Rights: access, correct, delete, export, opt out of sale/sharing (CCPA). Honor deletion ≤30 days.
- No sale of personal data; affiliate clicks disclosed ("We may earn a commission — it doesn't change our picks").
- Cookie/track consent banner (EEA/UK); DPA with any vendor; age gate 16+ (teens track = V2 with parental consent design).

## 6. When to Refer to Dermatologist (hard triggers — stop cosmetic path, show referral card)
- Suspected infection, spreading rash, mole change (ABCDE), non-healing sore, severe nodulocystic acne, hair loss with scalp inflammation, signs of eczema/psoriasis flare requiring Rx, any "unsure + painful/bleeding" case.
- Copy: "This looks like something a dermatologist should evaluate in person. We've paused product suggestions for this concern — here's how to prepare for your visit [checklist]."
- Log referral event; allow routine for unrelated cosmetic goals only with acknowledgment.

# User Stories & Acceptance Criteria — Flawless AceTouch v1.0

Format: Story + Acceptance Criteria. Out of scope: diagnosis, makeup tutorials, live video, marketplace, community.

## Onboarding
1. **As a** first-time visitor **I want** a 30-sec intro to consultation value **so that** I decide to start.
   - AC: landing states 3 outcomes (priorities, routine, products); CTA "Start free consultation"; intro skippable; <60s to Q1.

2. **As a** busy user **I want** to pause/resume consultation **so that** I don't restart.
   - AC: draft autosaved; resume banner within 7 days; Back edits prior answers without data loss.

## Consultation
3. **As a** user **I want** to set goals + skin profile in <5 min **so that** advice feels relevant without fatigue.
   - AC: required-only path ≤3 min; progress bar; optional photo upload per Questionnaire Spec rules; medical-flag soft-block works.

4. **As a** sensitive-skin user **I want** to flag allergies/reactions **so that** recommendations avoid irritants.
   - AC: Q9/Q9a captured; flagged ingredients excluded downstream; patch-test note shown; "Needed medical care" triggers derm-disclaimer.

5. **As a** user **I want** an Analysis summary of top 2–3 priorities in plain language **so that** I trust what follows.
   - AC: 2–3 priorities with 1-line why; tone supportive; "Adjust answers" link; reading level ≤ grade 8.

## Recommendations
6. **As a** user **I want** a realistic AM/PM routine with order + frequency **so that** I can start today.
   - AC: routine matches Q3 effort tier; each step has order, amount, frequency; ≤5 steps + 1 weekly; conflicts (retinoid+exfoliant) never same night.

7. **As a** user **I want** 3–6 healthy product suggestions with reasons **so that** I buy confidently.
   - AC: each has concern match, why-it-fits, healthy-filter tags (fragrance-free, non-comedogenic etc.); mix budget/premium when relevant; no dupes with disliked products.

8. **As a** user **I want** lifestyle tips tied to my answers **so that** habits support skin.
   - AC: 2–3 tips mapped from Q7 (sleep, sun, climate); dismissible; never medical prescriptions.

## Custom formula
9. **As a** user **I want** to see when custom adds value (and when not) **so that** I don't feel upsold.
   - AC: custom card shown only if rule fires (e.g. sensitivity + fragrance-free need, or 2+ concerns one product could cover); otherwise "Your routine covers it" state.

10. **As a** interested user **I want** to preview + tweak formula concept (texture, scent, active level) **so that** it feels mine.
    - AC: concept shows purpose, key ingredients + %, routine slot; 3 adjusters work; conflicts re-validated after tweak; save-for-later supported.

## Saved routines / journal / check-in
11. **As a** returning user **I want** saved routines + formulas in one place **so that** I reuse them.
    - AC: library lists active routine, past analyses, saved formulas; one-tap re-open; delete supported.

12. **As a** user **I want** a lightweight skin journal **so that** I track response over time.
    - AC: <30-sec entry (emoji feel + note + photo optional); timeline view; entries feed check-in summary.

13. **As a** user **I want** a 2–4 week check-in **so that** my routine gets refined.
    - AC: invite at 14–28 days; 5-question delta (improved/same/worse per priority, irritation?, adherence); outputs Keep/Adjust/Swap + celebrates progress; low adherence → simplify, not shame.

14. **As a** user **I want** plain-language ingredient explainers **so that** I learn without overload.
    - AC: ≤80-word cards, optional/skip; linked from routine + analysis; no efficacy guarantees.

15. **As a** user **I want** data/consent controls **so that** I trust the platform.
    - AC: photo consent logged; delete photos/data on request; no diagnosis or live-video paths present.

# Analytics Events — Flawless AceTouch (maps to PRD §8)

Conventions: PostHog. Every event includes `user_id, consultation_id?, timestamp, app_version, engine_version?`. PII-free properties only (no photo URLs, no free-text answers except NPS comment with consent).

| PRD Metric (§8) | Event | Trigger | Key properties |
|---|---|---|---|
| % complete consultation | `consultation_started` | POST /consultations | `source, goal_count` |
| | `consultation_step_completed` | each wizard step | `step (1–6), time_on_step_s` |
| | `consultation_completed` | POST …/complete | `duration_s, photo_attached (bool), priorities[]` |
| | `consultation_abandoned` | exit mid-wizard | `last_step, time_spent_s` |
| Clarity & confidence | `clarity_score` | POST …/clarity | `clarity_score 1–5, confidence_score 1–5, recommendation_id` |
| Save / act rate | `product_clicked` | tap product card | `product_id, recommendation_id, position` |
| | `product_saved` | POST …/save | `product_id, recommendation_id, routine_step` |
| | `routine_saved` | save full routine | `recommendation_id, item_count` |
| Formulation explore/order | `formulation_explored` | open formula draft | `consultation_id, base_type, eligible (bool)` |
| | `formulation_adjusted` | PATCH formula | `changed: texture/scent/intensity` |
| | `formulation_saved` | save for later | `formula_id` |
| | `formulation_ordered` | POST …/order | `formula_id, intensity, base_type` |
| Return for check-in | `checkin_scheduled` | schedule | `due_in_days` |
| | `checkin_reminder_sent` | email job | `days_overdue` |
| | `checkin_completed` | PATCH checkin | `progress_rating 1–5, concern_ratings{}, has_refinement (bool)` |
| | `journal_entry_created` | POST /journal | `skin_feel 1–5, has_notes (bool)` |
| Satisfaction / NPS | `nps_submitted` | POST /nps | `score 0–10, comment?, days_since_consultation` |

## Funnels (PostHog)
1. Completion: started → step_completed(×6) → completed.
2. Action: completed → product_clicked → product_saved → routine_saved.
3. Formulation: completed → explored → saved → ordered.
4. Retention: completed → scheduled → reminder → checkin_completed → second checkin.
5. Satisfaction: completed → clarity_score → nps_submitted.

## MVP targets (suggest, confirm pre-launch)
- Completion ≥ 60%, clarity ≥ 4.2/5, save/act ≥ 35%, formulation explored ≥ 15% / ordered ≥ 3%, check-in return ≥ 30%, NPS ≥ 50.

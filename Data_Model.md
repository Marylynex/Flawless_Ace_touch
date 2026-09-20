# Data Model — Flawless AceTouch (MVP)

Postgres + Prisma-style. UUID PKs, `createdAt/updatedAt` on all tables (omitted below for brevity).

## Enums

- `SkinType`: `dry | oily | combination | normal | sensitive`
- `Concern`: `acne | hormonal_breakouts | dryness | oiliness | uneven_tone | dark_spots | sensitivity | redness | fine_lines | firmness | texture | barrier_damage | dehydration`
- `Goal`: `clearer_skin | balance_oil | hydrate | fade_spots | calm | anti_aging | simple_routine | event_prep`
- `Preference`: `fragrance_free | clean_ingredients | gentle | fast_results | vegan | budget | premium_ok`
- `ConsultationStatus`: `in_progress | completed | abandoned`
- `RoutineStep`: `cleanser | toner | serum | treatment | moisturizer | spf | mask | exfoliant`
- `FormulaStatus`: `draft | saved | ordered | archived`

## Tables

### User
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | string unique | |
| name | string? | |
| dob | date? | age-band only use |
| role | `user \| admin` | default user |
| consentPhotoLLM | boolean | default false |
| consultations | → Consultation[] | |
| skinProfiles | → SkinProfile[] | history |

### SkinProfile (versioned snapshot per completed consultation)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| userId | fk User | |
| skinType | SkinType | |
| concerns | Concern[] | top 3 ordered |
| sensitivities | string[] | allergies/reactions, free text + tags |
| lifestyle | json | {sleep, stress, climate, diet, exercise} |
| timeBudget | `minimal \| moderate \| full` | |
| preferences | Preference[] | |
| photoUrls | string[] | private R2 URLs |
| sourceConsultationId | fk Consultation? | |

### Consultation (6-step wizard, PRD §4.1)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| userId | fk User | |
| status | ConsultationStatus | |
| currentStep | int 1–6 | 1 welcome/goals … 6 next-steps |
| goalNotes | text? | step 1 free text |
| answers | json | per-step structured answers |
| skinProfileId | fk SkinProfile? | set on completion |
| recommendationId | fk Recommendation? | set on completion |

### Recommendation
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| consultationId | fk unique | 1:1 |
| priorities | string[2..3] | top priorities |
| summaryText | text | LLM plain-language analysis |
| routine | json | [{step: RoutineStep, productId?, instructions, frequency}] |
| lifestyleTips | string[] | |
| engineVersion | string | e.g. `rules-v0.3` |
| scores | json | [{productId, score, reasons[]}] auditable |
| clarityPromptSent | boolean | whether clarity survey sent |

### Product (admin-curated, no marketplace)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name / brand | string | |
| category | RoutineStep | |
| concernsTargeted | Concern[] | |
| skinTypesFit | SkinType[] | |
| ingredients | string[] | key INCI |
| avoidFor | string[] | conflicts (e.g. fragrance, nut oils) |
| priceTier | `budget \| mid \| premium` | |
| isActive | boolean | |

### CustomFormula
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| userId / consultationId | fk | |
| baseType | `serum \| moisturizer \| treatment` | |
| keyActives | json | [{inci, pct, purpose}] |
| texture / scent | string | scent includes `fragrance_free` |
| intensity | `gentle \| standard \| strong` | |
| conceptText | text | purpose + benefits + routine fit |
| status | FormulaStatus | |
| orderedAt | datetime? | manual fulfillment MVP |

### CheckIn (2–4 wk follow-up)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| userId / consultationId | fk | |
| dueAt / completedAt | datetime | |
| progressRating | int 1–5? | |
| concernRatings | json | {concern: 1–5} |
| keepChange | text? | what helped / what didn't |
| refinedRecommendationId | fk Recommendation? | |

### JournalEntry (light notes)
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| userId | fk | |
| date | date | |
| skinFeel | int 1–5? | |
| notes | text? | |
| productIds | uuid[]? | what was used |

## Relations summary
User 1—N Consultation, SkinProfile, CustomFormula, CheckIn, JournalEntry. Consultation 1—1 Recommendation. Recommendation N—N Product (via routine/scores JSON; join table only if filtering needs grow).

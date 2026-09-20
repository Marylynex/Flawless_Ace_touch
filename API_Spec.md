# API Spec — Flawless AceTouch (MVP, REST)

Base: `/api/v1`. Auth: Bearer session cookie. All responses JSON. Errors: `{ error: { code, message } }`.

## Consultations

### POST /consultations — start
Req: `{ "goalNotes": "fade dark spots, simple routine" }`
Res 201: `{ "id": "uuid", "status": "in_progress", "currentStep": 1 }`

### PATCH /consultations/:id — save step
Req: `{ "currentStep": 2, "answers": { "skinType": "combination", "concerns": ["dark_spots","oiliness"], "sensitivities": ["fragrance"], "timeBudget": "minimal", "preferences": ["fragrance_free"] } }`
Res 200: `{ "id": "uuid", "currentStep": 3, "status": "in_progress" }`

### POST /consultations/:id/photos — presigned upload
Req: `{ "contentType": "image/jpeg" }`
Res: `{ "uploadUrl": "https://…", "photoUrl": "https://…/user/xxx.jpg" }`

### POST /consultations/:id/complete — run engine + LLM
Res 200:
```json
{
  "consultation": { "id": "uuid", "status": "completed" },
  "recommendationId": "uuid",
  "skinProfileId": "uuid"
}
```

## Recommendations & Products

### GET /recommendations/:id
Res 200:
```json
{
  "id": "uuid", "priorities": ["barrier repair", "dark spots"],
  "summaryText": "…",
  "routine": [{ "step": "cleanser", "productId": "uuid", "instructions": "AM/PM, pea-size", "frequency": "daily" }],
  "lifestyleTips": ["SPF every morning"],
  "productFits": [{ "productId": "uuid", "name": "…", "why": "fragrance-free, niacinamide for tone" }]
}
```

### GET /products?concern=dark_spots&skinType=combination&preference=fragrance_free
Res: `{ "items": [{ "id": "uuid", "name": "…", "brand": "…", "priceTier": "mid", "concernsTargeted": ["dark_spots"] }] }`

### POST /products/:id/save — save to routine
Req: `{ "recommendationId": "uuid" }` → Res 201: `{ "saved": true }`

## Custom Formulas

### POST /consultations/:id/formula-draft
Res 201: `{ "id": "uuid", "baseType": "serum", "keyActives": [{ "inci": "Niacinamide", "pct": 5, "purpose": "tone" }], "status": "draft" }`

### PATCH /formulas/:id — adjust
Req: `{ "texture": "light gel", "scent": "fragrance_free", "intensity": "gentle" }`
Res 200: `{ "id": "uuid", "status": "draft", "conceptText": "…" }`

### POST /formulas/:id/order (MVP: manual fulfillment flag)
Res 200: `{ "id": "uuid", "status": "ordered", "orderedAt": "2026-…" }`

## Check-ins & Journal

### POST /consultations/:id/checkins — schedule
Req: `{ "dueInDays": 21 }` → Res 201: `{ "id": "uuid", "dueAt": "…" }`

### PATCH /checkins/:id — complete
Req: `{ "progressRating": 4, "concernRatings": { "dark_spots": 3 }, "keepChange": "less oily at noon" }`
Res 200: `{ "id": "uuid", "completedAt": "…", "refinedRecommendationId": "uuid?" }`

### GET /checkins?due=upcoming
### POST /journal — `{ "date": "2026-09-20", "skinFeel": 4, "notes": "…", "productIds": [] }`
### GET /journal?from=2026-09-01

## Feedback

### POST /recommendations/:id/clarity — `{ "clarityScore": 5, "confidenceScore": 4 }`
### POST /nps — `{ "score": 9, "comment": "…" }`

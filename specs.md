# CloseTheLook — Product & Technical Spec

> Live-commerce web app: watch a livestream, detect the outfit, match it against the user's own closet, and shop only the missing pieces.

---

## 1. One-Line Summary

While watching a fashion/idol livestream, the user taps "Recreate This Look." Gemini detects the outfit items and attributes from the video frame, the app matches them against the user's digital closet, shows a % match score, and lets the user shop only for the items they don't already own.

---

## 2. Core User Flow

1. **Watch** — User is on a live video page (Vonage-powered stream).
2. **Tap "Recreate This Look"** — Captures the current video frame.
3. **Detect** — Frame is sent to Gemini API, which returns a structured JSON list of clothing items + attributes.
4. **Match** — App compares each detected item against the user's closet items (text + image embeddings) and returns a similarity score per item.
5. **Result Screen** — Shows overall look match %, per-item match %, and flags any missing items.
6. **Shop the Gap** — For missing/low-match items, show 3–5 similar shoppable products with price + similarity %.
7. **(Optional wow feature)** — Side-by-side visual: "Idol Look → Your Closet → Your Final Look."

---

## 3. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), Tailwind CSS |
| Live video | Vonage Video API (session, publisher, subscriber) |
| Outfit detection | Google Gemini API (multimodal, `gemini-2.5-flash` or `gemini-2.5-pro` vision) |
| Backend | Node.js + Express (or serverless functions) |
| Closet storage | JSON/SQLite for hackathon speed (Postgres if time allows) |
| Image embeddings for matching | Gemini `embedding-001` or CLIP-style similarity (fallback: attribute-based scoring if embeddings are out of scope for time) |
| Shopping data | Mocked product JSON dataset (no need for real retailer API at hackathon scale) |
| Hosting | Vercel/Netlify (frontend) + Render/Fly.io (backend) |

---

## 4. Architecture Overview

```
┌─────────────┐      captures frame       ┌──────────────┐
│  Vonage      │ ─────────────────────────▶│  Frontend    │
│  Live Stream │                            │  (React)     │
└─────────────┘                            └──────┬───────┘
                                                   │ frame (base64)
                                                   ▼
                                          ┌──────────────────┐
                                          │  Backend API      │
                                          │  /api/detect-look │
                                          └────────┬──────────┘
                                                   │ image + prompt
                                                   ▼
                                          ┌──────────────────┐
                                          │  Gemini API        │
                                          │  (vision)          │
                                          └────────┬──────────┘
                                                   │ structured JSON
                                                   ▼
                                          ┌──────────────────┐
                                          │  Matching Engine   │
                                          │  vs. User Closet   │
                                          └────────┬──────────┘
                                                   │ match scores
                                                   ▼
                                          ┌──────────────────┐
                                          │  Shopping Lookup   │
                                          │  (missing items)   │
                                          └────────┬──────────┘
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  Result UI         │
                                          └──────────────────┘
```

---

## 5. Vonage Integration

**Goal:** Deliver the live video stream and expose a way to grab the current frame at the moment the user taps the button.

### Setup
- Create a Vonage Video API application (OpenTok-based).
- Generate: `applicationId`, `sessionId`, `token` (server-side, per user session).
- Use the Vonage Video Client SDK on the frontend to connect and subscribe to the stream.

### Frame Capture
- Vonage subscriber renders into a `<video>` element (or canvas via SDK).
- On button tap, draw the current video frame onto a hidden `<canvas>`:

```js
function captureFrame(videoEl) {
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  canvas.getContext('2d').drawImage(videoEl, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.9); // base64 image
}
```

### Demo Fallback (recommended for hackathon reliability)
- Also support a **pre-recorded video file** playing in a `<video>` tag styled to look like a live Vonage stream, with the same frame-capture logic. This de-risks live-stream flakiness during judging while keeping Vonage in the real flow for extra credit (e.g., a real 2-person live demo if time allows).

---

## 6. Gemini Integration

**Goal:** Given an image frame, return structured outfit data.

### Endpoint
`POST /api/detect-look`
- Input: `{ image: base64 }`
- Calls Gemini vision model with a structured-output prompt.

### Gemini Prompt (system/instruction)

```
You are a fashion analysis engine. Given an image of a person, identify each distinct clothing/accessory item they are wearing.

Return ONLY valid JSON in this exact schema, no markdown, no commentary:

{
  "items": [
    {
      "category": "jacket | top | bottom | shoes | accessory | dress | outerwear",
      "name": "short descriptive name",
      "color": "primary color",
      "secondary_colors": ["..."],
      "material": "e.g. leather, denim, cotton, knit",
      "pattern": "solid | striped | plaid | graphic | other",
      "silhouette": "e.g. cropped, oversized, fitted, wide-leg, slim",
      "style_tags": ["streetwear", "y2k", "minimalist", ...]
    }
  ]
}

If you cannot confidently detect an item, omit it. Do not hallucinate items not visible in the image.
```

### Example Gemini API Call (Node.js)

```js
const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: OUTFIT_DETECTION_PROMPT },
          { inline_data: { mime_type: "image/jpeg", data: base64Image } }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    })
  }
);
const data = await response.json();
const outfitJson = JSON.parse(data.candidates[0].content.parts[0].text);
```

### Notes
- Use `responseMimeType: "application/json"` to force clean JSON output — avoids markdown fences.
- Cache/log every raw Gemini response during dev for debugging.
- Keep image size reasonable (resize to ~768px longest side before sending) to reduce latency.

---

## 7. Closet Data Model

For the hackathon, seed a mock closet per demo user (no need for real upload flow, though a simple "add item" form is a nice-to-have).

```json
{
  "userId": "demo-user-1",
  "closet": [
    {
      "id": "c1",
      "category": "top",
      "name": "White fitted crop top",
      "color": "white",
      "material": "cotton",
      "silhouette": "fitted",
      "pattern": "solid",
      "image_url": "/closet/white_top.jpg"
    },
    {
      "id": "c2",
      "category": "bottom",
      "name": "Blue wide-leg jeans",
      "color": "blue",
      "material": "denim",
      "silhouette": "wide-leg",
      "pattern": "solid",
      "image_url": "/closet/blue_jeans.jpg"
    }
  ]
}
```

Seed 8–12 closet items covering tops, bottoms, jackets, shoes so the demo can hit a believable ~85–95% match with exactly one gap (the jacket) — **script your demo closet to guarantee this outcome.**

---

## 8. Matching Engine

**Goal:** For each detected outfit item, find the best-matching closet item and a similarity %.

### Approach (fastest to build, good enough for demo)
Weighted attribute-similarity scoring — no embeddings needed:

```js
function scoreMatch(detectedItem, closetItem) {
  let score = 0;
  const weights = { category: 0.3, color: 0.3, material: 0.2, silhouette: 0.1, pattern: 0.1 };

  if (detectedItem.category === closetItem.category) score += weights.category;
  if (colorsAreSimilar(detectedItem.color, closetItem.color)) score += weights.color;
  if (detectedItem.material === closetItem.material) score += weights.material;
  if (detectedItem.silhouette === closetItem.silhouette) score += weights.silhouette;
  if (detectedItem.pattern === closetItem.pattern) score += weights.pattern;

  return Math.round(score * 100); // percentage
}
```

- For each detected item, compute score against every closet item of the same category, take the max.
- If best score < threshold (e.g., 60%), mark item as **"missing"**.
- Overall look match % = average of all per-item best scores.

### Stretch upgrade (if time allows)
Replace rule-based `colorsAreSimilar` and category matching with real embeddings:
- Generate a text embedding per item (Gemini `embedding-001` on a concatenated description string) for both detected and closet items.
- Cosine similarity between vectors → match %.
- More robust, more "AI-native" story for judges, but higher implementation risk — build the rule-based version first, upgrade only if time remains.

---

## 9. Shopping Lookup (Missing Items)

For any item marked "missing," return 3–5 mock shoppable alternatives.

```json
{
  "category": "jacket",
  "results": [
    { "name": "Black Cropped Leather Jacket", "price": 32, "similarity": 93, "url": "#", "image_url": "/shop/jacket1.jpg" },
    { "name": "Black Faux Leather Moto Jacket", "price": 38, "similarity": 91, "url": "#", "image_url": "/shop/jacket2.jpg" },
    { "name": "Cropped Black Biker Jacket", "price": 44, "similarity": 88, "url": "#", "image_url": "/shop/jacket3.jpg" },
    { "name": "Vegan Leather Crop Jacket", "price": 49, "similarity": 86, "url": "#", "image_url": "/shop/jacket4.jpg" }
  ]
}
```

- Hardcode a small `products.json` dataset keyed by category/color/material combos — no real API needed.
- Sort by similarity descending.
- "SHOP" button can just be a styled link (doesn't need real checkout).

---

## 10. Screens / UI Components

1. **Live Stream Screen**
   - Video player (Vonage or fallback video file)
   - "🔴 LIVE — Idol Performance" badge
   - Floating button: "✨ Recreate This Look"

2. **Analyzing State**
   - Loading animation over captured frame: "Analyzing the look..."

3. **Outfit Detected Screen**
   - List of detected items with icons (🧥👕👖👟) + attributes

4. **Closet Match Screen**
   - Per-item match bars/percentages
   - Big headline: "YOUR LOOK: 92% MATCH"

5. **Missing Item Screen**
   - "You're missing 1 piece"
   - Product cards: image, price, similarity %, SHOP button

6. **(Stretch) Side-by-Side Recap**
   - 3-column visual: Idol Look photo | Your Closet items | Final Look composite

---

## 11. API Endpoints Summary

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/vonage/session` | Create/return Vonage session + token |
| POST | `/api/detect-look` | Send frame to Gemini, return outfit JSON |
| POST | `/api/match-closet` | Compare outfit JSON vs. user's closet, return scores |
| GET | `/api/closet/:userId` | Fetch user's closet items |
| POST | `/api/shop-alternatives` | Get shoppable matches for a missing category |

---

## 12. Environment Variables

```
GEMINI_API_KEY=
VONAGE_APPLICATION_ID=
VONAGE_PRIVATE_KEY=
```

---

## 13. Build Priority (Hackathon Order of Operations)

1. Mock closet data + matching engine (rule-based) — **works with zero external APIs, build first**
2. Gemini outfit detection on a static test image — validate JSON schema output
3. Result UI (outfit detected → closet match → missing item → shop) using mock/static data end-to-end
4. Wire Gemini output into the matching engine (replace static test data)
5. Vonage live video integration (or fallback pre-recorded video)
6. Connect "Recreate This Look" button → frame capture → full pipeline
7. Polish: animations, % match bar transitions, side-by-side recap screen
8. Rehearse demo with a scripted closet that guarantees a clean "92% match, 1 missing item" moment

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Live Vonage stream unreliable during judging | Use a pre-recorded video styled as "live" as primary demo path |
| Gemini returns inconsistent JSON | Force `responseMimeType: application/json`, add a JSON-repair fallback parser |
| Matching feels random/unconvincing | Script the demo closet so real Gemini output reliably produces a clean, impressive match % |
| Time runs out before shopping feature | Hardcode `products.json`; this is the easiest part to fake convincingly |
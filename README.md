# CloseTheLook 👗✨

> Watch a livestream, tap **"Recreate This Look,"** and instantly see how much of that outfit you already own — then shop only what's missing.

Built for a hackathon. While watching a fashion/idol livestream, the viewer captures the current video frame, Gemini's vision model detects the outfit items and attributes, the app matches them against the user's digital closet with a % score, and surfaces shoppable alternatives for anything missing.

---

## ✨ Core Flow

1. **Watch** — a live video page (Vonage-powered stream, or a pre-recorded fallback video styled as "live").
2. **Tap "Recreate This Look"** — captures the current video frame as a base64 JPEG.
3. **Detect** — the frame is sent to Gemini, which returns structured JSON: each clothing item's category, color, material, pattern, silhouette, and style tags.
4. **Match** — each detected item is scored against the user's closet using weighted attribute similarity (category, color, material, silhouette, pattern).
5. **Result** — an overall look-match %, per-item scores, and any missing items are flagged.
6. **Shop the Gap** — missing/low-match items get 3–5 mock shoppable alternatives with price + similarity %.

---

## 🏗️ Architecture

```
Vonage Live Stream ──▶ Frontend (React) ──▶ POST /api/detect-look ──▶ Gemini Vision API
                                                     │
                                                     ▼
                                          Matching Engine vs. Closet
                                                     │
                                                     ▼
                                     Shopping Lookup (missing items)
                                                     │
                                                     ▼
                                              Result UI
```

See [specs.md](specs.md) for the full product & technical spec this build follows.

---

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 (Vite), Tailwind CSS |
| Live video | Vonage Video API (session, publisher, subscriber) |
| Outfit detection | Google Gemini API (vision) |
| Backend | Node.js + Express |
| Closet / product data | Local JSON (`server/data/`) |
| Matching | Rule-based weighted attribute scoring |

---

## 📁 Project Structure

```
client/               React + Vite frontend
  src/components/      Pipeline screens (LiveStream, Analyzing, OutfitDetected,
                        ClosetMatch, MissingItem, ShopModal, Broadcaster/Viewer views)
  src/hooks/            usePipeline — orchestrates the capture → detect → match flow
  src/utils/            captureFrame — grabs a frame from the <video> element
server/               Node/Express backend
  routes/               /api/health, /api/detect-look, /api/match-closet,
                        /api/shop-alternatives, /api/vonage/session
  services/             geminiService, matchEngine, vonageService, imageUtils
  data/                 closet.json, products.json (mock datasets)
vonage/               Vonage Video API private key (not committed — see below)
specs.md              Full product & technical specification
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Google Gemini API key](https://ai.google.dev/)
- A [Vonage Video API](https://www.vonage.com/communications-apis/video/) application (application ID + private key) — optional if you only want the fallback pre-recorded video demo path

### 1. Backend

```bash
cd server
cp .env.example .env   # fill in the values below
npm install
npm run dev             # nodemon, http://localhost:4000
```

`.env` variables:

```
GEMINI_API_KEY=
VONAGE_API_KEY=
VONAGE_API_SECRET=
VONAGE_APPLICATION_ID=
VONAGE_PRIVATE_KEY_PATH=../vonage/private.key
PORT=4000
```

Place your Vonage private key at `vonage/private.key` (path is configurable via `VONAGE_PRIVATE_KEY_PATH`).

### 2. Frontend

```bash
cd client
npm install
npm run dev              # https://localhost:5173
```

> The dev server runs over **HTTPS with a self-signed cert** (`@vitejs/plugin-basic-ssl`) and binds to the LAN (`host: true`), so the broadcaster/viewer views can be opened from a second device — Chrome refuses camera access (`getUserMedia`) on any origin that isn't `localhost` or HTTPS.

### 3. Useful backend scripts

```bash
npm run test:detect   # sanity-check Gemini outfit detection against a static image
npm run test:match    # sanity-check the matching engine against mock closet data
```

---

## 🔌 API Endpoints

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Health/env-check endpoint |
| POST | `/api/vonage/session` | Create/return a Vonage session + token |
| POST | `/api/detect-look` | Send a frame to Gemini, return structured outfit JSON |
| POST | `/api/match-closet` | Compare outfit JSON against the user's closet, return scores |
| POST | `/api/shop-alternatives` | Get shoppable matches for a missing category |

---

## 🧮 Matching Engine

Weighted attribute-similarity scoring (no embeddings required):

| Attribute | Weight |
|---|---|
| Category | 0.3 |
| Color | 0.3 |
| Material | 0.2 |
| Silhouette | 0.1 |
| Pattern | 0.1 |

- Colors are grouped into similarity buckets (e.g. `black`/`charcoal`/`onyx`) so near-matches still score.
- `jacket` and `outerwear` are treated as the same category, since Gemini's schema lists both.
- For each detected item, the engine scores it against every closet item of the same category and takes the best match; scores below the threshold (60%) are flagged **missing**.
- Overall look match % is the average of all per-item best scores.

---

## 🎥 Demo Notes

- The live video screen supports both a real Vonage stream and a pre-recorded video fallback, so the demo isn't dependent on live-stream reliability during judging.
- The seeded closet (`server/data/closet.json`) is scripted to produce a clean, high match % with exactly one convincing gap, so the "shop the missing item" moment lands reliably in a live demo.

---

## 🗺️ Roadmap / Stretch Ideas

- Replace rule-based attribute matching with Gemini text embeddings + cosine similarity for more robust scoring.
- Real closet upload flow (currently seeded/mocked).
- Side-by-side recap: Idol Look → Your Closet → Final Look composite.
- Real retailer integration for shopping alternatives (currently a mocked `products.json`).

---

## 📄 License

Hackathon project — no license specified.

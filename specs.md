# Idol-to-Wardrobe — Submission Package
**Runway to Reality: AI Fashion Hackathon — GDG Brooklyn x Vonage — Sept 12, 2026**

---

## 1. Problem Statement

**Consumer problem (the hook):**
You see your favorite idol/celebrity in an outfit and want to recreate the
look — but you have no idea whether you already own something close, so you
either buy pieces you didn't need or give up on the look entirely.

**Why it matters beyond one person's closet (the evidence, for judges):**
- Online apparel return rates run **23–25%** in the US, with **~70% of
  those returns caused by fit/style mismatch** (Coresight Research 2025).
- **58% of shoppers "bracket"** — buying multiple items/sizes intending to
  return most of them (Narvar) — a habit driven by exactly this kind of
  uncertainty: *"will this actually work for me?"*
- Every one of those unnecessary purchases is a purchase that a
  closet-first tool could have prevented by surfacing what the person
  **already owns** before they ever add something to cart.

**One-line pitch for judges:**
> "Before you buy anything to copy a look, we show you how close you
> already are — using clothes you already own."

---

## 2. Official Challenge Requirements (confirmed from organizer brief)

- **Both layers are mandatory and must work together:**
  - **Gemini** = the AI brain (image understanding, style analysis, generation)
  - **Vonage Video API** = the communication layer (live video makes the AI
    experience real and shareable)
- Team of 2–4, no coding experience required, mentors on-site all day
- Schedule: doors 9:45am → build time starts ~12:00pm → **submissions close
  2:00pm** → judging 2:00–2:45pm → prizes 2:50pm
- Example directions given (not required categories, just inspiration):
  virtual try-on rooms, AI personal stylists, live shopping streams, outfit
  rating bots, Fashion Week lookbook senders — Idol-to-Wardrobe is closest
  to "AI personal stylist" + "outfit rating bot"

---

## 3. Submission Checklist (standard Devpost fields — confirm exact form on-site)

- [ ] **Project title** — "Idol-to-Wardrobe" (or your chosen name)
- [ ] **Tagline** (one sentence — use the pitch line above)
- [ ] **Description** — problem, what it does, how you built it (see Section 1 + 5)
- [ ] **"Built With" tags** — `gemini-api`, `vonage-video-api`, `nodejs`,
      plus your frontend framework
- [ ] **Screenshots or a short GIF** of the scorecard result — take these
      *during* your test runs, not last-minute
- [ ] **Demo video** (2–3 min) — record a clean run-through as a backup
      even if you're also demoing live; live demos fail, videos don't
- [ ] **Public GitHub repo link** — make sure it's public before 2:00pm
- [ ] **Live/hosted link**, if you deploy one (optional but nice to have)
- [ ] **Team member names**

---

## 4. MVP Scope — Tight Demo Slice

**What we're cutting and why:** live closet-scanning-by-video is a great
idea but too much surface area to build *and* rehearse in ~2 hours. Instead:

- **Wardrobe is pre-seeded**, not scanned live. Before the event (or in
  the first 15 minutes), photograph 5–6 real clothing items and run them
  through Gemini once to get structured attributes. This removes the
  riskiest, most fumble-prone part of a live demo (holding up 6 items to a
  camera one at a time while judges wait).
- **Video stays load-bearing** at the two most demo-worthy moments instead:
  1. The **idol photo enters the app live, on camera**, in the Vonage
     room — a teammate holds up a phone with the idol's photo, or the photo
     is shared into frame, and the app captures it straight off the live
     video feed. (Not a plain file-upload input — that would drop Vonage
     out of the loop entirely.)
  2. The **verdict is delivered back into the room live** — read aloud
     (browser text-to-speech is enough for a 2-hour build; Vonage's Audio
     Connector is the "if we have time" upgrade) and shown as a live
     scorecard overlay.
- **Shopping links are descriptive, not fabricated.** Gemini will happily
  invent plausible-looking URLs that don't resolve — bad live, worse in a
  demo video a judge might click. Default to "search for: navy cropped
  blazer, structured shoulder, wool-blend" rather than a fake clickable
  link, unless you have time to wire up Gemini's Google Search grounding
  tool for real results.

---

## 5. Flow (what actually happens, step by step)

```
BEFORE THE DEMO (prep, ~15 min)
  Photograph 5-6 real wardrobe items
       ↓
  Gemini analyzes each → structured attributes
  { category, dominant_color, pattern, material_guess, silhouette }
       ↓
  Stored as the "digital wardrobe" (a simple JSON list is enough)

LIVE DEMO
  Join Vonage video room
       ↓
  Hold the idol outfit photo up to the camera
       ↓
  Capture a frame from the live video feed
       ↓
  Gemini analyzes the frame → same attribute schema as the wardrobe
       ↓
  Score idol outfit against every pre-seeded wardrobe item on:
    color · pattern · material/texture · silhouette/shape ·
    category · overall visual similarity
       ↓
  Rank and display Top 3-4 matches with per-dimension scores
       ↓
  Speak the top verdict aloud into the video room
       ↓
  For any clearly missing category (e.g. no blazer in wardrobe),
  show a plain-language "search for this" suggestion
```

---

## 6. Scoring Approach (make this concrete, not hand-wavy)

Ask Gemini for **structured JSON output** per comparison, not free text —
this is the single best "technical depth" thing you can point to when
judges ask how matching works:

```json
{
  "color_score": 82,
  "pattern_score": 40,
  "material_score": 65,
  "silhouette_score": 90,
  "category_score": 100,
  "overall_score": 78,
  "one_line_reason": "Same cropped, structured silhouette and neutral tone; pattern differs."
}
```

Compute a weighted overall score client-side (e.g. silhouette + category
weighted higher than pattern) so you control the ranking logic yourself
rather than trusting Gemini's own "overall_score" blindly — this also gives
you something concrete to explain in Q&A.

---

## 7. Why this framing should score well

- **Technical execution:** both required APIs are structurally necessary,
  not decorative — remove either one and the demo breaks.
- **Real-world usefulness:** tied to a quantifiable, named industry problem
  (return rates, bracketing), not just "wouldn't this be fun."
- **Differentiation:** most "AI stylist" submissions will be generic
  outfit-rating bots; the idol-specific hook plus a real numeric,
  multi-dimension scorecard is a sharper, more memorable demo beat.
- **Live-demo safety:** pre-seeded wardrobe removes the biggest live-fail
  risk (fumbling a multi-item camera scan on stage) while keeping video
  central at the two moments that actually matter for the story.

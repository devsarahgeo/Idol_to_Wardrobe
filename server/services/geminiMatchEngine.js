import { env } from '../config/env.js'
import { MATCH_THRESHOLD } from './matchEngine.js'

const GEMINI_MODEL = 'gemini-3.6-flash'

function buildPrompt(detectedItems, closetItems) {
  return `You are a fashion-matching engine. You are given DETECTED_ITEMS (clothing items spotted in a photo/video of a look someone wants to recreate) and a user's CLOSET (items they already own).

For each item in DETECTED_ITEMS, in the same order, find the single best-matching item in CLOSET — considering category, color, material, pattern, and silhouette, using your visual/fashion judgment rather than requiring exact text matches. For example: "jacket" and "outerwear" are the same type of garment; "navy" and "dark blue" are the same color; "denim" and "jean fabric" are the same material; "sneakers" and "trainers" are the same shoe type.

Return ONLY valid JSON in this exact schema, no markdown, no commentary:

{
  "matches": [
    {
      "detectedIndex": 0,
      "closetItemId": "c11",
      "score": 87,
      "reasoning": "one short sentence"
    }
  ]
}

Rules:
- Return exactly one entry per item in DETECTED_ITEMS, in the same order, using its 0-based index as "detectedIndex".
- "closetItemId" must be the "id" field of the single best-matching CLOSET item, or null if nothing in the closet is a reasonable match for that item's category.
- "score" is an integer 0-100: how visually/stylistically close that closet item is to the detected item. 100 = essentially identical, 0 = nothing close exists. Use closetItemId: null only together with score: 0.
- Never invent a closetItemId that isn't listed in CLOSET.

DETECTED_ITEMS:
${JSON.stringify(detectedItems, null, 2)}

CLOSET:
${JSON.stringify(closetItems, null, 2)}`
}

function extractJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse Gemini match response as JSON')
  }
}

export async function matchOutfitWithGemini(detectedItems, closetItems, threshold = MATCH_THRESHOLD) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in server/.env')
  }

  const prompt = buildPrompt(detectedItems, closetItems)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  )

  const raw = await response.json()
  if (!response.ok) {
    throw new Error(raw?.error?.message || `Gemini match API error (status ${response.status})`)
  }

  const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini match response did not contain any text content')

  const parsed = extractJson(text)
  if (!parsed || !Array.isArray(parsed.matches)) {
    throw new Error('Gemini match response did not match the expected { matches: [...] } schema')
  }

  const closetById = new Map(closetItems.map((item) => [item.id, item]))

  const items = detectedItems.map((detected, index) => {
    const match = parsed.matches.find((m) => m.detectedIndex === index) || {}
    const closetMatch = match.closetItemId ? closetById.get(match.closetItemId) || null : null
    const score = Number.isFinite(match.score) ? Math.max(0, Math.min(100, Math.round(match.score))) : 0

    return {
      detected,
      closetMatch,
      score,
      missing: score < threshold,
      reasoning: match.reasoning || null,
    }
  })

  const overallMatch = items.length
    ? Math.round(items.reduce((sum, item) => sum + item.score, 0) / items.length)
    : 0

  return {
    overallMatch,
    items,
    missingCount: items.filter((item) => item.missing).length,
  }
}

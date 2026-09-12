import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { env } from '../config/env.js'
import { resizeBase64Image } from './imageUtils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logsDir = path.resolve(__dirname, '../logs/gemini')

const GEMINI_MODEL = 'gemini-3.6-flash'

// Exact prompt from specs.md section 6 — do not reword, Gemini's JSON
// reliability is sensitive to this phrasing.
export const OUTFIT_DETECTION_PROMPT = `You are a fashion analysis engine. Given an image of a person, identify each distinct clothing/accessory item they are wearing.

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

If you cannot confidently detect an item, omit it. Do not hallucinate items not visible in the image.`

function logRawResponse(raw) {
  try {
    fs.mkdirSync(logsDir, { recursive: true })
    const filePath = path.join(logsDir, `${Date.now()}.json`)
    fs.writeFileSync(filePath, JSON.stringify(raw, null, 2))
  } catch (err) {
    console.warn('Failed to log Gemini raw response:', err.message)
  }
}

function extractJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    // Fallback repair: pull the first {...} block out of stray markdown/commentary.
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
    throw new Error('Could not parse Gemini response as JSON')
  }
}

export async function detectOutfit(base64Image) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in server/.env')
  }

  const { mimeType, data } = await resizeBase64Image(base64Image)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: OUTFIT_DETECTION_PROMPT },
              { inline_data: { mime_type: mimeType, data } },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  )

  const raw = await response.json()
  logRawResponse(raw)

  if (!response.ok) {
    const message = raw?.error?.message || `Gemini API error (status ${response.status})`
    throw new Error(message)
  }

  const text = raw?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Gemini response did not contain any text content')
  }

  const outfitJson = extractJson(text)
  if (!outfitJson || !Array.isArray(outfitJson.items)) {
    throw new Error('Gemini response did not match the expected { items: [...] } schema')
  }

  return outfitJson
}

import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { matchOutfitToCloset } from '../services/matchEngine.js'
import { matchOutfitWithGemini } from '../services/geminiMatchEngine.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const closetPath = path.resolve(__dirname, '../data/closet.json')

function loadCloset() {
  const raw = fs.readFileSync(closetPath, 'utf-8')
  return JSON.parse(raw)
}

const router = Router()

router.post('/', async (req, res) => {
  const { items } = req.body || {}

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Request body must include an "items" array.' })
  }

  const closetData = loadCloset()

  let result
  let usedFallback = false
  try {
    result = await matchOutfitWithGemini(items, closetData.closet)
  } catch (err) {
    console.error('Gemini matching failed, falling back to rule-based matching:', err.message)
    result = matchOutfitToCloset(items, closetData.closet)
    usedFallback = true
  }

  res.json({
    userId: closetData.userId,
    matchedBy: usedFallback ? 'rule-based-fallback' : 'gemini',
    ...result,
  })
})

export default router

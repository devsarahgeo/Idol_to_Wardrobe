import { Router } from 'express'
import { detectOutfit } from '../services/geminiService.js'

const router = Router()

router.post('/', async (req, res) => {
  const { image } = req.body || {}

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Request body must include a base64 "image" string.' })
  }

  try {
    const outfitJson = await detectOutfit(image)
    res.json(outfitJson)
  } catch (err) {
    console.error('detect-look failed:', err.message)
    res.status(502).json({ error: err.message })
  }
})

export default router

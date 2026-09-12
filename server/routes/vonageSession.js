import { Router } from 'express'
import { createSessionAndToken } from '../services/vonageService.js'

const router = Router()

router.post('/', async (req, res) => {
  const { role } = req.body || {}

  if (role !== 'broadcaster' && role !== 'viewer') {
    return res.status(400).json({ error: 'Request body must include role: "broadcaster" or "viewer".' })
  }

  try {
    const session = await createSessionAndToken(role)
    res.json(session)
  } catch (err) {
    console.error('vonage/session failed:', err.message)
    res.status(502).json({ error: err.message })
  }
})

export default router

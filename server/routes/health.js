import { Router } from 'express'
import { checkEnv } from '../config/env.js'

const router = Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    env: checkEnv(),
  })
})

export default router

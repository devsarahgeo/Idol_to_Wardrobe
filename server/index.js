import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import healthRouter from './routes/health.js'
import matchClosetRouter from './routes/matchCloset.js'
import detectLookRouter from './routes/detectLook.js'
import shopAlternativesRouter from './routes/shopAlternatives.js'
import vonageSessionRouter from './routes/vonageSession.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/health', healthRouter)
app.use('/api/match-closet', matchClosetRouter)
app.use('/api/detect-look', detectLookRouter)
app.use('/api/shop-alternatives', shopAlternativesRouter)
app.use('/api/vonage/session', vonageSessionRouter)

app.listen(env.PORT, () => {
  console.log(`CloseTheLook server listening on http://localhost:${env.PORT}`)
})

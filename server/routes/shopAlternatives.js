import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { colorsAreSimilar } from '../services/matchEngine.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const productsPath = path.resolve(__dirname, '../data/products.json')

function loadProducts() {
  const raw = fs.readFileSync(productsPath, 'utf-8')
  return JSON.parse(raw)
}

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value
}

const router = Router()

router.post('/', (req, res) => {
  const { category, color, material } = req.body || {}

  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Request body must include a "category" string.' })
  }

  const products = loadProducts()
  const candidates = products.filter((group) => normalize(group.category) === normalize(category))

  if (candidates.length === 0) {
    return res.json({ category, results: [] })
  }

  let bestGroup = candidates[0]
  if (candidates.length > 1) {
    bestGroup =
      candidates.find((group) => color && colorsAreSimilar(group.color, color)) ||
      candidates.find((group) => material && normalize(group.material) === normalize(material)) ||
      candidates[0]
  }

  const results = [...bestGroup.results].sort((a, b) => b.similarity - a.similarity).slice(0, 5)

  res.json({ category, results })
})

export default router

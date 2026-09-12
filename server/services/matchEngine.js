const MATCH_THRESHOLD = 60

const WEIGHTS = {
  category: 0.3,
  color: 0.3,
  material: 0.2,
  silhouette: 0.1,
  pattern: 0.1,
}

const COLOR_GROUPS = [
  ['black', 'charcoal', 'jet black', 'onyx'],
  ['white', 'ivory', 'cream', 'off-white', 'off white'],
  ['blue', 'navy', 'denim blue', 'light blue', 'baby blue'],
  ['beige', 'tan', 'khaki', 'sand', 'camel'],
  ['red', 'maroon', 'burgundy', 'wine'],
  ['pink', 'hot pink', 'blush', 'magenta'],
  ['silver', 'gray', 'grey'],
  ['gold', 'yellow', 'mustard'],
  ['brown', 'chocolate', 'coffee'],
  ['green', 'olive', 'khaki green'],
]

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value
}

// Gemini's own schema (specs.md section 6) lists "jacket" and "outerwear" as
// separate valid category values for the same real-world garment type.
// Treat them as the same category when matching against the closet.
const CATEGORY_ALIASES = {
  jacket: 'outerwear',
}

function canonicalCategory(category) {
  const normalized = normalize(category)
  return CATEGORY_ALIASES[normalized] || normalized
}

export function colorsAreSimilar(colorA, colorB) {
  const a = normalize(colorA)
  const b = normalize(colorB)
  if (!a || !b) return false
  if (a === b) return true
  return COLOR_GROUPS.some((group) => group.includes(a) && group.includes(b))
}

export function scoreMatch(detectedItem, closetItem) {
  let score = 0

  if (canonicalCategory(detectedItem.category) === canonicalCategory(closetItem.category)) {
    score += WEIGHTS.category
  }
  if (colorsAreSimilar(detectedItem.color, closetItem.color)) {
    score += WEIGHTS.color
  }
  if (normalize(detectedItem.material) === normalize(closetItem.material)) {
    score += WEIGHTS.material
  }
  if (normalize(detectedItem.silhouette) === normalize(closetItem.silhouette)) {
    score += WEIGHTS.silhouette
  }
  if (normalize(detectedItem.pattern) === normalize(closetItem.pattern)) {
    score += WEIGHTS.pattern
  }

  return Math.round(score * 100)
}

export function findBestMatch(detectedItem, closetItems) {
  const sameCategory = closetItems.filter(
    (closetItem) => canonicalCategory(closetItem.category) === canonicalCategory(detectedItem.category)
  )

  let best = null
  let bestScore = 0

  for (const closetItem of sameCategory) {
    const score = scoreMatch(detectedItem, closetItem)
    if (score > bestScore) {
      bestScore = score
      best = closetItem
    }
  }

  return { bestMatch: best, score: bestScore }
}

export function matchOutfitToCloset(detectedItems, closetItems, threshold = MATCH_THRESHOLD) {
  const items = detectedItems.map((detectedItem) => {
    const { bestMatch, score } = findBestMatch(detectedItem, closetItems)
    return {
      detected: detectedItem,
      closetMatch: bestMatch,
      score,
      missing: score < threshold,
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

export { MATCH_THRESHOLD }

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { matchOutfitToCloset } from '../services/matchEngine.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const closetPath = path.resolve(__dirname, '../data/closet.json')
const closetData = JSON.parse(fs.readFileSync(closetPath, 'utf-8'))

// Sample "detected outfit" — mimics what Gemini would return for a look that's
// a near-perfect match to the demo closet except for the jacket.
const sampleDetectedOutfit = [
  {
    category: 'top',
    name: 'Navy camp-collar shirt',
    color: 'navy',
    material: 'cotton',
    silhouette: 'boxy',
    pattern: 'solid',
  },
  {
    category: 'bottom',
    name: 'Blue slim jeans',
    color: 'blue',
    material: 'denim',
    silhouette: 'slim',
    pattern: 'solid',
  },
  {
    category: 'shoes',
    name: 'White and green leather sneakers',
    color: 'white',
    material: 'leather',
    silhouette: 'low-top',
    pattern: 'solid',
  },
  {
    category: 'accessory',
    name: 'Black leather buckle belt',
    color: 'black',
    material: 'leather',
    silhouette: 'thin',
    pattern: 'solid',
  },
  {
    category: 'outerwear',
    name: 'Black cropped leather jacket',
    color: 'black',
    material: 'leather',
    silhouette: 'cropped',
    pattern: 'solid',
  },
]

function printResult(label, detectedItems) {
  const result = matchOutfitToCloset(detectedItems, closetData.closet)

  console.log(`\n=== ${label} ===`)
  console.log(`Overall match: ${result.overallMatch}%  |  Missing items: ${result.missingCount}`)

  for (const item of result.items) {
    const flag = item.missing ? '❌ MISSING' : '✅ MATCHED'
    const closetName = item.closetMatch ? item.closetMatch.name : '(none)'
    console.log(
      `  ${flag}  ${item.score}%  "${item.detected.name}"  →  closet: ${closetName}`
    )
  }

  return result
}

const result = printResult('Scripted demo outfit (expect ~85-95% match, jacket missing)', sampleDetectedOutfit)

const expectedMissingCategory = 'outerwear'
const gotOneGap = result.missingCount === 1 && result.items.find((i) => i.missing)?.detected.category === expectedMissingCategory
const inDemoRange = result.overallMatch >= 80 && result.overallMatch <= 95

console.log('\n--- Sanity checks ---')
console.log(`Exactly one gap in "${expectedMissingCategory}": ${gotOneGap ? 'PASS' : 'FAIL'}`)
console.log(`Overall match in 80-95% demo range: ${inDemoRange ? 'PASS' : 'FAIL'} (got ${result.overallMatch}%)`)

// A second, unscripted example to show the engine generalizes beyond the demo case.
printResult('Random outfit (no scripting, sanity check only)', [
  { category: 'top', name: 'Red graphic hoodie', color: 'red', material: 'fleece', silhouette: 'oversized', pattern: 'graphic' },
  { category: 'bottom', name: 'Black skinny jeans', color: 'black', material: 'denim', silhouette: 'fitted', pattern: 'solid' },
  { category: 'shoes', name: 'Brown loafers', color: 'brown', material: 'leather', silhouette: 'pointed', pattern: 'solid' },
])

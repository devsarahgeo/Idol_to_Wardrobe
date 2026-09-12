import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { detectOutfit } from '../services/geminiService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultImagePath = path.resolve(__dirname, '../test-assets/test-image.jpg')
const imagePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultImagePath

if (!fs.existsSync(imagePath)) {
  console.error(`No test image found at: ${imagePath}`)
  console.error('Usage: node scripts/testDetect.js [path/to/image.jpg]')
  console.error('Or drop a file at server/test-assets/test-image.jpg and re-run with no args.')
  process.exit(1)
}

const imageBuffer = fs.readFileSync(imagePath)
const base64Image = imageBuffer.toString('base64')

console.log(`Sending ${imagePath} (${(imageBuffer.length / 1024).toFixed(1)} KB) to Gemini...`)

try {
  const start = Date.now()
  const result = await detectOutfit(base64Image)
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)

  console.log(`\nDetected ${result.items.length} item(s) in ${elapsed}s:\n`)
  for (const item of result.items) {
    console.log(`- [${item.category}] ${item.name}`)
    console.log(`    color: ${item.color}${item.secondary_colors?.length ? ` (+ ${item.secondary_colors.join(', ')})` : ''}`)
    console.log(`    material: ${item.material}  pattern: ${item.pattern}  silhouette: ${item.silhouette}`)
    if (item.style_tags?.length) console.log(`    style: ${item.style_tags.join(', ')}`)
  }

  console.log('\nFull JSON:')
  console.log(JSON.stringify(result, null, 2))
} catch (err) {
  console.error('\ndetect-look failed:', err.message)
  process.exit(1)
}

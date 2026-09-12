import sharp from 'sharp'

const MAX_DIMENSION = 768

export function parseBase64Image(input) {
  const match = /^data:(image\/\w+);base64,(.*)$/s.exec(input)
  if (match) {
    return { mimeType: match[1], data: match[2] }
  }
  return { mimeType: 'image/jpeg', data: input }
}

export async function resizeBase64Image(input) {
  const { data } = parseBase64Image(input)
  const buffer = Buffer.from(data, 'base64')

  const resized = await sharp(buffer)
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 90 })
    .toBuffer()

  return { mimeType: 'image/jpeg', data: resized.toString('base64') }
}

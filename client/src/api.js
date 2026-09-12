const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `Request to ${path} failed`)
  }
  return data
}

export const detectLook = (image) => postJson('/api/detect-look', { image })
export const matchCloset = (items) => postJson('/api/match-closet', { items })
export const shopAlternatives = (item) => postJson('/api/shop-alternatives', item)
export const getVonageSession = (role) => postJson('/api/vonage/session', { role })

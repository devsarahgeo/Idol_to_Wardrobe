import { Auth } from '@vonage/auth'
import { Video } from '@vonage/video'
import { env } from '../config/env.js'

let videoClient = null
function getVideoClient() {
  if (!videoClient) {
    if (!env.VONAGE_APPLICATION_ID || !env.VONAGE_PRIVATE_KEY_PATH) {
      throw new Error('VONAGE_APPLICATION_ID / VONAGE_PRIVATE_KEY_PATH are not set in server/.env')
    }
    const credentials = new Auth({
      applicationId: env.VONAGE_APPLICATION_ID,
      privateKey: env.VONAGE_PRIVATE_KEY_PATH,
    })
    videoClient = new Video(credentials, {})
  }
  return videoClient
}

// A single shared session for the whole demo — one broadcaster, one (or more)
// viewers all join the same room. Cached in memory; fine for a hackathon demo,
// resets whenever the server restarts.
let sharedSessionId = null

export async function getOrCreateSession() {
  if (sharedSessionId) return sharedSessionId

  const client = getVideoClient()
  const session = await client.createSession({ mediaMode: 'routed' })
  sharedSessionId = session.sessionId
  return sharedSessionId
}

const ROLE_MAP = {
  broadcaster: 'publisher',
  viewer: 'subscriber',
}

export async function createSessionAndToken(role) {
  const vonageRole = ROLE_MAP[role]
  if (!vonageRole) {
    throw new Error(`Unknown role "${role}" — expected "broadcaster" or "viewer"`)
  }

  const sessionId = await getOrCreateSession()
  const client = getVideoClient()
  const token = client.generateClientToken(sessionId, { role: vonageRole })

  return {
    applicationId: env.VONAGE_APPLICATION_ID,
    sessionId,
    token,
    role,
  }
}

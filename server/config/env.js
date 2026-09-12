import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(__dirname, '..')

const {
  GEMINI_API_KEY,
  VONAGE_API_KEY,
  VONAGE_API_SECRET,
  VONAGE_APPLICATION_ID,
  VONAGE_PRIVATE_KEY_PATH,
  PORT,
} = process.env

const resolvedPrivateKeyPath = VONAGE_PRIVATE_KEY_PATH
  ? path.resolve(serverRoot, VONAGE_PRIVATE_KEY_PATH)
  : null

export const env = {
  GEMINI_API_KEY: GEMINI_API_KEY || null,
  VONAGE_API_KEY: VONAGE_API_KEY || null,
  VONAGE_API_SECRET: VONAGE_API_SECRET || null,
  VONAGE_APPLICATION_ID: VONAGE_APPLICATION_ID || null,
  VONAGE_PRIVATE_KEY_PATH: resolvedPrivateKeyPath,
  PORT: PORT || 4000,
}

export function checkEnv() {
  const status = {
    GEMINI_API_KEY: Boolean(env.GEMINI_API_KEY),
    VONAGE_APPLICATION_ID: Boolean(env.VONAGE_APPLICATION_ID),
    VONAGE_PRIVATE_KEY_PATH: Boolean(
      env.VONAGE_PRIVATE_KEY_PATH && fs.existsSync(env.VONAGE_PRIVATE_KEY_PATH)
    ),
  }
  return status
}

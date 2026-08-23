import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ENV_PATH = path.join(__dirname, '.env')

const KEY_MAP = {
  openaiApiKey: 'OPENAI_API_KEY',
  tavilyApiKey: 'TAVILY_API_KEY',
  unsplashAccessKey: 'UNSPLASH_ACCESS_KEY',
} as const

export type SettingsField = keyof typeof KEY_MAP

export function maskSecret(value: string): { set: boolean; hint: string } {
  const trimmed = value.trim()
  if (!trimmed) return { set: false, hint: '' }
  if (trimmed.length <= 4) return { set: true, hint: '•'.repeat(trimmed.length) }
  return { set: true, hint: `…${trimmed.slice(-4)}` }
}

function parseEnvFile(raw: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const idx = trimmed.indexOf('=')
    map.set(trimmed.slice(0, idx).trim(), trimmed.slice(idx + 1).trim())
  }
  return map
}

function serializeEnvFile(map: Map<string, string>, original: string): string {
  const lines = original.split('\n')
  const seen = new Set<string>()
  const out: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      out.push(line)
      continue
    }
    const key = trimmed.slice(0, trimmed.indexOf('=')).trim()
    if (map.has(key)) {
      out.push(`${key}=${map.get(key)}`)
      seen.add(key)
    } else {
      out.push(line)
    }
  }

  for (const [key, value] of map.entries()) {
    if (!seen.has(key)) out.push(`${key}=${value}`)
  }

  return out.join('\n').replace(/\n?$/, '\n')
}

export function readSettingsPublic(env: NodeJS.ProcessEnv) {
  return {
    openaiApiKey: maskSecret(env.OPENAI_API_KEY || ''),
    tavilyApiKey: maskSecret(env.TAVILY_API_KEY || ''),
    unsplashAccessKey: maskSecret(env.UNSPLASH_ACCESS_KEY || ''),
  }
}

export function keysReady(env: NodeJS.ProcessEnv): boolean {
  return Boolean(env.OPENAI_API_KEY && env.TAVILY_API_KEY)
}

export function updateSettings(body: Record<string, unknown>, env: NodeJS.ProcessEnv): {
  settings: ReturnType<typeof readSettingsPublic>
  keysReady: boolean
} {
  const original = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf8') : ''
  const map = parseEnvFile(original)

  for (const [inputKey, envKey] of Object.entries(KEY_MAP)) {
    if (!(inputKey in body)) continue
    const value = String(body[inputKey] ?? '').trim()
    if (!value) continue
    map.set(envKey, value)
    env[envKey] = value
  }

  fs.writeFileSync(ENV_PATH, serializeEnvFile(map, original), 'utf8')

  return {
    settings: readSettingsPublic(env),
    keysReady: keysReady(env),
  }
}

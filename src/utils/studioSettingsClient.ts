import { studioAuthHeaders, StudioAuthError } from './studioAuth'

export interface SecretFieldState {
  set: boolean
  hint: string
}

export interface StudioSettingsState {
  ok: boolean
  keysReady: boolean
  settings: {
    openaiApiKey: SecretFieldState
    tavilyApiKey: SecretFieldState
    unsplashAccessKey: SecretFieldState
  }
}

export interface StudioSettingsInput {
  openaiApiKey?: string
  tavilyApiKey?: string
  unsplashAccessKey?: string
}

function apiBase(): string {
  const env = import.meta.env.VITE_STUDIO_API_URL?.replace(/\/$/, '')
  if (env) return env
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export async function fetchStudioSettings(): Promise<StudioSettingsState> {
  const base = apiBase()
  if (!base) throw new Error('Studio API not configured')

  const res = await fetch(`${base}/api/settings`, {
    headers: { ...studioAuthHeaders() },
  })
  const data = await res.json() as StudioSettingsState & { error?: string }
  if (!res.ok) {
    if (res.status === 401) throw new StudioAuthError(data.error || 'Login required to open Settings.', 401)
    throw new Error(data.error || 'Could not load settings')
  }
  return data
}

export async function saveStudioSettings(input: StudioSettingsInput): Promise<StudioSettingsState & { message?: string }> {
  const base = apiBase()
  if (!base) throw new Error('Studio API not configured')

  const res = await fetch(`${base}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...studioAuthHeaders() },
    body: JSON.stringify(input),
  })
  const data = await res.json() as StudioSettingsState & { error?: string; message?: string }
  if (!res.ok) {
    if (res.status === 401) throw new StudioAuthError(data.error || 'Login required to save Settings.', 401)
    throw new Error(data.error || 'Could not save settings')
  }
  return data
}

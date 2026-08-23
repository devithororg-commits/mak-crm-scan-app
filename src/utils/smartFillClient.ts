import type { CompanyDna, SmartFillResponse } from '../types/studio'
import { getRecentTemplates } from './themeEngine'
import { getStudioAuthToken, studioAuthHeaders } from './studioAuth'

export function getStudioApiUrl(): string {
  const env = import.meta.env.VITE_STUDIO_API_URL?.replace(/\/$/, '')
  if (env) return env
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export function isStudioApiConfigured(): boolean {
  return Boolean(getStudioApiUrl())
}

export async function requestSmartFill(params: {
  topic: string
  platform?: string
  language?: string
  companyDna: CompanyDna
}): Promise<SmartFillResponse> {
  const base = getStudioApiUrl()
  if (!base) {
    throw new Error('Studio API not configured')
  }
  if (!getStudioAuthToken()) {
    throw new Error('Login required. Verify company email OTP first.')
  }

  const res = await fetch(`${base}/api/smart-fill`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...studioAuthHeaders() },
    body: JSON.stringify({
      topic: params.topic,
      platform: params.platform || params.companyDna.defaultPlatform,
      language: params.language || params.companyDna.languages[0] || 'english',
      companyDna: params.companyDna,
      excludeTemplates: getRecentTemplates(),
    }),
  })

  const data = await res.json() as SmartFillResponse & { error?: string }
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export async function checkStudioHealth(): Promise<boolean> {
  if (!isStudioApiConfigured()) return false
  try {
    const res = await fetch(`${getStudioApiUrl()}/api/health`)
    if (!res.ok) return false
    const data = await res.json() as { ok?: boolean; service?: string }
    return Boolean(data.ok && data.service === 'creative-studio')
  } catch {
    return false
  }
}

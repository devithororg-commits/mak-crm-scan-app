const TOKEN_KEY = 'studio-auth-token'
const EMAIL_KEY = 'studio-auth-email'

function apiBase(): string {
  const env = import.meta.env.VITE_STUDIO_API_URL?.replace(/\/$/, '')
  if (env) return env
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export function getStudioAuthToken(): string {
  return sessionStorage.getItem(TOKEN_KEY) || ''
}

export function getStudioAuthEmail(): string {
  return sessionStorage.getItem(EMAIL_KEY) || ''
}

export function isStudioLoggedIn(): boolean {
  return Boolean(getStudioAuthToken())
}

export function saveStudioSession(token: string, email: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(EMAIL_KEY, email)
}

export function clearStudioSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(EMAIL_KEY)
}

export async function sendStudioOtp(email: string) {
  const base = apiBase()
  if (!base) throw new Error('Studio API not configured')

  const res = await fetch(`${base}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json() as { ok?: boolean; error?: string; message?: string; retryAfter?: number; mock?: boolean; debugOtp?: string }
  if (!res.ok) throw new Error(data.error || 'Could not send OTP')
  return data
}

export async function verifyStudioOtp(email: string, otp: string) {
  const base = apiBase()
  if (!base) throw new Error('Studio API not configured')

  const res = await fetch(`${base}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })
  const data = await res.json() as { ok?: boolean; error?: string; token?: string; email?: string }
  if (!res.ok || !data.token) throw new Error(data.error || 'Invalid OTP')
  saveStudioSession(data.token, data.email || email)
  return data
}

export async function logoutStudio() {
  const base = apiBase()
  const token = getStudioAuthToken()
  if (base && token) {
    await fetch(`${base}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
  }
  clearStudioSession()
}

export function studioAuthHeaders(): Record<string, string> {
  const token = getStudioAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

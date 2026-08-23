import crypto from 'node:crypto'
import nodemailer from 'nodemailer'

export interface AuthConfig {
  allowedEmails: string[]
  allowedDomain: string
  sessionSecret: string
  otpTtlMinutes: number
  resendCooldownSeconds: number
  mockOtp: boolean
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  smtpFrom: string
}

interface OtpRecord {
  otp: string
  expiresAt: number
  lastSentAt: number
}

interface SessionRecord {
  email: string
  expiresAt: number
}

const otpStore = new Map<string, OtpRecord>()
const sessionStore = new Map<string, SessionRecord>()

export function parseAuthConfig(env: NodeJS.ProcessEnv): AuthConfig {
  const allowedEmails = (env.ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  return {
    allowedEmails,
    allowedDomain: (env.ALLOWED_DOMAIN || '').trim().toLowerCase().replace(/^@/, ''),
    sessionSecret: env.SESSION_SECRET || 'change-me-in-production',
    otpTtlMinutes: Number(env.OTP_TTL_MINUTES || 10),
    resendCooldownSeconds: Number(env.OTP_RESEND_COOLDOWN || 60),
    mockOtp: env.MOCK_OTP === 'true',
    smtpHost: env.SMTP_HOST || '',
    smtpPort: Number(env.SMTP_PORT || 587),
    smtpUser: env.SMTP_USER || '',
    smtpPass: env.SMTP_PASS || '',
    smtpFrom: env.SMTP_FROM || env.SMTP_USER || '',
  }
}

export function isEmailAllowed(email: string, config: AuthConfig): boolean {
  const normalized = email.trim().toLowerCase()
  if (config.allowedEmails.includes(normalized)) return true
  if (config.allowedDomain) {
    const domain = normalized.split('@')[1] ?? ''
    const allowedDomains = config.allowedDomain
      .split(',')
      .map((d) => d.trim().replace(/^@/, ''))
      .filter(Boolean)
    return allowedDomains.includes(domain)
  }
  return false
}

function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999))
}

function hashToken(email: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(email).digest('hex').slice(0, 32)
}

async function sendOtpEmail(email: string, otp: string, config: AuthConfig) {
  if (config.mockOtp) return

  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    throw new Error('SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in server/.env (or use MOCK_OTP=true for testing).')
  }

  const transport = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: { user: config.smtpUser, pass: config.smtpPass },
  })

  await transport.sendMail({
    from: config.smtpFrom,
    to: email,
    subject: 'Creative Studio — Login OTP',
    text: `Your login code is ${otp}. Valid for ${config.otpTtlMinutes} minutes.\n\nIf you did not request this, ignore this email.`,
    html: `<p>Your login code is <strong>${otp}</strong>.</p><p>Valid for ${config.otpTtlMinutes} minutes.</p>`,
  })
}

export async function sendLoginOtp(email: string, config: AuthConfig) {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Enter a valid company email')
  }
  if (!isEmailAllowed(normalized, config)) {
    throw new Error('This email is not authorized. Use your company email.')
  }

  const now = Date.now()
  const existing = otpStore.get(normalized)
  if (existing && now - existing.lastSentAt < config.resendCooldownSeconds * 1000) {
    const retryAfter = Math.ceil((config.resendCooldownSeconds * 1000 - (now - existing.lastSentAt)) / 1000)
    const err = new Error(`Please wait ${retryAfter}s before requesting another OTP.`) as Error & { retryAfter?: number }
    err.retryAfter = retryAfter
    throw err
  }

  const otp = generateOtp()
  otpStore.set(normalized, {
    otp,
    expiresAt: now + config.otpTtlMinutes * 60 * 1000,
    lastSentAt: now,
  })

  await sendOtpEmail(normalized, otp, config)

  return {
    ok: true,
    message: config.mockOtp ? 'OTP generated (mock mode — check server console).' : 'OTP sent to your email.',
    mock: config.mockOtp,
    ...(config.mockOtp ? { debugOtp: otp } : {}),
  }
}

export function verifyLoginOtp(email: string, otp: string, config: AuthConfig) {
  const normalized = email.trim().toLowerCase()
  const code = otp.trim()

  if (!isEmailAllowed(normalized, config)) {
    throw new Error('This email is not authorized.')
  }

  const record = otpStore.get(normalized)
  if (!record) throw new Error('No OTP found. Request a new code.')
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalized)
    throw new Error('OTP expired. Request a new code.')
  }
  if (record.otp !== code) throw new Error('Invalid OTP.')

  otpStore.delete(normalized)

  const token = crypto.randomBytes(24).toString('hex')
  const tokenHash = hashToken(token, config.sessionSecret)
  sessionStore.set(tokenHash, {
    email: normalized,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  })

  return { ok: true, token, email: normalized, expiresInHours: 24 }
}

export function verifySessionToken(authHeader: string | undefined, config: AuthConfig): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  if (!token) return null

  const tokenHash = hashToken(token, config.sessionSecret)
  const session = sessionStore.get(tokenHash)
  if (!session) return null
  if (Date.now() > session.expiresAt) {
    sessionStore.delete(tokenHash)
    return null
  }
  return session.email
}

export function logoutSession(authHeader: string | undefined, config: AuthConfig) {
  if (!authHeader?.startsWith('Bearer ')) return
  const token = authHeader.slice(7).trim()
  sessionStore.delete(hashToken(token, config.sessionSecret))
}

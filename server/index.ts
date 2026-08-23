import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import {
  logoutSession,
  parseAuthConfig,
  sendLoginOtp,
  verifyLoginOtp,
  verifySessionToken,
} from './auth'
import { runSmartFill } from './smartFill'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const port = Number(process.env.PORT || 3001)
const authConfig = parseAuthConfig(process.env)

const serverEnv = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  TAVILY_API_KEY: process.env.TAVILY_API_KEY || '',
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5180,http://127.0.0.1:5180')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Not allowed by CORS'))
  },
}))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'creative-studio',
    auth: Boolean(authConfig.allowedEmails.length || authConfig.allowedDomain),
    keys: Boolean(serverEnv.OPENAI_API_KEY && serverEnv.TAVILY_API_KEY),
  })
})

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const email = String(req.body?.email || '')
    const result = await sendLoginOtp(email, authConfig)
    if (result.mock && result.debugOtp) {
      console.log(`[MOCK OTP] ${email} → ${result.debugOtp}`)
    }
    res.json(result)
  } catch (e) {
    const err = e as Error & { retryAfter?: number }
    res.status(err.retryAfter ? 429 : 400).json({
      ok: false,
      error: err.message,
      retryAfter: err.retryAfter,
    })
  }
})

app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const email = String(req.body?.email || '')
    const otp = String(req.body?.otp || '')
    const result = verifyLoginOtp(email, otp, authConfig)
    res.json(result)
  } catch (e) {
    res.status(400).json({ ok: false, error: e instanceof Error ? e.message : 'Verification failed' })
  }
})

app.post('/api/auth/logout', (req, res) => {
  logoutSession(req.headers.authorization, authConfig)
  res.json({ ok: true })
})

app.post('/api/smart-fill', async (req, res) => {
  const email = verifySessionToken(req.headers.authorization, authConfig)
  if (!email) {
    res.status(401).json({ error: 'Login required. Verify company email OTP first.' })
    return
  }

  try {
    const result = await runSmartFill(serverEnv, req.body)
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Smart fill failed' })
  }
})

app.listen(port, () => {
  console.log(`Creative Studio API → http://localhost:${port}`)
  if (!authConfig.allowedEmails.length && !authConfig.allowedDomain) {
    console.warn('⚠ Set ALLOWED_EMAILS or ALLOWED_DOMAIN in server/.env')
  }
  if (!serverEnv.OPENAI_API_KEY || !serverEnv.TAVILY_API_KEY) {
    console.warn('⚠ Set OPENAI_API_KEY and TAVILY_API_KEY in server/.env')
  }
})

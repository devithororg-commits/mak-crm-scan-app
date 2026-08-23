# Smart Studio — Setup Guide (Company Internal)

Smart Fill is **internal company use only**. No Cloudflare account needed.

Login = **company email + OTP**. API keys stay on your server only.

---

## What You Need

| # | What | Required? | Where to get | Where to paste |
|---|------|-----------|--------------|----------------|
| 1 | **OPENAI_API_KEY** | ✅ Yes | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | `server/.env` |
| 2 | **TAVILY_API_KEY** | ✅ Yes | [app.tavily.com](https://app.tavily.com) | `server/.env` |
| 3 | **UNSPLASH_ACCESS_KEY** | ⭐ Recommended | [unsplash.com/developers](https://unsplash.com/developers) | `server/.env` |
| 4 | **ALLOWED_DOMAIN** or **ALLOWED_EMAILS** | ✅ Yes | Your company domain | `server/.env` |
| 5 | **SMTP** (email OTP) | ✅ Yes* | Gmail / company mail | `server/.env` |
| 6 | **VITE_STUDIO_API_URL** | ✅ Yes | After server starts | root `.env` |

\* For testing only, set `MOCK_OTP=true` — OTP prints in server terminal (no SMTP needed).

**You do NOT need:** Cloudflare, Wrangler, or any extra cloud account.

---

## Step 1 — Create AI Keys

### OpenAI
1. [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → Create key (`sk-proj-...`)
2. Enable billing at [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)

### Tavily (web research)
1. [app.tavily.com](https://app.tavily.com) → sign up free
2. Copy API key (`tvly-...`)

### Unsplash (real photos — recommended)
1. [unsplash.com/developers](https://unsplash.com/developers) → New Application
2. Copy **Access Key** (not Secret Key)

---

## Step 2 — Paste Keys in `server/.env`

```bash
cd mak-crm-scan-app
cp server/.env.example server/.env
```

Edit **`server/.env`**:

```env
OPENAI_API_KEY=sk-proj-your-key
TAVILY_API_KEY=tvly-your-key
UNSPLASH_ACCESS_KEY=your-unsplash-access-key

# Your company — only these emails can login
ALLOWED_DOMAIN=yourcompany.com
# OR: ALLOWED_EMAILS=you@yourcompany.com,team@yourcompany.com

SESSION_SECRET=any-long-random-string-here

# Email OTP (Gmail: use App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Creative Studio <your@gmail.com>

PORT=3001
```

**Testing without email setup:**

```env
MOCK_OTP=true
```

OTP will show in the server terminal when you click "Send OTP".

---

## Step 3 — App `.env` (Worker URL only)

Create **`mak-crm-scan-app/.env`**:

```env
VITE_STUDIO_API_URL=http://localhost:3001
```

When you host the server on your company VPS, change to your real URL:
`https://studio-api.yourcompany.com`

---

## Step 4 — Run

**Terminal 1 — API server:**

```bash
cd mak-crm-scan-app
npm install
npm run server:dev
```

**Terminal 2 — App:**

```bash
npm run dev
```

Open app → **Text tab** → **Smart Fill** → company email → OTP → Generate.

---

## Step 5 — Company Profile (in app)

**Brand tab** → Company Profile → save name, phone, colors.

Smart Fill uses this for brand voice.

---

## Hosting on Company Server (optional)

Run `npm run server:start` on your office PC or VPS with `server/.env` configured.

Point `VITE_STUDIO_API_URL` to that server URL before building for GitHub Pages.

---

## Monthly Cost (~10–20 creatives/day)

| Item | Cost |
|------|------|
| Tavily | FREE (1,000/mo) |
| OpenAI GPT-4o-mini | ~₹500–1,500/mo |
| Unsplash | FREE |
| Your server / SMTP | Already have |
| **Total** | **~₹500–1,500/mo** |

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Studio API not configured" | Add `VITE_STUDIO_API_URL` to `.env` |
| "Studio API unreachable" | Run `npm run server:dev` |
| "This email is not authorized" | Add `ALLOWED_DOMAIN` or email in `server/.env` |
| "SMTP not configured" | Add SMTP settings or use `MOCK_OTP=true` |
| "Login required" | Complete email OTP login in Smart Fill panel |
| No photo | Add `UNSPLASH_ACCESS_KEY` in `server/.env` |

---

## Security

- [ ] API keys only in `server/.env` (never in browser or GitHub)
- [ ] `server/.env` not committed to git
- [ ] Root `.env` has only `VITE_STUDIO_API_URL`
- [ ] Company emails restricted via `ALLOWED_DOMAIN`

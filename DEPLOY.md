# Deploy — apptesting.in

**Live URL:** https://apptesting.in/

Creative Studio Pro deploys to **apptesting.in** via Hostinger FTP on every push to `master`.

---

## GitHub Secrets (one-time setup)

Repo → **Settings** → **Secrets and variables** → **Actions** → New repository secret:

| Secret | Value |
|--------|--------|
| `APPTESTING_FTP_USER` | Hostinger FTP username (e.g. `u169457691.apptesting.in`) |
| `APPTESTING_FTP_PASS` | FTP password for apptesting.in |
| `HOSTINGER_PASS` | *(fallback)* Same FTP password used for devithor-audit / devithorcrm deploys |

If `audit.devithor.in` deploy already works, copy the same **`HOSTINGER_PASS`** secret into this repo — deploy will auto-find `domains/apptesting.in/public_html`.

---

## Manual deploy

GitHub → **Actions** → **Deploy to apptesting.in** → **Run workflow**

---

## Local FTP deploy (optional)

```bash
npm run build
export APPTESTING_FTP_USER=u169457691.apptesting.in
export APPTESTING_FTP_PASS=your-ftp-password
python3 .github/scripts/deploy-apptesting.py
```

This **clears the domain webroot** and uploads fresh `dist/`.

---

## DNS

Point `apptesting.in` A record to Hostinger (same as other Devithor domains). SSL is automatic on Hostinger.

---

## Smart Studio API (later)

Frontend only is deployed now. When ready, run the studio server separately and set:

```env
VITE_STUDIO_API_URL=https://your-api-url
```

Then rebuild and redeploy.

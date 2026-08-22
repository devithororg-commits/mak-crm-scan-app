# Creative Studio Pro — Project Notes (Complete Guide)

> **Last updated:** Aug 22, 2026  
> **Repo:** https://github.com/devithororg-commits/mak-crm-scan-app  
> **Live site:** https://devithororg-commits.github.io/mak-crm-scan-app/

---

## 1. Project Overview

**Creative Studio Pro** — Social media creative generator for real estate & business.

| Item | Details |
|------|---------|
| Stack | Vite + React 19 + TypeScript + Tailwind CSS v4 |
| Templates | 44 professional templates |
| Editor | Canva-style tool rail + canvas toolbar |
| Deploy | GitHub Pages (auto on push to `master`) |
| Data save | Browser localStorage (auto-save every ~800ms) |

---

## 2. Important Links

| What | URL |
|------|-----|
| GitHub Repo | https://github.com/devithororg-commits/mak-crm-scan-app |
| Live Site | https://devithororg-commits.github.io/mak-crm-scan-app/ |
| GitHub Actions | https://github.com/devithororg-commits/mak-crm-scan-app/actions |

---

## 3. Laptop Lo First Time Setup

### Prerequisites install cheyi

1. **Git** → https://git-scm.com/downloads  
2. **Node.js 20+ (LTS)** → https://nodejs.org  

Verify:
```bash
git --version
node --version
npm --version
```

### Project clone cheyi

```bash
cd Desktop
git clone https://github.com/devithororg-commits/mak-crm-scan-app.git
cd mak-crm-scan-app
```

### Dependencies install

```bash
npm install
```

### Local development run

```bash
npm run dev
```

Browser lo open: **http://localhost:5173**

### Production build test (optional)

```bash
npm run build
npm run preview
```

---

## 4. Daily Workflow

```bash
# 1. Latest code pull cheyi
git pull origin master

# 2. Local server start
npm run dev

# 3. Code edit cheyi → browser lo preview chudu

# 4. Changes save & push
git add .
git commit -m "Describe your change here"
git push origin master

# 5. ~1-2 min taruvata live site check cheyi
# https://devithororg-commits.github.io/mak-crm-scan-app/
```

---

## 5. Deploy Process (Automatic)

Push to `master` branch → GitHub Actions automatic ga run avtundi:

1. `npm ci` — dependencies install  
2. `npm run build` — production build  
3. GitHub Pages ki deploy  

**Manual deploy trigger:** GitHub → Actions → "Deploy to GitHub Pages" → Run workflow

**Deploy status check:**
```bash
gh run list --workflow=deploy.yml --limit 1
```

---

## 6. Project Folder Structure

```
mak-crm-scan-app/
├── src/
│   ├── components/
│   │   ├── editor/           # All editing UI
│   │   │   ├── CanvaToolRail.tsx      # Left icon tool bar
│   │   │   ├── CanvaToolPanel.tsx     # Tool panel content
│   │   │   ├── CanvasToolbar.tsx      # Bottom zoom/aspect toolbar
│   │   │   ├── EditorPanel.tsx        # Main editor shell
│   │   │   ├── QuickEditPanel.tsx     # Smart text editing
│   │   │   ├── AdvancedControlsPanel.tsx  # Design controls
│   │   │   ├── MediaEditor.tsx        # Photo upload & filters
│   │   │   ├── ExportPanel.tsx        # Download & export
│   │   │   └── ...
│   │   ├── templates/        # 44 template cards
│   │   └── layout/           # AppShell (header, undo/redo)
│   ├── data/
│   │   ├── config.ts         # Templates list, platforms, colors
│   │   ├── presets.ts        # Template presets & switching
│   │   └── templateEditMap.ts # Smart edit fields per template
│   ├── store/
│   │   └── CreativeContext.tsx  # App state, undo/redo
│   ├── types/
│   │   └── creative.ts       # All TypeScript types
│   └── utils/                # Export, images, persistence, etc.
├── .github/workflows/
│   └── deploy.yml            # Auto deploy to GitHub Pages
├── package.json
└── PROJECT_NOTES.md          # This file
```

---

## 7. Editor Tools (Canva-Style)

### Left Tool Rail

| Tool | Purpose |
|------|---------|
| **Templates** | Browse & pick layout |
| **Text** | Headlines, copy, highlights, smart edit |
| **Uploads** | Photos, filters, gallery, placement |
| **Design** | Colors, presets, effects, spacing, QR |
| **Brand** | Logo, fonts, brand kit, themes |
| **Charts** | Metrics, CSV import, chart data |
| **Pages** | Carousel slide editor |
| **Export** | Download PNG/JPG/PDF, video, library |

### Canvas Bottom Toolbar

- Aspect ratio quick switch (1:1, 4:5, 9:16)
- Grid overlay toggle
- Safe zone guide (Instagram crop area)
- Zoom slider + fit to screen
- Carousel page navigation dots

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` or `Ctrl + Shift + Z` | Redo |

### Word Highlights

Text lo important words highlight cheyadaniki `**word**` syntax use cheyi:
```
Q4 **Growth** Report
Revenue up **34%** year over year
```

---

## 8. All 44 Templates

### Business / Analytics
`feature-card`, `analytics`, `progress`, `stats-dashboard`, `report-story`, `job-card`, `kanban-task`, `profile-card`, `pastel-job`, `community-post`

### Real Estate
`just-listed`, `just-sold`, `open-house`, `profile-glass`, `buyer-match`, `luxury-frame`, `testimonial`, `market-update`, `photo-gallery`, `price-drop`, `emi-calculator`, `agent-spotlight`, `festival-wishes`, `site-visit`, `before-after`, `neighbourhood-guide`, `investment-roi`, `project-launch`, `quote-card`, `rera-trust`, `rental-yield`, `property-compare`, `home-tips`, `team-showcase`

### Social / Design-Inspired
`grid-cheatsheet`, `glass-card`, `gradient-radar`, `serif-authority`, `growth-curve`, `minimal-pill`, `carousel-tip`, `design-pills`, `hook-post`, `studio-statement`

---

## 9. Style Presets (One-Click Looks)

| Preset | Description |
|--------|-------------|
| Bold Impact | Large text, gradient highlights |
| Minimal Clean | Subtle, understated |
| Luxury Estate | Gold theme, premium filters |
| Social Pop | Vibrant rose colors |
| Data Dense | Compact metrics layout |
| Trust Pro | Corporate emerald, full footer |

**Content Density:** Compact | Normal | Spacious

---

## 10. Export Options

| Format | Use Case |
|--------|----------|
| PNG / JPG | Social media posts |
| PDF | Print / documents |
| Magic Resize | All aspect ratios at once |
| Carousel ZIP/PDF | Multi-slide export |
| Video (WebM) | Reel / slideshow |
| Save to Library | Local browser storage |

**Export Quality:** 2× to 6× (6× = ~6480px for 1:1)

---

## 11. Git Commands Reference

```bash
# Status check
git status

# Latest pull
git pull origin master

# All changes stage
git add .

# Commit with message
git commit -m "Your message here"

# Push to GitHub (triggers deploy)
git push origin master

# Recent commits chudu
git log --oneline -5

# Specific file diff
git diff src/components/editor/EditorPanel.tsx
```

---

## 12. GitHub Login (Push kosam)

Laptop lo first time push cheste GitHub login adagochu:

**Option A — Personal Access Token (recommended):**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic) → `repo` scope enable
3. Push app password adiginappudu token paste cheyi

**Option B — GitHub CLI:**
```bash
gh auth login
```

---

## 13. Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| `npm install` fails | Node.js 20+ install cheyi, terminal restart |
| Port 5173 busy | `npm run dev -- --port 3000` |
| Build errors | `npm run build` run chesi errors fix cheyi |
| Live site old version | Hard refresh: `Ctrl + Shift + R` |
| Push rejected | `git pull origin master` first, then push |
| White screen on live | Check GitHub Actions for build failure |

---

## 14. Recent Commits History

| Commit | Description |
|--------|-------------|
| `c91afff` | Canva-style tool rail, panels, canvas toolbar |
| `623410f` | Style presets, visibility toggles, QR controls |
| `1ed4068` | Advanced Style controls, bug fixes |
| `a5dc572` | 44 templates, smart template switching |

---

## 15. Development Rules

1. **Only edit** `mak-crm-scan-app/` folder — old projects touch cheyaku
2. **Commit** only when ready — meaningful commit messages use cheyi
3. **Build test** before push: `npm run build`
4. **Deploy** — push to `master` = automatic deploy
5. New template add cheste update cheyali:
   - `src/types/creative.ts` (TemplateId)
   - `src/data/config.ts` (TEMPLATES array)
   - `src/data/presets.ts` (TEMPLATE_PRESETS)
   - `src/data/templateEditMap.ts` (edit fields)
   - `src/components/templates/TemplateRenderer.tsx`
   - `src/components/editor/TemplateThumb.tsx`

---

## 16. Quick Start (One-Liner Summary)

```bash
git clone https://github.com/devithororg-commits/mak-crm-scan-app.git
cd mak-crm-scan-app
npm install
npm run dev
# Edit → git add . → git commit -m "msg" → git push origin master
# Live: https://devithororg-commits.github.io/mak-crm-scan-app/
```

---

*Notes created for MAK Creative Studio Pro project. Update this file when major changes are made.*

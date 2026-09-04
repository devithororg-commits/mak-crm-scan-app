# Aurora Studio PPT — Enterprise Architecture

Principal reference for the browser-based presentation engine (React + Konva canvas + PHP/MySQL).

## Stack

| Layer | Technology | Role |
|-------|------------|------|
| Render | Konva / react-konva | 60fps canvas, blocks, transforms |
| State | Zustand + Zod AST v1 | Single source of truth (`lib/ast/schema.ts`) |
| UI | React 19 + Tailwind 4 + Radix | Dark-luxury chrome (#0A0A0C / #16161A) |
| Persistence | localStorage + PHP API | Offline-first, cloud sync when API configured |
| Backend | PHP 8 + MySQL | Hostinger — decks CRUD, uploads, webhooks |
| Deploy | Static SPA + FTP | `public/aurora-ppt.html` + `assets/aurora-ppt-spa.js` |

## Layout (matches reference UI)

```
┌──────────────┬────────────────────────────────────┬──────────────┐
│  Slide Rail  │           Top Toolbar              │              │
│  (layers +   ├────────────────────────────────────┤  Properties  │
│  thumbnails) │         Central Canvas             │   Panel      │
│              │         (1920×1080 AST)            │  (Inspector) │
└──────────────┴────────────────────────────────────┴──────────────┘
```

## Part 1 — Canvas controls (20)

| # | Control | Status | Module |
|---|---------|--------|--------|
| 1 | X/Y position | ✅ | `Inspector` BlockPanel |
| 2 | W/H + aspect lock | ✅ | BlockPanel + Link2 toggle |
| 3 | 360° rotation dial (Shift→15°) | ✅ | `controls.Dial` |
| 4 | Opacity 0–100% | ✅ | SliderNum |
| 5 | Per-corner radius | ✅ | `CornerControl` |
| 6 | Image fit (cover/contain/fill) | ✅ | ImagePanel |
| 7 | Z-index layer order | ✅ | ArrangePanel |
| 8 | Element lock | ✅ | toggleLock |
| 9 | Group / ungroup | ✅ | store.group/ungroup |
| 10 | Smart alignment | ✅ | alignBlocks |
| 11 | Distribute spacing | ✅ | distributeBlocks |
| 12 | Typography engine | ✅ | TextPanel |
| 13 | Hex/RGB + eyedropper + swatches | ✅ | ColorPicker |
| 14 | Gradient builder | ✅ | PaintEditor |
| 15 | Stroke & border | ✅ | StrokePanel |
| 16 | Shadow & glow | ✅ | ShadowPanel |
| 17 | Backdrop filter (glass) | 🔲 M3 | schema extension |
| 18 | Masking / clip paths | 🔲 M3 | schema extension |
| 19 | Slide transitions | ✅ | SlidePanel |
| 20 | Viewport toggles 16:9/tablet/mobile | ✅ M2 | Toolbar |

## Part 2 — Features (50) — phased

### M1 — Core (shipped)
- [x] Canvas editor, AST, undo/redo, themes, presenter
- [x] Magnetic snap guides
- [x] Multi-select, keyboard shortcuts
- [x] localStorage persistence

### M2 — Premium chrome + cloud (current)
- [x] Aurora Noir design system
- [x] PHP/MySQL deck API (`public/api/`)
- [x] Auto-save to cloud (debounced)
- [x] Viewport preview toggles
- [x] Layer search in slide rail
- [x] Space+drag pan, scroll zoom

### M3 — AI & media
- [ ] LLM prompt-to-deck
- [ ] Brand URL extraction
- [ ] Background removal
- [ ] Unsplash/Pexels library
- [ ] Font upload, SVG, Lottie
- [ ] Magic resize

### M4 — Data & interactivity
- [ ] MySQL chart binding
- [ ] Interakt WhatsApp forms
- [ ] QR codes, hyperlinks, iframes
- [ ] Countdown timers

### M5 — Collaboration
- [ ] WebSocket cursors
- [ ] Comments, RBAC, audit logs

### M6 — Export & analytics
- [ ] PPTX microservice
- [ ] PDF vector export
- [ ] PNG carousel slices
- [ ] Published HTML + analytics

## API endpoints

```
GET    /api/decks.php           → list decks
POST   /api/decks.php           → create { title, ast }
GET    /api/decks.php?id=       → load deck
PUT    /api/decks.php?id=       → save { ast, title }
DELETE /api/decks.php?id=       → delete
GET    /api/health.php          → { ok, version }
```

Configure `public/api/config.local.php` on Hostinger (see `config.example.php`).

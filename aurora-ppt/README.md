# Aurora Studio PPT

Canvas-native presentation editor (formerly **Lumina Flow**), integrated into the AURORA.STUDIO ecosystem.

## Stack

- React 19 + TypeScript
- TanStack Start / Router + Vite 8
- Konva / react-konva (canvas engine)
- Zustand + localStorage persistence
- Zod AST schema (1920×1080 design space)
- Tailwind CSS 4 + Radix UI
- Supabase (cloud decks — optional, not wired in UI yet)

## Commands

```bash
cd aurora-ppt
npm install
npm run dev      # local dev server
npm run build    # Cloudflare/Nitro build → .output/public
```

After build, copy `.output/public/*` to `../public/aurora-ppt/` for static FTP deploy.

## Entry URLs

- `public/aurora-ppt.html` → redirect
- `public/aurora-ppt/` → editor shell

## Notes

TanStack Start defaults to SSR (Cloudflare Workers). Static hosting on apptesting.in uses a client bootstrap `index.html`. For full SSR, deploy via `npx nitro deploy`.

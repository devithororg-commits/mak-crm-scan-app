import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Static SPA build for apptesting.in — no TanStack Start SSR required. */
export default defineConfig({
  root,
  base: "/aurora-ppt/",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: path.resolve(root, "../public/aurora-ppt"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(root, "spa.html"),
    },
  },
});

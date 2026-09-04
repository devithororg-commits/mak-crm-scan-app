import type { Theme } from "@/lib/ast/schema";

/** Curated families available in the typography panel. Axis strings match Google Fonts. */
export const FONT_FAMILIES: { name: string; axis: string; kind: "serif" | "sans" | "mono" | "display" }[] = [
  { name: "Fraunces", axis: "ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400", kind: "serif" },
  { name: "Playfair Display", axis: "ital,wght@0,400;0,600;0,700;1,400", kind: "serif" },
  { name: "Cormorant Garamond", axis: "ital,wght@0,300;0,400;0,600;1,400", kind: "serif" },
  { name: "Libre Baskerville", axis: "ital,wght@0,400;0,700;1,400", kind: "serif" },
  { name: "Manrope", axis: "wght@300;400;500;600;700", kind: "sans" },
  { name: "Inter", axis: "wght@300;400;500;600;700", kind: "sans" },
  { name: "Space Grotesk", axis: "wght@300;400;500;600;700", kind: "sans" },
  { name: "DM Sans", axis: "ital,wght@0,300;0,400;0,500;0,700;1,400", kind: "sans" },
  { name: "Bebas Neue", axis: "wght@400", kind: "display" },
  { name: "Syne", axis: "wght@400;600;700;800", kind: "display" },
  { name: "JetBrains Mono", axis: "wght@400;500;700", kind: "mono" },
  { name: "IBM Plex Mono", axis: "ital,wght@0,400;0,500;1,400", kind: "mono" },
];

const linked = new Set<string>(["Fraunces", "Manrope", "JetBrains Mono"]);
const loaded = new Set<string>();

function linkFamily(name: string) {
  if (typeof document === "undefined" || linked.has(name)) return;
  const spec = FONT_FAMILIES.find((f) => f.name === name);
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, "+")}${spec ? `:${spec.axis}` : ""}&display=swap`;
  const el = document.createElement("link");
  el.rel = "stylesheet";
  el.href = href;
  document.head.appendChild(el);
  linked.add(name);
}

async function loadSpecs(specs: string[]) {
  const pending = specs.filter((s) => !loaded.has(s));
  if (!pending.length) return;
  await Promise.all(
    pending.map((s) =>
      document.fonts
        .load(s)
        .then(() => loaded.add(s))
        .catch(() => undefined),
    ),
  );
}

/** Ensure the theme's web fonts (plus any explicit family overrides) are ready for canvas text. */
export async function ensureThemeFonts(theme: Theme, extraFamilies: string[] = []): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  const specs: string[] = [];
  for (const w of [300, 400, 600]) {
    specs.push(`${w} 40px "${theme.fonts.display}"`);
    specs.push(`italic ${w} 40px "${theme.fonts.display}"`);
  }
  for (const w of [400, 500, 700]) specs.push(`${w} 40px "${theme.fonts.body}"`);
  for (const fam of extraFamilies) {
    linkFamily(fam);
    for (const w of [300, 400, 500, 600, 700]) specs.push(`${w} 40px "${fam}"`);
    specs.push(`italic 400 40px "${fam}"`);
  }
  await loadSpecs(specs);
}

/** Preload a family so the picker preview renders in the real face. */
export function preloadFamily(name: string) {
  linkFamily(name);
  if (typeof document !== "undefined" && "fonts" in document) void loadSpecs([`400 40px "${name}"`]);
}

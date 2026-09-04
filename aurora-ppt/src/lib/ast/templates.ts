import { nanoid } from "nanoid";
import editorialImage from "@/assets/editorial-botanical.jpg";
import {
  EDITORIAL_GREEN,
  GALLERY_WHITE,
  NOIR,
  makeImage,
  makeShape,
  makeSlide,
  makeText,
} from "./defaults";
import type { Block, Deck, Slide, Theme } from "./schema";
import { AST_VERSION, SLIDE_H, SLIDE_W } from "./schema";

export type TemplateCategory = "business" | "creative" | "minimal" | "report";

export type DeckTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  theme: Theme;
  title: string;
  build: () => Slide[];
};

export type SlideTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  build: () => Slide;
};

function cloneBlock(b: Block): Block {
  const copy = structuredClone(b);
  copy.id = nanoid(8);
  if (copy.type === "group") {
    copy.children = copy.children.map((c) => ({ ...structuredClone(c), id: nanoid(8) }));
  }
  return copy;
}

export function cloneSlide(slide: Slide): Slide {
  return {
    ...structuredClone(slide),
    id: nanoid(8),
    blocks: slide.blocks.map(cloneBlock),
  };
}

export function buildDeckFromTemplate(t: DeckTemplate): Deck {
  const now = new Date().toISOString();
  return {
    version: AST_VERSION,
    id: nanoid(10),
    title: t.title,
    theme: structuredClone(t.theme),
    slides: t.build().map((sl) => cloneSlide(sl)),
    createdAt: now,
    updatedAt: now,
  };
}

// ---- slide layouts ----------------------------------------------------------

const slideLayouts: SlideTemplate[] = [
  {
    id: "title-hero",
    name: "Title Hero",
    description: "Full-bleed headline with kicker",
    category: "business",
    build: () =>
      makeSlide("Title Hero", [
        makeText("kicker", "Aurora Studio", { x: 140, y: 140, w: 600, h: 40 }),
        makeText("display", "Your headline\nhere.", { x: 140, y: 280, w: 1200, h: 420 }),
        makeText("body", "Supporting line that sets context for the slide.", { x: 140, y: 780, w: 720, h: 80 }),
        makeShape("line", { x: 140, y: 740, w: 160, h: 2 }),
      ]),
  },
  {
    id: "title-image",
    name: "Title + Image",
    description: "Split layout with editorial photo",
    category: "creative",
    build: () =>
      makeSlide("Title + Image", [
        makeImage(editorialImage, { x: 1040, y: 0, w: 880, h: SLIDE_H }),
        makeText("kicker", "Feature story", { x: 140, y: 200, w: 500, h: 40 }),
        makeText("heading", "Design that\nfeels alive.", { x: 140, y: 300, w: 820, h: 320 }),
        makeText("body", "Pair strong typography with a single focal image.", { x: 140, y: 680, w: 640, h: 100 }),
      ]),
  },
  {
    id: "two-column",
    name: "Two Column",
    description: "Balanced text columns",
    category: "report",
    build: () =>
      makeSlide("Two Column", [
        makeText("kicker", "Overview", { x: 140, y: 140, w: 400, h: 40 }),
        makeText("heading", "Side by side.", { x: 140, y: 220, w: 900, h: 120 }),
        makeText("body", "Left column carries the primary narrative. Keep sentences short and let the grid breathe.", { x: 140, y: 420, w: 760, h: 420 }),
        makeText("body", "Right column supports with detail, data points, or a secondary angle on the same topic.", { x: 980, y: 420, w: 760, h: 420 }),
        makeShape("line", { x: 940, y: 400, w: 1, h: 480 }, { fill: "line" }),
      ]),
  },
  {
    id: "stats-three",
    name: "Three Stats",
    description: "Metrics row with captions",
    category: "business",
    build: () =>
      makeSlide("Three Stats", [
        makeText("kicker", "Key metrics", { x: 140, y: 140, w: 500, h: 40 }),
        makeShape("line", { x: 140, y: 620, w: 1640, h: 1 }, { fill: "line" }),
        makeText("display", "98%", { x: 140, y: 320, w: 480, h: 240 }, { fontSize: 160, letterSpacing: -6 }),
        makeText("caption", "customer satisfaction", { x: 140, y: 660, w: 400, h: 60 }),
        makeText("display", "3.2×", { x: 700, y: 320, w: 480, h: 240 }, { fontSize: 160, letterSpacing: -6, color: "accent" }),
        makeText("caption", "revenue growth YoY", { x: 700, y: 660, w: 400, h: 60 }),
        makeText("display", "24h", { x: 1260, y: 320, w: 480, h: 240 }, { fontSize: 160, letterSpacing: -6 }),
        makeText("caption", "average response time", { x: 1260, y: 660, w: 440, h: 60 }),
      ]),
  },
  {
    id: "quote-center",
    name: "Quote",
    description: "Centered pull quote",
    category: "creative",
    build: () =>
      makeSlide("Quote", [
        makeShape("rect", { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H }, { fill: "surface" }),
        makeText("subheading", "“Great design is invisible until it isn't.”", { x: 260, y: 380, w: 1400, h: 220 }, { align: "center", fontSize: 56 }),
        makeText("caption", "— Aurora Studio", { x: 660, y: 640, w: 600, h: 40 }, { align: "center" }),
      ], "surface"),
  },
  {
    id: "section-break",
    name: "Section Break",
    description: "Chapter divider with number",
    category: "minimal",
    build: () =>
      makeSlide("Section", [
        makeText("display", "02", { x: 140, y: 360, w: 400, h: 280 }, { fontSize: 220, color: "accent", letterSpacing: -10 }),
        makeText("heading", "Next chapter", { x: 560, y: 420, w: 1000, h: 160 }),
        makeShape("line", { x: 560, y: 600, w: 200, h: 2 }),
      ]),
  },
  {
    id: "bullet-list",
    name: "Bullet List",
    description: "Heading with stacked points",
    category: "report",
    build: () =>
      makeSlide("Bullet List", [
        makeText("kicker", "Agenda", { x: 140, y: 140, w: 400, h: 40 }),
        makeText("heading", "What we'll cover", { x: 140, y: 220, w: 800, h: 120 }),
        makeText("body", "01 — Market opportunity and positioning", { x: 140, y: 420, w: 1200, h: 48 }),
        makeText("body", "02 — Product roadmap and milestones", { x: 140, y: 500, w: 1200, h: 48 }),
        makeText("body", "03 — Financial projections", { x: 140, y: 580, w: 1200, h: 48 }),
        makeText("body", "04 — Team and ask", { x: 140, y: 660, w: 1200, h: 48 }),
      ]),
  },
  {
    id: "thank-you",
    name: "Thank You",
    description: "Closing slide with contact",
    category: "business",
    build: () =>
      makeSlide("Thank You", [
        makeText("display", "Thank you.", { x: 140, y: 380, w: 1200, h: 200 }, { fontSize: 120 }),
        makeText("body", "hello@aurorastudio.com · aurorastudio.com", { x: 140, y: 620, w: 800, h: 48 }, { color: "muted" }),
        makeShape("line", { x: 140, y: 580, w: 120, h: 2 }),
      ]),
  },
];

// ---- full deck templates ----------------------------------------------------

const deckTemplates: DeckTemplate[] = [
  {
    id: "editorial-pitch",
    name: "Editorial Pitch",
    description: "Magazine-style investor deck with bold type",
    category: "creative",
    theme: NOIR,
    title: "Editorial Pitch",
    build: () => [
      makeSlide("Cover", [
        makeImage(editorialImage, { x: 1120, y: 0, w: 800, h: SLIDE_H }),
        makeText("kicker", "Volume I — 2026", { x: 140, y: 140, w: 700, h: 40 }),
        makeText("display", "The quiet\nart of the\npitch.", { x: 140, y: 300, w: 960, h: 480 }),
        makeShape("line", { x: 140, y: 860, w: 120, h: 2 }),
      ]),
      slideLayouts.find((t) => t.id === "two-column")!.build(),
      slideLayouts.find((t) => t.id === "stats-three")!.build(),
      slideLayouts.find((t) => t.id === "thank-you")!.build(),
    ],
  },
  {
    id: "startup-pitch",
    name: "Startup Pitch",
    description: "Classic problem → solution → traction flow",
    category: "business",
    theme: NOIR,
    title: "Startup Pitch",
    build: () => [
      makeSlide("Cover", [
        makeText("kicker", "Seed round", { x: 140, y: 160, w: 500, h: 40 }),
        makeText("display", "Build faster.\nShip smarter.", { x: 140, y: 280, w: 1100, h: 400 }),
        makeText("caption", "Company name · Confidential", { x: 140, y: 900, w: 600, h: 40 }),
      ]),
      makeSlide("Problem", [
        makeText("kicker", "01 — Problem", { x: 140, y: 140, w: 500, h: 40 }),
        makeText("heading", "Teams waste hours\non slide busywork.", { x: 140, y: 260, w: 1000, h: 280 }),
        makeText("body", "Formatting, version chaos, and export nightmares slow every pitch.", { x: 140, y: 600, w: 720, h: 120 }),
      ]),
      makeSlide("Solution", [
        makeText("kicker", "02 — Solution", { x: 140, y: 140, w: 500, h: 40 }),
        makeText("heading", "A canvas-native\npresentation OS.", { x: 140, y: 260, w: 1000, h: 280 }),
        makeShape("ellipse", { x: 1380, y: 280, w: 360, h: 360 }, { fill: "accent", opacity: 0.15 }),
        makeText("body", "AST-driven slides, 60fps editing, cloud sync, and one-click export.", { x: 140, y: 600, w: 800, h: 120 }),
      ]),
      slideLayouts.find((t) => t.id === "stats-three")!.build(),
      slideLayouts.find((t) => t.id === "thank-you")!.build(),
    ],
  },
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Feature reveal with hero imagery",
    category: "business",
    theme: EDITORIAL_GREEN,
    title: "Product Launch",
    build: () => [
      makeSlide("Reveal", [
        makeImage(editorialImage, { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H }, { opacity: 0.35 }),
        makeText("kicker", "Introducing", { x: 140, y: 200, w: 400, h: 40 }),
        makeText("display", "Aurora Pro", { x: 140, y: 300, w: 1200, h: 320 }, { fontSize: 180 }),
        makeText("body", "The premium presentation engine for modern teams.", { x: 140, y: 680, w: 700, h: 80 }),
      ]),
      slideLayouts.find((t) => t.id === "title-image")!.build(),
      makeSlide("Features", [
        makeText("kicker", "Highlights", { x: 140, y: 140, w: 400, h: 40 }),
        makeText("heading", "Built for speed\nand beauty.", { x: 140, y: 240, w: 800, h: 200 }),
        makeText("body", "Real-time canvas · Brand kits · AI assist · Export anywhere", { x: 140, y: 500, w: 600, h: 200 }),
        makeShape("rect", { x: 900, y: 200, w: 880, h: 680 }, { fill: "surface", cornerRadius: 8 }),
        makeText("subheading", "60fps", { x: 980, y: 420, w: 300, h: 80 }, { align: "center", fontSize: 72 }),
        makeText("caption", "editing performance", { x: 980, y: 520, w: 300, h: 40 }, { align: "center" }),
      ]),
      slideLayouts.find((t) => t.id === "thank-you")!.build(),
    ],
  },
  {
    id: "portfolio",
    name: "Creative Portfolio",
    description: "Showcase work with gallery rhythm",
    category: "creative",
    theme: GALLERY_WHITE,
    title: "Portfolio",
    build: () => [
      makeSlide("Intro", [
        makeText("display", "Selected\nwork.", { x: 140, y: 320, w: 900, h: 360 }),
        makeText("kicker", "2024 — 2026", { x: 140, y: 200, w: 400, h: 40 }),
      ]),
      makeSlide("Project A", [
        makeImage(editorialImage, { x: 140, y: 140, w: 900, h: 800 }),
        makeText("heading", "Botanical Series", { x: 1100, y: 300, w: 680, h: 120 }),
        makeText("body", "Editorial photography direction for a luxury wellness brand.", { x: 1100, y: 460, w: 640, h: 200 }),
      ]),
      makeSlide("Project B", [
        makeText("heading", "Brand identity", { x: 140, y: 300, w: 700, h: 120 }),
        makeText("body", "Typography, color system, and motion guidelines.", { x: 140, y: 460, w: 640, h: 160 }),
        makeShape("rect", { x: 900, y: 140, w: 880, h: 800 }, { fill: "surface", cornerRadius: 4 }),
      ]),
      slideLayouts.find((t) => t.id === "quote-center")!.build(),
    ],
  },
  {
    id: "quarterly-report",
    name: "Quarterly Report",
    description: "Data-forward business update",
    category: "report",
    theme: NOIR,
    title: "Q4 Report",
    build: () => [
      makeSlide("Cover", [
        makeText("kicker", "Q4 2026", { x: 140, y: 140, w: 400, h: 40 }),
        makeText("display", "Business\nreview.", { x: 140, y: 280, w: 900, h: 360 }),
        makeText("caption", "Internal · Confidential", { x: 140, y: 900, w: 500, h: 40 }),
      ]),
      slideLayouts.find((t) => t.id === "stats-three")!.build(),
      slideLayouts.find((t) => t.id === "two-column")!.build(),
      slideLayouts.find((t) => t.id === "bullet-list")!.build(),
    ],
  },
  {
    id: "minimal-blank",
    name: "Minimal Starter",
    description: "Clean single title slide to begin",
    category: "minimal",
    theme: NOIR,
    title: "Untitled deck",
    build: () => [slideLayouts.find((t) => t.id === "title-hero")!.build()],
  },
];

export const SLIDE_TEMPLATES: SlideTemplate[] = slideLayouts;
export const DECK_TEMPLATES: DeckTemplate[] = deckTemplates;

export const TEMPLATE_CATEGORIES: { id: TemplateCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "business", label: "Business" },
  { id: "creative", label: "Creative" },
  { id: "report", label: "Report" },
  { id: "minimal", label: "Minimal" },
];

export function getDeckTemplate(id: string): DeckTemplate | undefined {
  return DECK_TEMPLATES.find((t) => t.id === id);
}

export function getSlideTemplate(id: string): SlideTemplate | undefined {
  return SLIDE_TEMPLATES.find((t) => t.id === id);
}

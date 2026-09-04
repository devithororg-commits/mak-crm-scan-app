import { makeImage, makeShape, makeSlide, makeText } from "./defaults";
import { STOCK_IMAGES } from "./template-assets";
import type { TemplateStyle } from "./template-types";
import type { Gradient, Slide, Theme } from "./schema";
import { SLIDE_H, SLIDE_W } from "./schema";

export type DeckCopy = {
  name: string;
  kicker: string;
  headline: string;
  subtitle: string;
  tagline: string;
};

const grad = (c1: string, c2: string, angle = 135): Gradient => ({
  type: "linear",
  angle,
  stops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }],
});

export function buildPremiumDeck(
  theme: Theme,
  style: TemplateStyle,
  copy: DeckCopy,
  imageKey: string,
): Slide[] {
  const img = STOCK_IMAGES[imageKey] ?? STOCK_IMAGES.botanical;
  return [
    buildCover(theme, style, copy, img),
    buildInsight(theme, copy),
    buildMetrics(theme, copy),
    buildContent(theme, copy),
    buildClosing(theme, copy),
  ];
}

function buildCover(theme: Theme, style: TemplateStyle, copy: DeckCopy, img: string): Slide {
  const accent = theme.colors.accent;
  const surface = theme.colors.surface;

  if (style === "split" || style === "editorial") {
    return makeSlide("Cover", [
      makeImage(img, { x: 1000, y: 0, w: 920, h: SLIDE_H }),
      makeShape("rect", { x: 960, y: 0, w: 80, h: SLIDE_H }, { fill: grad(surface, accent, 180) }),
      makeText("kicker", copy.kicker, { x: 120, y: 140, w: 720, h: 44 }),
      makeText("display", copy.headline, { x: 120, y: 280, w: 860, h: 440 }),
      makeShape("line", { x: 120, y: 820, w: 140, h: 2 }, { fill: "accent" }),
      makeText("caption", copy.tagline, { x: 120, y: 860, w: 760, h: 64 }),
    ]);
  }

  if (style === "fullbleed") {
    return makeSlide("Cover", [
      makeImage(img, { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H }, { opacity: 0.42 }),
      makeShape("rect", { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H }, { fill: "#000000", opacity: 0.35 }),
      makeText("kicker", copy.kicker, { x: 140, y: 180, w: 600, h: 44 }),
      makeText("display", copy.headline, { x: 140, y: 300, w: 1200, h: 380 }, { fontSize: 132 }),
      makeText("body", copy.subtitle, { x: 140, y: 720, w: 800, h: 80 }),
    ]);
  }

  if (style === "gradient" || style === "glass") {
    return makeSlide("Cover", [
      makeShape("rect", { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H }, { fill: grad(theme.colors.background, accent, 145) }),
      makeShape("ellipse", { x: 1180, y: 120, w: 520, h: 520 }, { fill: accent, opacity: 0.18 }),
      makeShape("ellipse", { x: -80, y: 600, w: 400, h: 400 }, { fill: surface, opacity: 0.25 }),
      makeText("kicker", copy.kicker, { x: 140, y: 200, w: 600, h: 44 }),
      makeText("display", copy.headline, { x: 140, y: 320, w: 1100, h: 360 }),
      makeText("body", copy.subtitle, { x: 140, y: 740, w: 720, h: 72 }),
    ]);
  }

  if (style === "bold") {
    return makeSlide("Cover", [
      makeShape("rect", { x: 0, y: 0, w: 680, h: SLIDE_H }, { fill: accent }),
      makeShape("rect", { x: 680, y: 0, w: SLIDE_W - 680, h: SLIDE_H }, { fill: "background" }),
      makeText("display", copy.headline, { x: 80, y: 300, w: 560, h: 400 }, { fontSize: 96, color: theme.colors.background }),
      makeText("kicker", copy.kicker, { x: 760, y: 200, w: 500, h: 44 }),
      makeText("heading", copy.subtitle, { x: 760, y: 320, w: 1000, h: 200 }),
    ]);
  }

  // minimal
  return makeSlide("Cover", [
    makeText("kicker", copy.kicker, { x: 140, y: 160, w: 600, h: 44 }),
    makeText("display", copy.headline, { x: 140, y: 300, w: 1200, h: 380 }),
    makeShape("line", { x: 140, y: 760, w: 200, h: 2 }, { fill: "accent" }),
    makeText("body", copy.subtitle, { x: 140, y: 820, w: 900, h: 72 }),
  ]);
}

function buildInsight(theme: Theme, copy: DeckCopy): Slide {
  return makeSlide("Insight", [
    makeText("kicker", "01 — Overview", { x: 140, y: 140, w: 500, h: 40 }),
    makeText("heading", copy.subtitle, { x: 140, y: 240, w: 1000, h: 240 }),
    makeText("body", "A premium narrative built for clarity, momentum, and executive-ready storytelling. Every slide is designed to convert attention into action.", { x: 140, y: 540, w: 760, h: 200 }),
    makeShape("rect", { x: 1040, y: 200, w: 740, h: 680 }, { fill: "surface", cornerRadius: 12 }),
    makeText("subheading", "Key takeaway", { x: 1100, y: 420, w: 620, h: 80 }, { align: "center", fontSize: 48 }),
    makeText("caption", copy.tagline, { x: 1100, y: 520, w: 620, h: 80 }, { align: "center" }),
  ]);
}

function buildMetrics(theme: Theme, copy: DeckCopy): Slide {
  return makeSlide("Metrics", [
    makeText("kicker", "02 — Signal", { x: 140, y: 140, w: 500, h: 40 }),
    makeShape("line", { x: 140, y: 620, w: 1640, h: 1 }, { fill: "line" }),
    makeText("display", "94%", { x: 140, y: 320, w: 480, h: 240 }, { fontSize: 156, letterSpacing: -6 }),
    makeText("caption", "engagement lift", { x: 140, y: 660, w: 400, h: 56 }),
    makeText("display", "3.8×", { x: 700, y: 320, w: 480, h: 240 }, { fontSize: 156, letterSpacing: -6, color: "accent" }),
    makeText("caption", "faster delivery", { x: 700, y: 660, w: 400, h: 56 }),
    makeText("display", "12", { x: 1260, y: 320, w: 480, h: 240 }, { fontSize: 156, letterSpacing: -6 }),
    makeText("caption", "slide layouts included", { x: 1260, y: 660, w: 440, h: 56 }),
  ]);
}

function buildContent(theme: Theme, copy: DeckCopy): Slide {
  return makeSlide("Strategy", [
    makeText("kicker", "03 — Plan", { x: 140, y: 140, w: 400, h: 40 }),
    makeText("heading", "What we deliver", { x: 140, y: 220, w: 800, h: 120 }),
    makeText("body", "01 — Positioning and narrative architecture", { x: 140, y: 400, w: 1200, h: 48 }),
    makeText("body", "02 — Visual system and premium typography", { x: 140, y: 480, w: 1200, h: 48 }),
    makeText("body", "03 — Data storytelling and proof points", { x: 140, y: 560, w: 1200, h: 48 }),
    makeText("body", "04 — Launch roadmap and success metrics", { x: 140, y: 640, w: 1200, h: 48 }),
    makeShape("line", { x: 940, y: 380, w: 1, h: 360 }, { fill: "line" }),
    makeText("body", copy.name, { x: 980, y: 420, w: 760, h: 280 }, { fontSize: 28 }),
  ]);
}

function buildClosing(theme: Theme, copy: DeckCopy): Slide {
  return makeSlide("Close", [
    makeShape("rect", { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H }, { fill: grad(theme.colors.surface, theme.colors.background, 90) }),
    makeText("display", "Thank you.", { x: 140, y: 360, w: 1000, h: 200 }, { fontSize: 120 }),
    makeText("body", `${copy.name} · hello@aurorastudio.com`, { x: 140, y: 600, w: 900, h: 48 }, { color: "muted" }),
    makeShape("line", { x: 140, y: 560, w: 120, h: 2 }, { fill: "accent" }),
  ], "surface");
}

// ---- single-slide layouts for slide library ---------------------------------

export function layoutTitleHero(title = "Your headline\nhere."): Slide {
  return makeSlide("Title Hero", [
    makeText("kicker", "Aurora Studio", { x: 140, y: 140, w: 600, h: 40 }),
    makeText("display", title, { x: 140, y: 280, w: 1200, h: 420 }),
    makeText("body", "Supporting line that sets context for the slide.", { x: 140, y: 780, w: 720, h: 80 }),
    makeShape("line", { x: 140, y: 740, w: 160, h: 2 }),
  ]);
}

export function layoutSplitImage(img: string, headline: string): Slide {
  return makeSlide("Split Image", [
    makeImage(img, { x: 1040, y: 0, w: 880, h: SLIDE_H }),
    makeText("kicker", "Feature story", { x: 140, y: 200, w: 500, h: 40 }),
    makeText("heading", headline, { x: 140, y: 300, w: 820, h: 320 }),
    makeText("body", "Pair strong typography with a single focal image.", { x: 140, y: 680, w: 640, h: 100 }),
  ]);
}

export function layoutTwoColumn(): Slide {
  return makeSlide("Two Column", [
    makeText("kicker", "Overview", { x: 140, y: 140, w: 400, h: 40 }),
    makeText("heading", "Side by side.", { x: 140, y: 220, w: 900, h: 120 }),
    makeText("body", "Left column carries the primary narrative. Keep sentences short and let the grid breathe.", { x: 140, y: 420, w: 760, h: 420 }),
    makeText("body", "Right column supports with detail, data points, or a secondary angle on the same topic.", { x: 980, y: 420, w: 760, h: 420 }),
    makeShape("line", { x: 940, y: 400, w: 1, h: 480 }, { fill: "line" }),
  ]);
}

export function layoutStats(): Slide {
  return makeSlide("Three Stats", [
    makeText("kicker", "Key metrics", { x: 140, y: 140, w: 500, h: 40 }),
    makeShape("line", { x: 140, y: 620, w: 1640, h: 1 }, { fill: "line" }),
    makeText("display", "98%", { x: 140, y: 320, w: 480, h: 240 }, { fontSize: 160, letterSpacing: -6 }),
    makeText("caption", "customer satisfaction", { x: 140, y: 660, w: 400, h: 60 }),
    makeText("display", "3.2×", { x: 700, y: 320, w: 480, h: 240 }, { fontSize: 160, letterSpacing: -6, color: "accent" }),
    makeText("caption", "revenue growth YoY", { x: 700, y: 660, w: 400, h: 60 }),
    makeText("display", "24h", { x: 1260, y: 320, w: 480, h: 240 }, { fontSize: 160, letterSpacing: -6 }),
    makeText("caption", "average response time", { x: 1260, y: 660, w: 440, h: 60 }),
  ]);
}

export function layoutQuote(): Slide {
  return makeSlide("Quote", [
    makeShape("rect", { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H }, { fill: "surface" }),
    makeText("subheading", "“Great design is invisible until it isn't.”", { x: 260, y: 380, w: 1400, h: 220 }, { align: "center", fontSize: 56 }),
    makeText("caption", "— Aurora Studio", { x: 660, y: 640, w: 600, h: 40 }, { align: "center" }),
  ], "surface");
}

export function layoutSection(num = "02", title = "Next chapter"): Slide {
  return makeSlide("Section", [
    makeText("display", num, { x: 140, y: 360, w: 400, h: 280 }, { fontSize: 220, color: "accent", letterSpacing: -10 }),
    makeText("heading", title, { x: 560, y: 420, w: 1000, h: 160 }),
    makeShape("line", { x: 560, y: 600, w: 200, h: 2 }),
  ]);
}

export function layoutAgenda(): Slide {
  return makeSlide("Agenda", [
    makeText("kicker", "Agenda", { x: 140, y: 140, w: 400, h: 40 }),
    makeText("heading", "What we'll cover", { x: 140, y: 220, w: 800, h: 120 }),
    makeText("body", "01 — Market opportunity and positioning", { x: 140, y: 420, w: 1200, h: 48 }),
    makeText("body", "02 — Product roadmap and milestones", { x: 140, y: 500, w: 1200, h: 48 }),
    makeText("body", "03 — Financial projections", { x: 140, y: 580, w: 1200, h: 48 }),
    makeText("body", "04 — Team and ask", { x: 140, y: 660, w: 1200, h: 48 }),
  ]);
}

export function layoutThankYou(): Slide {
  return makeSlide("Thank You", [
    makeText("display", "Thank you.", { x: 140, y: 380, w: 1200, h: 200 }, { fontSize: 120 }),
    makeText("body", "hello@aurorastudio.com · aurorastudio.com", { x: 140, y: 620, w: 800, h: 48 }, { color: "muted" }),
    makeShape("line", { x: 140, y: 580, w: 120, h: 2 }),
  ]);
}

export function layoutGlassCard(theme: Theme): Slide {
  return makeSlide("Glass Panel", [
    makeShape("rect", { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H }, { fill: grad(theme.colors.background, theme.colors.accent, 120) }),
    makeShape("rect", { x: 200, y: 180, w: 1520, h: 720 }, { fill: theme.colors.surface, opacity: 0.55, cornerRadius: 24 }),
    makeText("heading", "Glassmorphism\nspotlight.", { x: 320, y: 360, w: 900, h: 240 }, { align: "center", fontSize: 72 }),
    makeText("body", "Layer translucent panels over rich gradients for a premium feel.", { x: 420, y: 620, w: 1080, h: 80 }, { align: "center" }),
  ]);
}

export function layoutMoodBoard(img: string): Slide {
  return makeSlide("Mood Board", [
    makeImage(img, { x: 0, y: 0, w: 960, h: SLIDE_H }),
    makeShape("rect", { x: 960, y: 0, w: 960, h: SLIDE_H }, { fill: "surface" }),
    makeText("kicker", "Mood board", { x: 1040, y: 200, w: 500, h: 40 }),
    makeText("heading", "Texture &\ntone.", { x: 1040, y: 300, w: 760, h: 240 }),
    makeText("body", "Marble, botanical, and metallic accents for editorial luxury.", { x: 1040, y: 580, w: 700, h: 120 }),
  ]);
}

export function layoutTimeline(): Slide {
  return makeSlide("Timeline", [
    makeText("kicker", "Roadmap", { x: 140, y: 140, w: 400, h: 40 }),
    makeText("heading", "Quarterly milestones", { x: 140, y: 220, w: 900, h: 100 }),
    makeShape("line", { x: 140, y: 520, w: 1640, h: 3 }, { fill: "accent" }),
    makeText("caption", "Q1", { x: 180, y: 460, w: 120, h: 40 }, { align: "center" }),
    makeText("caption", "Q2", { x: 540, y: 460, w: 120, h: 40 }, { align: "center" }),
    makeText("caption", "Q3", { x: 900, y: 460, w: 120, h: 40 }, { align: "center" }),
    makeText("caption", "Q4", { x: 1260, y: 460, w: 120, h: 40 }, { align: "center" }),
    makeText("body", "Launch · Scale · Optimize · Expand", { x: 140, y: 580, w: 1640, h: 48 }, { align: "center" }),
  ]);
}

export function layoutTeam(img: string): Slide {
  return makeSlide("Team", [
    makeImage(img, { x: 140, y: 140, w: 720, h: 800 }),
    makeText("kicker", "Our team", { x: 940, y: 200, w: 400, h: 40 }),
    makeText("heading", "People behind\nthe work.", { x: 940, y: 300, w: 800, h: 240 }),
    makeText("body", "Cross-functional experts in design, strategy, and engineering.", { x: 940, y: 580, w: 720, h: 120 }),
  ]);
}

export function layoutComparison(): Slide {
  return makeSlide("Compare", [
    makeText("kicker", "Analysis", { x: 140, y: 140, w: 400, h: 40 }),
    makeText("heading", "Before vs after", { x: 140, y: 220, w: 800, h: 100 }),
    makeShape("rect", { x: 140, y: 380, w: 780, h: 520 }, { fill: "surface", cornerRadius: 8 }),
    makeShape("rect", { x: 1000, y: 380, w: 780, h: 520 }, { fill: "accent", opacity: 0.15, cornerRadius: 8 }),
    makeText("subheading", "Before", { x: 200, y: 420, w: 300, h: 60 }),
    makeText("subheading", "After", { x: 1060, y: 420, w: 300, h: 60 }),
  ]);
}

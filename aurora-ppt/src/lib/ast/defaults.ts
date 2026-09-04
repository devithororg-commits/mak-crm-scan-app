import { nanoid } from "nanoid";
import editorialImage from "@/assets/editorial-botanical.jpg";
import {
  AST_VERSION,
  DEFAULT_TRANSITION,
  SLIDE_H,
  SLIDE_W,
  type Block,
  type Deck,
  type ImageBlock,
  type ShapeBlock,
  type Slide,
  type TextBlock,
  type TextRole,
  type Theme,
} from "./schema";

export const NOIR: Theme = {
  id: "noir",
  name: "Aurora Noir",
  colors: {
    background: "#0A0A0C",
    surface: "#16161A",
    foreground: "#F2EEE6",
    muted: "#9A9AA3",
    accent: "#D4A373",
    line: "#F2EEE61F",
  },
  fonts: {
    display: "Fraunces",
    body: "Manrope",
    mono: "JetBrains Mono",
  },
};

export const EDITORIAL_GREEN: Theme = {
  id: "editorial-green",
  name: "Deep Editorial Green",
  colors: {
    background: "#0F2A22",
    surface: "#274C3F",
    foreground: "#EDE7D9",
    muted: "#A9B3A3",
    accent: "#D4A373",
    line: "#EDE7D91F",
  },
  fonts: {
    display: "Fraunces",
    body: "Manrope",
    mono: "JetBrains Mono",
  },
};

export const GALLERY_WHITE: Theme = {
  id: "gallery-white",
  name: "Gallery White",
  colors: {
    background: "#F6F3EC",
    surface: "#ECE6D8",
    foreground: "#141414",
    muted: "#6B6B63",
    accent: "#8A8F7A",
    line: "#1414141A",
  },
  fonts: { display: "Fraunces", body: "Manrope", mono: "JetBrains Mono" },
};

export const THEMES: Theme[] = [NOIR, EDITORIAL_GREEN, GALLERY_WHITE];

export const TEXT_PRESETS: Record<
  TextRole,
  Pick<TextBlock, "font" | "fontSize" | "fontWeight" | "lineHeight" | "letterSpacing" | "uppercase" | "color" | "italic">
> = {
  display: { font: "display", fontSize: 148, fontWeight: 300, lineHeight: 0.98, letterSpacing: -4, uppercase: false, color: "foreground", italic: false },
  heading: { font: "display", fontSize: 88, fontWeight: 400, lineHeight: 1.04, letterSpacing: -2, uppercase: false, color: "foreground", italic: false },
  subheading: { font: "display", fontSize: 48, fontWeight: 300, lineHeight: 1.2, letterSpacing: -0.5, uppercase: false, color: "foreground", italic: true },
  body: { font: "body", fontSize: 30, fontWeight: 400, lineHeight: 1.45, letterSpacing: 0, uppercase: false, color: "muted", italic: false },
  caption: { font: "body", fontSize: 20, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0, uppercase: false, color: "muted", italic: false },
  kicker: { font: "body", fontSize: 18, fontWeight: 700, lineHeight: 1.2, letterSpacing: 4, uppercase: true, color: "accent", italic: false },
};

type Frame = { x: number; y: number; w: number; h: number };

const base = () => ({ id: nanoid(8), rotation: 0, opacity: 1, locked: false, lockAspect: false });

export function makeText(role: TextRole, text: string, frame: Frame, extra: Partial<TextBlock> = {}): TextBlock {
  const p = TEXT_PRESETS[role];
  return {
    ...base(),
    type: "text",
    role,
    text,
    ...frame,
    align: "left",
    verticalAlign: "top",
    ...p,
    ...extra,
  };
}

export function makeShape(shape: ShapeBlock["shape"], frame: Frame, extra: Partial<ShapeBlock> = {}): ShapeBlock {
  return {
    ...base(),
    type: "shape",
    shape,
    fill: "accent",
    strokeWidth: 0,
    strokeStyle: "solid",
    strokeAlign: "center",
    cornerRadius: 0,
    ...frame,
    ...extra,
  };
}

export function makeImage(src: string, frame: Frame, extra: Partial<ImageBlock> = {}): ImageBlock {
  return {
    ...base(),
    type: "image",
    src,
    fit: "cover",
    cornerRadius: 0,
    strokeWidth: 0,
    strokeStyle: "solid",
    strokeAlign: "center",
    ...frame,
    ...extra,
  };
}

export function makeSlide(name: string, blocks: Block[] = [], background = "background"): Slide {
  return { id: nanoid(8), name, background, blocks, notes: "", transition: { ...DEFAULT_TRANSITION } };
}

/** Block factory used by the toolbar — drops a sensible default at the slide centre. */
export function defaultBlock(kind: "display" | "heading" | "body" | "kicker" | "rect" | "ellipse" | "line" | "image", src?: string): Block {
  const cx = SLIDE_W / 2;
  const cy = SLIDE_H / 2;
  switch (kind) {
    case "display":
      return makeText("display", "Headline", { x: cx - 700, y: cy - 150, w: 1400, h: 300 });
    case "heading":
      return makeText("heading", "Section title", { x: cx - 600, y: cy - 100, w: 1200, h: 200 });
    case "body":
      return makeText("body", "Body copy goes here. Keep it to a few lines and let the whitespace do the talking.", { x: cx - 450, y: cy - 80, w: 900, h: 160 });
    case "kicker":
      return makeText("kicker", "Chapter 01", { x: cx - 200, y: cy - 20, w: 400, h: 40 });
    case "rect":
      return makeShape("rect", { x: cx - 240, y: cy - 160, w: 480, h: 320 }, { fill: "surface" });
    case "ellipse":
      return makeShape("ellipse", { x: cx - 160, y: cy - 160, w: 320, h: 320 });
    case "line":
      return makeShape("line", { x: cx - 400, y: cy, w: 800, h: 2 }, { fill: "accent" });
    case "image":
      return makeImage(src ?? editorialImage, { x: cx - 320, y: cy - 240, w: 640, h: 480 });
  }
}

export function createSampleDeck(): Deck {
  const now = new Date().toISOString();
  const slides: Slide[] = [
    makeSlide("Cover", [
      makeImage(editorialImage, { x: 1120, y: 0, w: 800, h: SLIDE_H }),
      makeText("kicker", "Volume I — Autumn 2026", { x: 140, y: 140, w: 700, h: 40 }),
      makeText("display", "The quiet\nart of the\npitch.", { x: 140, y: 300, w: 960, h: 480 }),
      makeText("caption", "A living presentation engine — Gamma's blocks, Chronicle's type.", { x: 140, y: 900, w: 760, h: 60 }),
      makeShape("line", { x: 140, y: 860, w: 120, h: 2 }),
    ]),
    makeSlide("Thesis", [
      makeText("kicker", "01 — Thesis", { x: 140, y: 140, w: 500, h: 40 }),
      makeText("heading", "Slides should be\nliving software,\nnot frozen pictures.", { x: 140, y: 260, w: 1100, h: 420 }),
      makeText("body", "Every element is a typed node in an abstract syntax tree. Layouts flow, data binds, exports never break a font.", { x: 1260, y: 640, w: 520, h: 260 }),
      makeShape(
        "ellipse",
        { x: 1520, y: 200, w: 260, h: 260 },
        {
          fill: { type: "radial", angle: 0, stops: [{ offset: 0, color: "#F0C89A" }, { offset: 1, color: "accent" }] },
          shadow: { x: 0, y: 30, blur: 60, color: "#000000", opacity: 0.5 },
        },
      ),
    ]),
    makeSlide("Numbers", [
      makeText("kicker", "02 — Signal", { x: 140, y: 140, w: 500, h: 40 }),
      makeShape("line", { x: 140, y: 620, w: 1640, h: 1 }, { fill: "line" }),
      makeText("display", "60", { x: 140, y: 340, w: 480, h: 240 }, { fontSize: 200, letterSpacing: -8 }),
      makeText("caption", "frames per second under heavy drag", { x: 140, y: 660, w: 440, h: 80 }),
      makeText("display", "0", { x: 700, y: 340, w: 480, h: 240 }, { fontSize: 200, letterSpacing: -8, color: "accent" }),
      makeText("caption", "milliseconds of DOM reflow on edit", { x: 700, y: 660, w: 440, h: 80 }),
      makeText("display", "∞", { x: 1260, y: 340, w: 480, h: 240 }, { fontSize: 200, letterSpacing: -8 }),
      makeText("caption", "resolution — vector to PDF and PPTX", { x: 1260, y: 660, w: 440, h: 80 }),
    ]),
    makeSlide("Close", [
      makeShape("rect", { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H }, { fill: "surface" }),
      makeText("subheading", "“Whitespace is not empty. It is where the reader breathes.”", { x: 260, y: 400, w: 1400, h: 240 }, { align: "center", fontSize: 64 }),
      makeText("kicker", "Fin", { x: 860, y: 720, w: 200, h: 40 }, { align: "center" }),
    ], "surface"),
  ];

  return {
    version: AST_VERSION,
    id: nanoid(10),
    title: "Untitled deck",
    theme: NOIR,
    slides,
    createdAt: now,
    updatedAt: now,
  };
}

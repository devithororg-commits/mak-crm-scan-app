/**
 * Slide AST — the single source of truth for every deck.
 *
 * Coordinates live in a fixed 1920x1080 design space. Renderers
 * (canvas editor, thumbnails, presenter, exporters) scale from here.
 * Colors may be a theme token key ("foreground", "accent", ...) or a raw CSS color.
 */
import { z } from "zod";

export const SLIDE_W = 1920;
export const SLIDE_H = 1080;
export const AST_VERSION = 1 as const;

export const ThemeColorKey = z.enum([
  "background",
  "surface",
  "foreground",
  "muted",
  "accent",
  "line",
]);
export type ThemeColorKey = z.infer<typeof ThemeColorKey>;

export const ColorRef = z.string().min(1); // token key or css color
export type ColorRef = z.infer<typeof ColorRef>;

export const FontRole = z.enum(["display", "body", "mono"]);
export type FontRole = z.infer<typeof FontRole>;

export const ThemeSchema = z.object({
  id: z.string(),
  name: z.string(),
  colors: z.object({
    background: z.string(),
    surface: z.string(),
    foreground: z.string(),
    muted: z.string(),
    accent: z.string(),
    line: z.string(),
  }),
  fonts: z.object({
    display: z.string(),
    body: z.string(),
    mono: z.string(),
  }),
});
export type Theme = z.infer<typeof ThemeSchema>;

// ---- paint ---------------------------------------------------------------

export const GradientStopSchema = z.object({
  offset: z.number().min(0).max(1),
  color: ColorRef,
});
export type GradientStop = z.infer<typeof GradientStopSchema>;

export const GradientSchema = z.object({
  type: z.enum(["linear", "radial"]),
  angle: z.number().default(90),
  stops: z.array(GradientStopSchema).min(2),
});
export type Gradient = z.infer<typeof GradientSchema>;

export const PaintSchema = z.union([ColorRef, GradientSchema]);
export type Paint = z.infer<typeof PaintSchema>;

export const isGradient = (p: Paint | undefined): p is Gradient => typeof p === "object" && p !== null && "stops" in p;

export const ShadowSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(16),
  blur: z.number().min(0).default(32),
  color: ColorRef.default("#000000"),
  opacity: z.number().min(0).max(1).default(0.45),
});
export type Shadow = z.infer<typeof ShadowSchema>;

export const StrokeStyle = z.enum(["solid", "dashed", "dotted"]);
export type StrokeStyle = z.infer<typeof StrokeStyle>;
export const StrokeAlign = z.enum(["inside", "center", "outside"]);
export type StrokeAlign = z.infer<typeof StrokeAlign>;

/** Uniform radius or [top-left, top-right, bottom-right, bottom-left]. */
export const CornerRadius = z.union([
  z.number().min(0),
  z.tuple([z.number().min(0), z.number().min(0), z.number().min(0), z.number().min(0)]),
]);
export type CornerRadius = z.infer<typeof CornerRadius>;

// ---- blocks --------------------------------------------------------------

const Frame = {
  x: z.number(),
  y: z.number(),
  w: z.number().positive(),
  h: z.number().positive(),
  rotation: z.number().default(0),
};

const BlockBase = z.object({
  id: z.string(),
  name: z.string().optional(),
  ...Frame,
  opacity: z.number().min(0).max(1).default(1),
  locked: z.boolean().default(false),
  lockAspect: z.boolean().default(false),
  shadow: ShadowSchema.optional(),
});

const StrokeFields = {
  stroke: ColorRef.optional(),
  strokeWidth: z.number().min(0).default(0),
  strokeStyle: StrokeStyle.default("solid"),
  strokeAlign: StrokeAlign.default("center"),
};

export const TextRole = z.enum(["display", "heading", "subheading", "body", "caption", "kicker"]);
export type TextRole = z.infer<typeof TextRole>;

export const TextBlockSchema = BlockBase.extend({
  type: z.literal("text"),
  role: TextRole.default("body"),
  text: z.string(),
  font: FontRole.default("body"),
  /** Explicit family override; when set it wins over the theme role. */
  fontFamily: z.string().optional(),
  fontSize: z.number().positive(),
  fontWeight: z.number().int().min(100).max(900).default(400),
  italic: z.boolean().default(false),
  lineHeight: z.number().positive().default(1.15),
  letterSpacing: z.number().default(0),
  align: z.enum(["left", "center", "right"]).default("left"),
  verticalAlign: z.enum(["top", "middle", "bottom"]).default("top"),
  color: ColorRef.default("foreground"),
  uppercase: z.boolean().default(false),
});
export type TextBlock = z.infer<typeof TextBlockSchema>;

export const ShapeBlockSchema = BlockBase.extend({
  type: z.literal("shape"),
  shape: z.enum(["rect", "ellipse", "line"]),
  fill: PaintSchema.default("accent"),
  ...StrokeFields,
  cornerRadius: CornerRadius.default(0),
});
export type ShapeBlock = z.infer<typeof ShapeBlockSchema>;

export const ImageBlockSchema = BlockBase.extend({
  type: z.literal("image"),
  src: z.string(),
  fit: z.enum(["cover", "contain", "fill"]).default("cover"),
  cornerRadius: CornerRadius.default(0),
  ...StrokeFields,
  alt: z.string().optional(),
});
export type ImageBlock = z.infer<typeof ImageBlockSchema>;

export const LeafBlockSchema = z.discriminatedUnion("type", [
  TextBlockSchema,
  ShapeBlockSchema,
  ImageBlockSchema,
]);
export type LeafBlock = z.infer<typeof LeafBlockSchema>;

/** Children are positioned relative to the group's top-left corner. */
export const GroupBlockSchema = BlockBase.extend({
  type: z.literal("group"),
  children: z.array(LeafBlockSchema).min(1),
});
export type GroupBlock = z.infer<typeof GroupBlockSchema>;

export const BlockSchema = z.discriminatedUnion("type", [
  TextBlockSchema,
  ShapeBlockSchema,
  ImageBlockSchema,
  GroupBlockSchema,
]);
export type Block = z.infer<typeof BlockSchema>;
export type BlockType = Block["type"];

// ---- slides & deck -------------------------------------------------------

export const TransitionSchema = z.object({
  type: z.enum(["none", "fade", "slide", "zoom"]).default("fade"),
  duration: z.number().min(0).default(500),
  delay: z.number().min(0).default(0),
  easing: z.string().default("cubic-bezier(0.2, 0.7, 0.2, 1)"),
});
export type Transition = z.infer<typeof TransitionSchema>;

export const DEFAULT_TRANSITION: Transition = { type: "fade", duration: 500, delay: 0, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" };

export const SlideSchema = z.object({
  id: z.string(),
  name: z.string().default("Untitled"),
  background: ColorRef.default("background"),
  blocks: z.array(BlockSchema),
  notes: z.string().default(""),
  transition: TransitionSchema.default(DEFAULT_TRANSITION),
});
export type Slide = z.infer<typeof SlideSchema>;

export const DeckSchema = z.object({
  version: z.literal(AST_VERSION),
  id: z.string(),
  title: z.string(),
  theme: ThemeSchema,
  slides: z.array(SlideSchema).min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Deck = z.infer<typeof DeckSchema>;

export function parseDeck(input: unknown): Deck {
  return DeckSchema.parse(input);
}

export function safeParseDeck(input: unknown): Deck | null {
  const r = DeckSchema.safeParse(input);
  return r.success ? r.data : null;
}

/** Resolve a color reference against a theme. */
export function resolveColor(ref: ColorRef | undefined, theme: Theme): string {
  if (!ref) return "transparent";
  const key = ref as ThemeColorKey;
  return (theme.colors as Record<string, string>)[key] ?? ref;
}

export function resolveFont(role: FontRole, theme: Theme, override?: string): string {
  return override || theme.fonts[role];
}

/** Every distinct font family a slide needs beyond the theme's own. */
export function slideFontFamilies(slide: Slide): string[] {
  const out = new Set<string>();
  const visit = (b: Block) => {
    if (b.type === "text" && b.fontFamily) out.add(b.fontFamily);
    if (b.type === "group") b.children.forEach(visit);
  };
  slide.blocks.forEach(visit);
  return [...out];
}

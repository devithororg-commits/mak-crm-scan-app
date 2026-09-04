import { nanoid } from "nanoid";
import {
  ALL_DECK_TEMPLATES,
  getDeckTemplateCount,
  SLIDE_LAYOUT_TEMPLATES,
  TEMPLATE_CATEGORIES,
} from "./template-catalog";
import type { Block, Deck, Slide } from "./schema";
import { AST_VERSION } from "./schema";

export type { DeckTemplate, SlideTemplate, TemplateCategory } from "./template-types";
export { getDeckTemplateCount, TEMPLATE_CATEGORIES };

export const DECK_TEMPLATES = ALL_DECK_TEMPLATES;
export const SLIDE_TEMPLATES = SLIDE_LAYOUT_TEMPLATES;

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

export function buildDeckFromTemplate(t: (typeof ALL_DECK_TEMPLATES)[number]): Deck {
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

export function getDeckTemplate(id: string) {
  return DECK_TEMPLATES.find((t) => t.id === id);
}

export function getSlideTemplate(id: string) {
  return SLIDE_TEMPLATES.find((t) => t.id === id);
}

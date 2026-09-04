import type { Slide, Theme } from "./schema";

export type TemplateCategory =
  | "business"
  | "marketing"
  | "creative"
  | "report"
  | "startup"
  | "luxury"
  | "minimal"
  | "education";

export type DeckTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  theme: Theme;
  title: string;
  premium: boolean;
  build: () => Slide[];
};

export type SlideTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  build: () => Slide;
};

export type TemplateStyle =
  | "split"
  | "gradient"
  | "minimal"
  | "bold"
  | "glass"
  | "editorial"
  | "fullbleed";

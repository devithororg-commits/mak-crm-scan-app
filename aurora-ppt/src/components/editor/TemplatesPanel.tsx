import { useMemo, useState } from "react";
import { LayoutTemplate, Search } from "lucide-react";
import {
  DECK_TEMPLATES,
  SLIDE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "@/lib/ast/templates";
import { useEditor } from "@/lib/editor/store";
import { SlideStage } from "./canvas/SlideStage";

const THUMB_W = 212;
const THUMB_H = Math.round((THUMB_W * 9) / 16);

type TemplatesMode = "decks" | "slides";

export function TemplatesPanel() {
  const deck = useEditor((s) => s.deck);
  const applyDeckTemplate = useEditor((s) => s.applyDeckTemplate);
  const insertSlideTemplate = useEditor((s) => s.insertSlideTemplate);
  const [mode, setMode] = useState<TemplatesMode>("decks");
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  const deckItems = useMemo(() => {
    return DECK_TEMPLATES.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.includes(q)
      );
    });
  }, [category, q]);

  const slideItems = useMemo(() => {
    return SLIDE_TEMPLATES.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.includes(q)
      );
    });
  }, [category, q]);

  const applyDeck = (id: string, name: string) => {
    const ok = window.confirm(`Replace your deck with "${name}"? Current work will be lost unless saved.`);
    if (ok) applyDeckTemplate(id);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-4 pt-2 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="field h-8 w-full pl-8 text-xs"
            placeholder="Search templates…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search templates"
          />
        </div>
      </div>

      <div className="flex gap-1 px-3 pb-2">
        <button
          className="flex flex-1 items-center justify-center rounded-sm py-1.5 text-[10px] font-semibold uppercase tracking-wider data-[active=true]:bg-secondary data-[active=true]:text-foreground text-muted-foreground"
          data-active={mode === "decks"}
          onClick={() => setMode("decks")}
        >
          Full decks
        </button>
        <button
          className="flex flex-1 items-center justify-center rounded-sm py-1.5 text-[10px] font-semibold uppercase tracking-wider data-[active=true]:bg-secondary data-[active=true]:text-foreground text-muted-foreground"
          data-active={mode === "slides"}
          onClick={() => setMode("slides")}
        >
          Slide layouts
        </button>
      </div>

      <div className="scrollbar-thin flex gap-1 overflow-x-auto px-3 pb-3">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide data-[active=true]:border-accent data-[active=true]:bg-accent/10 data-[active=true]:text-accent text-muted-foreground"
            data-active={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {mode === "decks" &&
          deckItems.map((t) => {
            const preview = t.build()[0]!;
            const theme = t.theme;
            return (
              <button
                key={t.id}
                type="button"
                className="group w-full text-left"
                onClick={() => applyDeck(t.id, t.name)}
              >
                <div className="mb-1.5 flex items-start gap-2">
                  <LayoutTemplate className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent opacity-70" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-medium leading-tight">{t.name}</span>
                    <span className="block text-[10px] leading-snug text-muted-foreground">{t.description}</span>
                  </div>
                  <span className="shrink-0 font-mono text-[9px] uppercase text-muted-foreground">{t.category}</span>
                </div>
                <div
                  className="overflow-hidden rounded-sm ring-1 ring-border transition-shadow group-hover:ring-accent/60"
                  style={{ width: THUMB_W, height: THUMB_H }}
                >
                  <SlideStage slide={preview} theme={theme} width={THUMB_W} height={THUMB_H} />
                </div>
              </button>
            );
          })}

        {mode === "slides" &&
          slideItems.map((t) => {
            const preview = t.build();
            return (
              <button
                key={t.id}
                type="button"
                className="group w-full text-left"
                onClick={() => insertSlideTemplate(t.id)}
              >
                <div className="mb-1.5 flex items-start gap-2">
                  <LayoutTemplate className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent opacity-70" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-medium leading-tight">{t.name}</span>
                    <span className="block text-[10px] leading-snug text-muted-foreground">{t.description}</span>
                  </div>
                </div>
                <div
                  className="overflow-hidden rounded-sm ring-1 ring-border transition-shadow group-hover:ring-accent/60"
                  style={{ width: THUMB_W, height: THUMB_H }}
                >
                  <SlideStage slide={preview} theme={deck.theme} width={THUMB_W} height={THUMB_H} />
                </div>
              </button>
            );
          })}

        {mode === "decks" && deckItems.length === 0 && (
          <p className="py-8 text-center text-[11px] text-muted-foreground">No deck templates match</p>
        )}
        {mode === "slides" && slideItems.length === 0 && (
          <p className="py-8 text-center text-[11px] text-muted-foreground">No slide layouts match</p>
        )}
      </div>
    </div>
  );
}

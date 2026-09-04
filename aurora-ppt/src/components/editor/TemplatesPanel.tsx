import { useMemo, useState } from "react";
import { Crown, LayoutTemplate, Search, Sparkles } from "lucide-react";
import {
  DECK_TEMPLATES,
  getDeckTemplateCount,
  SLIDE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "@/lib/ast/templates";
import { useEditor } from "@/lib/editor/store";
import { SlideStage } from "./canvas/SlideStage";

const THUMB_W = 132;
const THUMB_H = Math.round((THUMB_W * 9) / 16);

type TemplatesMode = "decks" | "slides";

export function TemplatesPanel() {
  const deck = useEditor((s) => s.deck);
  const applyDeckTemplate = useEditor((s) => s.applyDeckTemplate);
  const insertSlideTemplate = useEditor((s) => s.insertSlideTemplate);
  const [mode, setMode] = useState<TemplatesMode>("decks");
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const q = query.trim().toLowerCase();
  const totalDecks = getDeckTemplateCount();

  const deckItems = useMemo(() => {
    return DECK_TEMPLATES.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (showPremiumOnly && !t.premium) return false;
      if (!q) return true;
      const hay = [t.name, t.description, t.category, ...t.tags].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [category, q, showPremiumOnly]);

  const slideItems = useMemo(() => {
    return SLIDE_TEMPLATES.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      const hay = [t.name, t.description, t.category, ...t.tags].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [category, q]);

  const applyDeck = (id: string, name: string) => {
    const ok = window.confirm(`Replace your deck with "${name}"? Current work will be lost unless saved.`);
    if (ok) applyDeckTemplate(id);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-3 pt-1 pb-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Premium library</span>
          <span className="font-mono text-[9px] tabular-nums text-accent">{totalDecks}+ decks</span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            className="field h-8 w-full pl-8 text-xs"
            placeholder="Search 100+ templates…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search templates"
          />
        </div>
      </div>

      <div className="flex gap-1 px-3 pb-2">
        <button
          className="flex flex-1 items-center justify-center gap-1 rounded-sm py-1.5 text-[9px] font-semibold uppercase tracking-wider data-[active=true]:bg-accent data-[active=true]:text-accent-foreground text-muted-foreground"
          data-active={mode === "decks"}
          onClick={() => setMode("decks")}
        >
          <Sparkles className="!h-3 !w-3" /> Decks
        </button>
        <button
          className="flex flex-1 items-center justify-center rounded-sm py-1.5 text-[9px] font-semibold uppercase tracking-wider data-[active=true]:bg-accent data-[active=true]:text-accent-foreground text-muted-foreground"
          data-active={mode === "slides"}
          onClick={() => setMode("slides")}
        >
          <LayoutTemplate className="!h-3 !w-3" /> Layouts
        </button>
      </div>

      {mode === "decks" && (
        <div className="px-3 pb-2">
          <button
            className="flex w-full items-center justify-center gap-1.5 rounded-sm border py-1.5 text-[9px] font-semibold uppercase tracking-wide data-[active=true]:border-accent data-[active=true]:bg-accent/10 data-[active=true]:text-accent text-muted-foreground"
            data-active={showPremiumOnly}
            onClick={() => setShowPremiumOnly((v) => !v)}
          >
            <Crown className="!h-3 !w-3" /> Curated premium only
          </button>
        </div>
      )}

      <div className="scrollbar-thin flex gap-1 overflow-x-auto px-3 pb-2">
        {TEMPLATE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            className="shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide data-[active=true]:border-accent data-[active=true]:bg-accent/10 data-[active=true]:text-accent text-muted-foreground"
            data-active={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="px-3 pb-2 font-mono text-[9px] tabular-nums text-muted-foreground">
        {mode === "decks" ? `${deckItems.length} templates` : `${slideItems.length} layouts`}
      </p>

      <div className="scrollbar-thin grid flex-1 grid-cols-2 gap-2 overflow-y-auto px-3 pb-4 content-start">
        {mode === "decks" &&
          deckItems.map((t) => {
            const preview = t.build()[0]!;
            return (
              <button
                key={t.id}
                type="button"
                className="group relative text-left"
                onClick={() => applyDeck(t.id, t.name)}
                title={t.description}
              >
                <div
                  className="relative overflow-hidden rounded-sm ring-1 ring-border transition-all group-hover:ring-accent group-hover:shadow-[0_8px_24px_-8px_rgba(212,163,115,0.45)]"
                  style={{ width: THUMB_W, height: THUMB_H }}
                >
                  <SlideStage slide={preview} theme={t.theme} width={THUMB_W} height={THUMB_H} />
                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-transparent to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-sm bg-accent px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-accent-foreground">Use</span>
                  </div>
                  {t.premium && (
                    <span className="absolute top-1 right-1 rounded-sm bg-black/60 px-1 py-0.5 text-[7px] font-bold uppercase tracking-wide text-accent">
                      Pro
                    </span>
                  )}
                </div>
                <span className="mt-1 block truncate text-[10px] font-medium leading-tight">{t.name}</span>
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
                className="group relative text-left"
                onClick={() => insertSlideTemplate(t.id)}
                title={t.description}
              >
                <div
                  className="relative overflow-hidden rounded-sm ring-1 ring-border transition-all group-hover:ring-accent"
                  style={{ width: THUMB_W, height: THUMB_H }}
                >
                  <SlideStage slide={preview} theme={deck.theme} width={THUMB_W} height={THUMB_H} />
                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded-sm bg-accent px-2 py-0.5 text-[8px] font-bold uppercase text-accent-foreground">Insert</span>
                  </div>
                </div>
                <span className="mt-1 block truncate text-[10px] font-medium">{t.name}</span>
              </button>
            );
          })}

        {mode === "decks" && deckItems.length === 0 && (
          <p className="col-span-2 py-8 text-center text-[11px] text-muted-foreground">No templates match</p>
        )}
        {mode === "slides" && slideItems.length === 0 && (
          <p className="col-span-2 py-8 text-center text-[11px] text-muted-foreground">No layouts match</p>
        )}
      </div>
    </div>
  );
}

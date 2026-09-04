import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import { createSampleDeck, makeSlide } from "@/lib/ast/defaults";
import { buildDeckFromTemplate, cloneSlide, getDeckTemplate, getSlideTemplate } from "@/lib/ast/templates";
import { safeParseDeck, type Block, type Deck, type LeafBlock, type Slide, type Theme } from "@/lib/ast/schema";
import { alignBlocks, distributeBlocks, explodeGroup, makeGroup, type AlignMode } from "./geometry";

const HISTORY_LIMIT = 80;

type Snapshot = { deck: Deck; slideId: string };

export type Viewport = "desktop" | "tablet" | "mobile";

export type EditorState = {
  deck: Deck;
  slideId: string;
  selection: string[];
  editingId: string | null;
  zoom: number; // 1 = fit
  pan: { x: number; y: number };
  viewport: Viewport;
  presenting: boolean;
  clipboard: Block[];
  past: Snapshot[];
  future: Snapshot[];
  hydrated: boolean;
  markHydrated: () => void;

  // selectors
  slide: () => Slide;
  slideIndex: () => number;
  selectedBlocks: () => Block[];

  // navigation
  setSlide: (id: string) => void;
  select: (ids: string[], additive?: boolean) => void;
  clearSelection: () => void;
  setEditing: (id: string | null) => void;
  setZoom: (z: number) => void;
  setPan: (p: { x: number; y: number }) => void;
  setViewport: (v: Viewport) => void;
  setPresenting: (p: boolean) => void;

  // deck-level
  setTitle: (t: string) => void;
  setTheme: (theme: Theme) => void;
  replaceDeck: (deck: Deck) => void;
  resetDeck: () => void;
  applyDeckTemplate: (templateId: string) => void;
  insertSlideTemplate: (templateId: string) => void;

  // slides
  addSlide: () => void;
  duplicateSlide: (id: string) => void;
  deleteSlide: (id: string) => void;
  moveSlide: (from: number, to: number) => void;
  updateSlide: (id: string, patch: Partial<Omit<Slide, "id" | "blocks">>) => void;

  // blocks
  addBlock: (block: Block) => void;
  updateBlock: (id: string, patch: Partial<Block>, opts?: { history?: boolean }) => void;
  updateBlocks: (patches: Record<string, Partial<Block>>, opts?: { history?: boolean }) => void;
  deleteBlocks: (ids: string[]) => void;
  duplicateBlocks: (ids: string[]) => void;
  reorderBlock: (id: string, dir: "front" | "back" | "forward" | "backward") => void;
  align: (mode: AlignMode) => void;
  distribute: (axis: "x" | "y") => void;
  group: () => void;
  ungroup: () => void;
  toggleLock: (ids: string[]) => void;
  copy: () => void;
  paste: () => void;

  // history
  commit: () => void;
  undo: () => void;
  redo: () => void;
};

const touch = (deck: Deck): Deck => ({ ...deck, updatedAt: new Date().toISOString() });

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => {
      const mutateDeck = (fn: (d: Deck) => Deck, history = true) => {
        const s = get();
        const past = history
          ? [...s.past, { deck: s.deck, slideId: s.slideId }].slice(-HISTORY_LIMIT)
          : s.past;
        set({ deck: touch(fn(s.deck)), past, future: history ? [] : s.future });
      };

      const mutateSlide = (fn: (sl: Slide) => Slide, history = true, slideId?: string) => {
        const id = slideId ?? get().slideId;
        mutateDeck((d) => ({ ...d, slides: d.slides.map((sl) => (sl.id === id ? fn(sl) : sl)) }), history);
      };

      const initial = createSampleDeck();

      return {
        deck: initial,
        slideId: initial.slides[0]!.id,
        selection: [],
        editingId: null,
        zoom: 1,
        pan: { x: 0, y: 0 },
        viewport: "desktop",
        presenting: false,
        clipboard: [],
        past: [],
        future: [],
        hydrated: false,
        markHydrated: () => set({ hydrated: true }),

        slide: () => {
          const { deck, slideId } = get();
          return deck.slides.find((s) => s.id === slideId) ?? deck.slides[0]!;
        },
        slideIndex: () => {
          const { deck, slideId } = get();
          return Math.max(0, deck.slides.findIndex((s) => s.id === slideId));
        },
        selectedBlocks: () => {
          const sel = get().selection;
          return get().slide().blocks.filter((b) => sel.includes(b.id));
        },

        setSlide: (id) => set({ slideId: id, selection: [], editingId: null }),
        select: (ids, additive) =>
          set((s) => {
            if (!additive) return { selection: ids };
            const next = new Set(s.selection);
            ids.forEach((id) => (next.has(id) ? next.delete(id) : next.add(id)));
            return { selection: [...next] };
          }),
        clearSelection: () => set({ selection: [], editingId: null }),
        setEditing: (id) => set({ editingId: id, selection: id ? [id] : get().selection }),
        setZoom: (z) => set({ zoom: Math.min(6, Math.max(0.1, z)) }),
        setPan: (pan) => set({ pan }),
        setViewport: (viewport) => set({ viewport }),
        setPresenting: (p) => set({ presenting: p, editingId: null }),

        setTitle: (t) => mutateDeck((d) => ({ ...d, title: t }), false),
        setTheme: (theme) => mutateDeck((d) => ({ ...d, theme })),
        replaceDeck: (deck) => set({ deck, slideId: deck.slides[0]!.id, selection: [], past: [], future: [] }),
        resetDeck: () => {
          const deck = createSampleDeck();
          set({ deck, slideId: deck.slides[0]!.id, selection: [], past: [], future: [] });
        },
        applyDeckTemplate: (templateId) => {
          const t = getDeckTemplate(templateId);
          if (!t) return;
          const deck = buildDeckFromTemplate(t);
          set({ deck, slideId: deck.slides[0]!.id, selection: [], editingId: null, past: [], future: [] });
        },
        insertSlideTemplate: (templateId) => {
          const t = getSlideTemplate(templateId);
          if (!t) return;
          const sl = cloneSlide(t.build());
          const idx = get().slideIndex();
          mutateDeck((d) => {
            const slides = [...d.slides];
            slides.splice(idx + 1, 0, sl);
            return { ...d, slides };
          });
          set({ slideId: sl.id, selection: [] });
        },

        addSlide: () => {
          const sl = makeSlide(`Slide ${get().deck.slides.length + 1}`);
          const idx = get().slideIndex();
          mutateDeck((d) => {
            const slides = [...d.slides];
            slides.splice(idx + 1, 0, sl);
            return { ...d, slides };
          });
          set({ slideId: sl.id, selection: [] });
        },
        duplicateSlide: (id) => {
          const src = get().deck.slides.find((s) => s.id === id);
          if (!src) return;
          const copy: Slide = {
            ...structuredClone(src),
            id: nanoid(8),
            name: `${src.name} copy`,
            blocks: src.blocks.map((b) => ({ ...structuredClone(b), id: nanoid(8) })),
          };
          mutateDeck((d) => {
            const i = d.slides.findIndex((s) => s.id === id);
            const slides = [...d.slides];
            slides.splice(i + 1, 0, copy);
            return { ...d, slides };
          });
          set({ slideId: copy.id, selection: [] });
        },
        deleteSlide: (id) => {
          const { deck } = get();
          if (deck.slides.length <= 1) return;
          const i = deck.slides.findIndex((s) => s.id === id);
          mutateDeck((d) => ({ ...d, slides: d.slides.filter((s) => s.id !== id) }));
          const next = get().deck.slides[Math.max(0, i - 1)]!;
          set({ slideId: next.id, selection: [] });
        },
        moveSlide: (from, to) =>
          mutateDeck((d) => {
            const slides = [...d.slides];
            const [m] = slides.splice(from, 1);
            slides.splice(to, 0, m!);
            return { ...d, slides };
          }),
        updateSlide: (id, patch) => mutateSlide((sl) => ({ ...sl, ...patch }), true, id),

        addBlock: (block) => {
          mutateSlide((sl) => ({ ...sl, blocks: [...sl.blocks, block] }));
          set({ selection: [block.id] });
        },
        updateBlock: (id, patch, opts) =>
          mutateSlide(
            (sl) => ({
              ...sl,
              blocks: sl.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
            }),
            opts?.history ?? true,
          ),
        updateBlocks: (patches, opts) =>
          mutateSlide(
            (sl) => ({
              ...sl,
              blocks: sl.blocks.map((b) => (patches[b.id] ? ({ ...b, ...patches[b.id] } as Block) : b)),
            }),
            opts?.history ?? true,
          ),
        deleteBlocks: (ids) => {
          if (!ids.length) return;
          const set_ = new Set(ids);
          mutateSlide((sl) => ({ ...sl, blocks: sl.blocks.filter((b) => !set_.has(b.id)) }));
          set({ selection: [], editingId: null });
        },
        duplicateBlocks: (ids) => {
          const sl = get().slide();
          const copies = sl.blocks
            .filter((b) => ids.includes(b.id))
            .map((b) => ({ ...structuredClone(b), id: nanoid(8), x: b.x + 40, y: b.y + 40 }) as Block);
          if (!copies.length) return;
          mutateSlide((s) => ({ ...s, blocks: [...s.blocks, ...copies] }));
          set({ selection: copies.map((c) => c.id) });
        },
        reorderBlock: (id, dir) =>
          mutateSlide((sl) => {
            const blocks = [...sl.blocks];
            const i = blocks.findIndex((b) => b.id === id);
            if (i < 0) return sl;
            const [b] = blocks.splice(i, 1);
            const target =
              dir === "front" ? blocks.length : dir === "back" ? 0 : dir === "forward" ? Math.min(blocks.length, i + 1) : Math.max(0, i - 1);
            blocks.splice(target, 0, b!);
            return { ...sl, blocks };
          }),
        align: (mode) => {
          const blocks = get().selectedBlocks();
          if (!blocks.length) return;
          get().updateBlocks(alignBlocks(blocks, mode));
        },
        distribute: (axis) => {
          const patches = distributeBlocks(get().selectedBlocks(), axis);
          if (Object.keys(patches).length) get().updateBlocks(patches);
        },
        group: () => {
          const sel = get().selectedBlocks();
          // flatten any nested groups first so groups stay one level deep
          const leaves: LeafBlock[] = sel.flatMap((b) => (b.type === "group" ? explodeGroup(b) : [b]));
          if (leaves.length < 2) return;
          const g = makeGroup(leaves);
          const ids = new Set(sel.map((b) => b.id));
          mutateSlide((sl) => {
            const firstIdx = sl.blocks.findIndex((b) => ids.has(b.id));
            const rest = sl.blocks.filter((b) => !ids.has(b.id));
            rest.splice(Math.max(0, firstIdx), 0, g);
            return { ...sl, blocks: rest };
          });
          set({ selection: [g.id] });
        },
        ungroup: () => {
          const groups = get().selectedBlocks().filter((b) => b.type === "group");
          if (!groups.length) return;
          const out: string[] = [];
          mutateSlide((sl) => {
            const blocks: Block[] = [];
            for (const b of sl.blocks) {
              const g = groups.find((x) => x.id === b.id);
              if (g && g.type === "group") {
                const kids = explodeGroup(g);
                out.push(...kids.map((k) => k.id));
                blocks.push(...kids);
              } else blocks.push(b);
            }
            return { ...sl, blocks };
          });
          set({ selection: out });
        },
        toggleLock: (ids) => {
          const blocks = get().slide().blocks.filter((b) => ids.includes(b.id));
          const allLocked = blocks.every((b) => b.locked);
          const patches: Record<string, Partial<Block>> = {};
          for (const b of blocks) patches[b.id] = { locked: !allLocked };
          get().updateBlocks(patches);
        },
        copy: () => set({ clipboard: structuredClone(get().selectedBlocks()) }),
        paste: () => {
          const { clipboard } = get();
          if (!clipboard.length) return;
          const copies = clipboard.map((b) => ({ ...structuredClone(b), id: nanoid(8), x: b.x + 40, y: b.y + 40 }) as Block);
          mutateSlide((s) => ({ ...s, blocks: [...s.blocks, ...copies] }));
          set({ selection: copies.map((c) => c.id), clipboard: copies });
        },



        commit: () =>
          set((s) => ({
            past: [...s.past, { deck: s.deck, slideId: s.slideId }].slice(-HISTORY_LIMIT),
            future: [],
          })),
        undo: () => {
          const s = get();
          const prev = s.past[s.past.length - 1];
          if (!prev) return;
          set({
            deck: prev.deck,
            slideId: prev.slideId,
            past: s.past.slice(0, -1),
            future: [{ deck: s.deck, slideId: s.slideId }, ...s.future],
            selection: [],
            editingId: null,
          });
        },
        redo: () => {
          const s = get();
          const next = s.future[0];
          if (!next) return;
          set({
            deck: next.deck,
            slideId: next.slideId,
            future: s.future.slice(1),
            past: [...s.past, { deck: s.deck, slideId: s.slideId }],
            selection: [],
            editingId: null,
          });
        },
      };
    },
    {
      name: "aurora-deck-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ deck: s.deck, slideId: s.slideId }),
      merge: (persisted, current) => {
        const p = persisted as Partial<Pick<EditorState, "deck" | "slideId">> | undefined;
        const deck = p?.deck ? safeParseDeck(p.deck) : null;
        if (!deck) return current;
        const slideId = deck.slides.some((s) => s.id === p?.slideId) ? p!.slideId! : deck.slides[0]!.id;
        return { ...current, deck, slideId };
      },
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);

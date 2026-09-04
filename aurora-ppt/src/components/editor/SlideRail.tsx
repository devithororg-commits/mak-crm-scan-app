import { useMemo, useState } from "react";
import { Copy, Eye, EyeOff, Layers, LayoutTemplate, Plus, Search, Trash2 } from "lucide-react";
import { useEditor } from "@/lib/editor/store";
import { blockLabel } from "@/lib/editor/blockLabel";
import { SlideStage } from "./canvas/SlideStage";
import { TemplatesPanel } from "./TemplatesPanel";

const THUMB_W = 196;
const THUMB_H = Math.round((THUMB_W * 9) / 16);

type RailTab = "slides" | "layers" | "templates";

export function SlideRail() {
  const deck = useEditor((s) => s.deck);
  const slideId = useEditor((s) => s.slideId);
  const selection = useEditor((s) => s.selection);
  const setSlide = useEditor((s) => s.setSlide);
  const addSlide = useEditor((s) => s.addSlide);
  const duplicateSlide = useEditor((s) => s.duplicateSlide);
  const deleteSlide = useEditor((s) => s.deleteSlide);
  const moveSlide = useEditor((s) => s.moveSlide);
  const select = useEditor((s) => s.select);
  const toggleLock = useEditor((s) => s.toggleLock);
  const [tab, setTab] = useState<RailTab>("slides");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [layerQuery, setLayerQuery] = useState("");

  const slide = deck.slides.find((s) => s.id === slideId) ?? deck.slides[0]!;
  const layers = useMemo(() => {
    const q = layerQuery.trim().toLowerCase();
    const list = [...slide.blocks].reverse();
    if (!q) return list;
    return list.filter((b) => blockLabel(b).toLowerCase().includes(q) || b.type.includes(q));
  }, [slide.blocks, layerQuery]);

  return (
    <aside className="panel flex h-full w-[248px] shrink-0 flex-col border-r">
      <div className="flex gap-1 px-3 pt-3">
        <button
          className="flex flex-1 items-center justify-center gap-1 rounded-sm py-1.5 text-[10px] font-semibold uppercase tracking-wider data-[active=true]:bg-secondary data-[active=true]:text-foreground text-muted-foreground"
          data-active={tab === "slides"}
          onClick={() => setTab("slides")}
        >
          Slides
        </button>
        <button
          className="flex flex-1 items-center justify-center gap-1 rounded-sm py-1.5 text-[10px] font-semibold uppercase tracking-wider data-[active=true]:bg-secondary data-[active=true]:text-foreground text-muted-foreground"
          data-active={tab === "layers"}
          onClick={() => setTab("layers")}
        >
          <Layers className="!h-3 !w-3" />
        </button>
        <button
          className="flex flex-1 items-center justify-center gap-1 rounded-sm py-1.5 text-[10px] font-semibold uppercase tracking-wider data-[active=true]:bg-secondary data-[active=true]:text-foreground text-muted-foreground"
          data-active={tab === "templates"}
          onClick={() => setTab("templates")}
          title="Templates"
        >
          <LayoutTemplate className="!h-3 !w-3" />
        </button>
      </div>

      {tab === "slides" && (
        <>
          <div className="flex items-center justify-between px-4 pt-2 pb-2">
            <span className="eyebrow">Slides · {deck.slides.length}</span>
            <button className="tool-btn" onClick={addSlide} title="New slide (N)">
              <Plus />
            </button>
          </div>
          <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 pb-4">
            {deck.slides.map((sl, i) => {
              const active = sl.id === slideId;
              return (
                <div
                  key={sl.id}
                  draggable
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverIdx(i);
                  }}
                  onDragLeave={() => setOverIdx(null)}
                  onDrop={() => {
                    if (dragIdx !== null && dragIdx !== i) moveSlide(dragIdx, i);
                    setDragIdx(null);
                    setOverIdx(null);
                  }}
                  onDragEnd={() => {
                    setDragIdx(null);
                    setOverIdx(null);
                  }}
                  onClick={() => setSlide(sl.id)}
                  className="group relative cursor-pointer"
                  data-over={overIdx === i && dragIdx !== i}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-[11px] text-muted-foreground">{sl.name}</span>
                    <span className="ml-auto flex opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        className="tool-btn h-6 min-w-6 px-1"
                        title="Duplicate"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSlide(sl.id);
                        }}
                      >
                        <Copy className="!h-3 !w-3" />
                      </button>
                      <button
                        className="tool-btn h-6 min-w-6 px-1 hover:text-destructive"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSlide(sl.id);
                        }}
                      >
                        <Trash2 className="!h-3 !w-3" />
                      </button>
                    </span>
                  </div>
                  <div
                    className="overflow-hidden rounded-sm ring-1 transition-shadow data-[active=true]:ring-2 data-[active=true]:ring-accent"
                    data-active={active}
                    style={{ width: THUMB_W, height: THUMB_H, boxShadow: active ? undefined : "inset 0 0 0 1px var(--color-border)" }}
                  >
                    <SlideStage slide={sl} theme={deck.theme} width={THUMB_W} height={THUMB_H} />
                  </div>
                  {overIdx === i && dragIdx !== null && dragIdx !== i && (
                    <div className="absolute -top-2 right-0 left-0 h-0.5 bg-accent" />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "layers" && (
        <>
          <div className="px-4 pt-2 pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                className="field h-8 w-full pl-8 text-xs"
                placeholder="Search layers…"
                value={layerQuery}
                onChange={(e) => setLayerQuery(e.target.value)}
                aria-label="Search layers"
              />
            </div>
            <span className="mt-2 block eyebrow">{layers.length} on slide</span>
          </div>
          <div className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
            {layers.length === 0 && (
              <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">No layers match</p>
            )}
            {layers.map((b) => {
              const active = selection.includes(b.id);
              return (
                <div
                  key={b.id}
                  className="group flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer data-[active=true]:bg-accent/10 data-[active=true]:text-accent"
                  data-active={active}
                  onClick={() => select([b.id])}
                >
                  <span className="truncate flex-1 text-[11px]">{blockLabel(b)}</span>
                  <span className="font-mono text-[9px] uppercase text-muted-foreground">{b.type}</span>
                  <button
                    className="tool-btn h-6 min-w-6 px-1 opacity-0 group-hover:opacity-100"
                    title={b.locked ? "Unlock" : "Lock"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock([b.id]);
                    }}
                  >
                    {b.locked ? <EyeOff className="!h-3 !w-3" /> : <Eye className="!h-3 !w-3" />}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
      {tab === "templates" && (
        <>
          <div className="px-4 pt-1 pb-1">
            <span className="eyebrow">Templates</span>
          </div>
          <TemplatesPanel />
        </>
      )}
    </aside>
  );
}

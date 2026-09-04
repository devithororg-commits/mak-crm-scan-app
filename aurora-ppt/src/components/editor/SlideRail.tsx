import { useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useEditor } from "@/lib/editor/store";
import { SlideStage } from "./canvas/SlideStage";

const THUMB_W = 196;
const THUMB_H = Math.round((THUMB_W * 9) / 16);

export function SlideRail() {
  const deck = useEditor((s) => s.deck);
  const slideId = useEditor((s) => s.slideId);
  const setSlide = useEditor((s) => s.setSlide);
  const addSlide = useEditor((s) => s.addSlide);
  const duplicateSlide = useEditor((s) => s.duplicateSlide);
  const deleteSlide = useEditor((s) => s.deleteSlide);
  const moveSlide = useEditor((s) => s.moveSlide);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  return (
    <aside className="panel flex h-full w-[248px] shrink-0 flex-col border-r">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
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
    </aside>
  );
}

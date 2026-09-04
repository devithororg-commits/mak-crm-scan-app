import { useEffect } from "react";
import { useEditor } from "@/lib/editor/store";
import { EditorCanvas } from "./canvas/EditorCanvas";
import { Inspector } from "./Inspector";
import { Presenter } from "./Presenter";
import { SlideRail } from "./SlideRail";
import { Toolbar } from "./Toolbar";

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable;
}

export default function Editor() {
  const presenting = useEditor((s) => s.presenting);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useEditor.getState();
      if (s.presenting || s.editingId || isTypingTarget(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? s.redo() : s.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        s.duplicateBlocks(s.selection);
        return;
      }
      if (mod && e.key.toLowerCase() === "a") {
        e.preventDefault();
        s.select(s.slide().blocks.map((b) => b.id));
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && s.selection.length) {
        e.preventDefault();
        s.deleteBlocks(s.selection);
        return;
      }
      if (e.key === "Escape") {
        s.clearSelection();
        return;
      }
      if (e.key.startsWith("Arrow") && s.selection.length) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        const patches: Record<string, { x: number; y: number }> = {};
        for (const b of s.slide().blocks) if (s.selection.includes(b.id)) patches[b.id] = { x: b.x + dx, y: b.y + dy };
        s.updateBlocks(patches);
        return;
      }
      if (!s.selection.length && (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown")) {
        const next = s.deck.slides[s.slideIndex() + 1];
        if (next) s.setSlide(next.id);
      }
      if (!s.selection.length && (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp")) {
        const prev = s.deck.slides[s.slideIndex() - 1];
        if (prev) s.setSlide(prev.id);
      }
      if (e.key.toLowerCase() === "n" && !mod) s.addSlide();
      if (e.key === "F5") {
        e.preventDefault();
        s.setPresenting(true);
      }
      if (mod && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        s.setZoom(s.zoom * 1.2);
      }
      if (mod && e.key === "-") {
        e.preventDefault();
        s.setZoom(s.zoom / 1.2);
      }
      if (mod && e.key === "0") {
        e.preventDefault();
        s.setZoom(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground animate-rise">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <SlideRail />
        <main className="relative min-w-0 flex-1">
          <EditorCanvas />
          <StatusBar />
        </main>
        <Inspector />
      </div>
      {presenting && <Presenter />}
    </div>
  );
}

function StatusBar() {
  const index = useEditor((s) => s.deck.slides.findIndex((sl) => sl.id === s.slideId));
  const total = useEditor((s) => s.deck.slides.length);
  const selection = useEditor((s) => s.selection.length);
  const updatedAt = useEditor((s) => s.deck.updatedAt);
  return (
    <div className="pointer-events-none absolute right-4 bottom-3 left-4 flex items-center justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
      <span>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        {selection > 0 && ` · ${selection} selected`}
      </span>
      <span>1920 × 1080 · saved {new Date(updatedAt).toLocaleTimeString()}</span>
    </div>
  );
}

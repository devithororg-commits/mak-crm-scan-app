import { useEffect, useState } from "react";
import { useEditor } from "@/lib/editor/store";
import { SlideStage } from "./canvas/SlideStage";

export function Presenter() {
  const deck = useEditor((s) => s.deck);
  const slideId = useEditor((s) => s.slideId);
  const setSlide = useEditor((s) => s.setSlide);
  const setPresenting = useEditor((s) => s.setPresenting);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [idle, setIdle] = useState(false);

  const index = Math.max(0, deck.slides.findIndex((s) => s.id === slideId));
  const slide = deck.slides[index]!;

  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    document.documentElement.requestFullscreen?.().catch(() => undefined);
    const onFs = () => {
      if (!document.fullscreenElement) setPresenting(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("fullscreenchange", onFs);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => undefined);
    };
  }, [setPresenting]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const wake = () => {
      setIdle(false);
      clearTimeout(t);
      t = setTimeout(() => setIdle(true), 2000);
    };
    wake();
    window.addEventListener("mousemove", wake);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", wake);
    };
  }, []);

  useEffect(() => {
    const go = (d: number) => {
      const next = deck.slides[index + d];
      if (next) setSlide(next.id);
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown", "Enter"].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Escape") setPresenting(false);
    };
    const onClick = () => go(1);
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [deck.slides, index, setSlide, setPresenting]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas" style={{ cursor: idle ? "none" : "default" }}>
      {size.w > 0 && <SlideStage slide={slide} theme={deck.theme} width={size.w} height={size.h} />}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[11px] tabular-nums text-muted-foreground transition-opacity"
        style={{ opacity: idle ? 0 : 1 }}
      >
        {index + 1} / {deck.slides.length} · Esc to exit
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Layer, Rect, Stage } from "react-konva";
import { SLIDE_H, SLIDE_W, resolveColor, type Slide, type Theme } from "@/lib/ast/schema";
import { BlockNode } from "./BlockNode";
import { ensureThemeFonts } from "./fonts";

/** Static, non-interactive render of a slide — used for thumbnails and presenting. */
export function SlideStage({
  slide,
  theme,
  width,
  height,
  className,
}: {
  slide: Slide;
  theme: Theme;
  width: number;
  height: number;
  className?: string;
}) {
  const scale = Math.min(width / SLIDE_W, height / SLIDE_H);
  const [fontTick, setFontTick] = useState(0);

  useEffect(() => {
    let alive = true;
    ensureThemeFonts(theme).then(() => alive && setFontTick((t) => t + 1));
    return () => {
      alive = false;
    };
  }, [theme]);

  return (
    <Stage
      key={fontTick}
      width={Math.round(SLIDE_W * scale)}
      height={Math.round(SLIDE_H * scale)}
      scaleX={scale}
      scaleY={scale}
      listening={false}
      className={className}
    >
      <Layer listening={false}>
        <Rect width={SLIDE_W} height={SLIDE_H} fill={resolveColor(slide.background, theme)} />
        {slide.blocks.map((b) => (
          <BlockNode key={b.id} block={b} theme={theme} />
        ))}
      </Layer>
    </Stage>
  );
}

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Group, Layer, Line, Rect, Stage, Transformer } from "react-konva";
import type Konva from "konva";
import { SLIDE_H, SLIDE_W, resolveColor, resolveFont, type Block, type TextBlock } from "@/lib/ast/schema";
import { useEditor } from "@/lib/editor/store";
import { viewportDims } from "@/lib/editor/viewport";
import { BlockNode } from "./BlockNode";
import { ensureThemeFonts } from "./fonts";

const SNAP_PX = 6;

type Guide = { axis: "x" | "y"; pos: number };

export function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [guides, setGuides] = useState<Guide[]>([]);
  const [fontTick, setFontTick] = useState(0);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [panning, setPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const deck = useEditor((s) => s.deck);
  const slideId = useEditor((s) => s.slideId);
  const selection = useEditor((s) => s.selection);
  const editingId = useEditor((s) => s.editingId);
  const zoom = useEditor((s) => s.zoom);
  const pan = useEditor((s) => s.pan);
  const viewport = useEditor((s) => s.viewport);
  const select = useEditor((s) => s.select);
  const clearSelection = useEditor((s) => s.clearSelection);
  const setEditing = useEditor((s) => s.setEditing);
  const updateBlock = useEditor((s) => s.updateBlock);
  const updateBlocks = useEditor((s) => s.updateBlocks);
  const commit = useEditor((s) => s.commit);
  const setZoom = useEditor((s) => s.setZoom);
  const setPan = useEditor((s) => s.setPan);

  const theme = deck.theme;
  const slide = deck.slides.find((s) => s.id === slideId) ?? deck.slides[0]!;
  const vp = viewportDims(viewport);
  const inner = Math.min(vp.w / SLIDE_W, vp.h / SLIDE_H);
  const padX = (vp.w - SLIDE_W * inner) / 2;
  const padY = (vp.h - SLIDE_H * inner) / 2;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const r = entry!.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fit = Math.min(size.w / vp.w, size.h / vp.h) * 0.9;
  const scale = (fit || 0.1) * zoom;
  const offset = useMemo(
    () => ({ x: (size.w - vp.w * scale) / 2 + pan.x, y: (size.h - vp.h * scale) / 2 + pan.y }),
    [size.w, size.h, scale, pan.x, pan.y, vp.w, vp.h],
  );

  const slideScale = scale * inner;

  useEffect(() => {
    let alive = true;
    ensureThemeFonts(theme).then(() => {
      if (!alive) return;
      setFontTick((t) => t + 1);
      layerRef.current?.batchDraw();
    });
    return () => {
      alive = false;
    };
  }, [theme]);

  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const nodes = selection
      .map((id) => stage.findOne(`#${id}`))
      .filter((n): n is Konva.Node => !!n && !editingId);
    tr.nodes(nodes);
    tr.getLayer()?.batchDraw();
  }, [selection, slide.blocks, editingId, fontTick]);

  // Spacebar pan + scroll zoom
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      setSpaceHeld(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      setZoom(useEditor.getState().zoom * factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setZoom]);

  const onPanStart = useCallback(
    (e: React.MouseEvent) => {
      if (!spaceHeld) return;
      e.preventDefault();
      setPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    },
    [spaceHeld, pan.x, pan.y],
  );

  const onPanMove = useCallback(
    (e: React.MouseEvent) => {
      if (!panning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
    },
    [panning, setPan],
  );

  const onPanEnd = useCallback(() => setPanning(false), []);

  const onStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (spaceHeld) return;
      const target = e.target;
      const clickedEmpty = target === target.getStage() || target.name() === "slide-bg" || target.name() === "viewport-frame";
      if (clickedEmpty) clearSelection();
    },
    [clearSelection, spaceHeld],
  );

  const onBlockSelect = useCallback(
    (block: Block) => (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (spaceHeld) return;
      e.cancelBubble = true;
      if (editingId && editingId !== block.id) setEditing(null);
      const additive = "shiftKey" in e.evt && (e.evt.shiftKey || e.evt.metaKey);
      if (!additive && selection.includes(block.id)) return;
      select([block.id], additive);
    },
    [select, selection, editingId, setEditing, spaceHeld],
  );

  const onDragMove = useCallback(
    (block: Block) => (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const tol = SNAP_PX / slideScale;
      const g: Guide[] = [];
      const cx = node.x() + block.w / 2;
      const cy = node.y() + block.h / 2;
      const targetsX = [SLIDE_W / 2, 140, SLIDE_W - 140];
      const targetsY = [SLIDE_H / 2, 140, SLIDE_H - 140];
      for (const t of targetsX) {
        if (Math.abs(cx - t) < tol) {
          node.x(t - block.w / 2);
          g.push({ axis: "x", pos: t });
          break;
        }
        if (Math.abs(node.x() - t) < tol) {
          node.x(t);
          g.push({ axis: "x", pos: t });
          break;
        }
        if (Math.abs(node.x() + block.w - t) < tol) {
          node.x(t - block.w);
          g.push({ axis: "x", pos: t });
          break;
        }
      }
      for (const t of targetsY) {
        if (Math.abs(cy - t) < tol) {
          node.y(t - block.h / 2);
          g.push({ axis: "y", pos: t });
          break;
        }
        if (Math.abs(node.y() - t) < tol) {
          node.y(t);
          g.push({ axis: "y", pos: t });
          break;
        }
        if (Math.abs(node.y() + block.h - t) < tol) {
          node.y(t - block.h);
          g.push({ axis: "y", pos: t });
          break;
        }
      }
      setGuides(g);
    },
    [slideScale],
  );

  const onDragEnd = useCallback(
    (block: Block) => (e: Konva.KonvaEventObject<DragEvent>) => {
      setGuides([]);
      const node = e.target;
      const dx = node.x() - block.x;
      const dy = node.y() - block.y;
      const ids = selection.includes(block.id) ? selection : [block.id];
      const patches: Record<string, Partial<Block>> = {};
      for (const id of ids) {
        const b = slide.blocks.find((x) => x.id === id);
        if (!b) continue;
        patches[id] = { x: Math.round(b.x + dx), y: Math.round(b.y + dy) };
        if (id !== block.id) {
          const n = stageRef.current?.findOne(`#${id}`);
          n?.position({ x: b.x + dx, y: b.y + dy });
        }
      }
      updateBlocks(patches);
    },
    [selection, slide.blocks, updateBlocks],
  );

  const onTransformEnd = useCallback(
    (block: Block) => (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const sx = node.scaleX();
      const sy = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      updateBlock(block.id, {
        x: Math.round(node.x()),
        y: Math.round(node.y()),
        w: Math.max(8, Math.round(block.w * sx)),
        h: Math.max(2, Math.round(block.h * sy)),
        rotation: Math.round(node.rotation() * 10) / 10,
      });
    },
    [updateBlock],
  );

  const editingBlock = slide.blocks.find((b) => b.id === editingId && b.type === "text") as TextBlock | undefined;
  const bg = resolveColor(slide.background, theme);
  const selectionColor = "#D4A373";
  const cursor = spaceHeld ? (panning ? "grabbing" : "grab") : "default";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-canvas"
      style={{ cursor }}
      onMouseDown={onPanStart}
      onMouseMove={onPanMove}
      onMouseUp={onPanEnd}
      onMouseLeave={onPanEnd}
    >
      {size.w > 0 && (
        <div
          className="pointer-events-none absolute shadow-slide"
          style={{ left: offset.x, top: offset.y, width: vp.w * scale, height: vp.h * scale }}
        />
      )}
      <Stage
        ref={stageRef}
        width={size.w}
        height={size.h}
        scaleX={scale}
        scaleY={scale}
        x={offset.x}
        y={offset.y}
        onMouseDown={onStageMouseDown}
        onTouchStart={onStageMouseDown}
      >
        <Layer ref={layerRef}>
          <Rect
            name="viewport-frame"
            width={vp.w}
            height={vp.h}
            stroke={selectionColor}
            strokeWidth={1 / scale}
            opacity={0.35}
            listening={false}
          />
          <Group x={padX} y={padY} scaleX={inner} scaleY={inner}>
            <Rect name="slide-bg" width={SLIDE_W} height={SLIDE_H} fill={bg} />
            {slide.blocks.map((b) => (
              <BlockNode
                key={b.id}
                block={b}
                theme={theme}
                interactive={!spaceHeld}
                hidden={b.id === editingId}
                onSelect={onBlockSelect(b)}
                onDblClick={b.type === "text" && !b.locked && !spaceHeld ? () => setEditing(b.id) : undefined}
                onDragMove={onDragMove(b)}
                onDragEnd={onDragEnd(b)}
                onTransformEnd={onTransformEnd(b)}
              />
            ))}
            {guides.map((g, i) =>
              g.axis === "x" ? (
                <Line key={i} points={[g.pos, 0, g.pos, SLIDE_H]} stroke={selectionColor} strokeWidth={1 / slideScale} dash={[6 / slideScale, 6 / slideScale]} listening={false} />
              ) : (
                <Line key={i} points={[0, g.pos, SLIDE_W, g.pos]} stroke={selectionColor} strokeWidth={1 / slideScale} dash={[6 / slideScale, 6 / slideScale]} listening={false} />
              ),
            )}
            <Transformer
              ref={trRef}
              rotateEnabled
              rotationSnaps={[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345]}
              anchorSize={9}
              anchorCornerRadius={9}
              anchorStroke={selectionColor}
              anchorFill="#16161A"
              anchorStrokeWidth={1.5}
              borderStroke={selectionColor}
              borderStrokeWidth={1}
              ignoreStroke
              keepRatio={false}
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 8 || newBox.height < 2 ? oldBox : newBox)}
              onTransformStart={() => commit()}
            />
          </Group>
        </Layer>
      </Stage>

      {editingBlock && (
        <TextEditorOverlay
          key={editingBlock.id}
          block={editingBlock}
          scale={slideScale}
          offset={{ x: offset.x + padX * scale, y: offset.y + padY * scale }}
          fontFamily={resolveFont(editingBlock.font, theme)}
          color={resolveColor(editingBlock.color, theme)}
          onCommit={(text) => {
            if (text !== editingBlock.text) updateBlock(editingBlock.id, { text });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function TextEditorOverlay({
  block,
  scale,
  offset,
  fontFamily,
  color,
  onCommit,
}: {
  block: TextBlock;
  scale: number;
  offset: { x: number; y: number };
  fontFamily: string;
  color: string;
  onCommit: (text: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(block.text);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.select();
  }, []);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onCommit(value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") onCommit(block.text);
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onCommit(value);
      }}
      spellCheck={false}
      className="absolute resize-none overflow-hidden border-0 bg-transparent p-0 outline-none"
      style={{
        left: offset.x + block.x * scale,
        top: offset.y + block.y * scale,
        width: block.w * scale,
        height: block.h * scale,
        transform: `rotate(${block.rotation}deg)`,
        transformOrigin: "top left",
        fontFamily,
        fontSize: block.fontSize * scale,
        fontWeight: block.fontWeight,
        fontStyle: block.italic ? "italic" : "normal",
        lineHeight: block.lineHeight,
        letterSpacing: block.letterSpacing * scale,
        textAlign: block.align,
        textTransform: block.uppercase ? "uppercase" : "none",
        color,
        caretColor: "#D4A373",
        boxShadow: "0 0 0 1px #D4A373",
      }}
    />
  );
}

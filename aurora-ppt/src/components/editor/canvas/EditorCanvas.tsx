import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Layer, Line, Rect, Stage, Transformer } from "react-konva";
import type Konva from "konva";
import { SLIDE_H, SLIDE_W, resolveColor, resolveFont, type Block, type TextBlock } from "@/lib/ast/schema";
import { useEditor } from "@/lib/editor/store";
import { BlockNode } from "./BlockNode";
import { ensureThemeFonts } from "./fonts";

const SNAP_PX = 6; // screen pixels

type Guide = { axis: "x" | "y"; pos: number };

export function EditorCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [guides, setGuides] = useState<Guide[]>([]);
  const [fontTick, setFontTick] = useState(0);

  const deck = useEditor((s) => s.deck);
  const slideId = useEditor((s) => s.slideId);
  const selection = useEditor((s) => s.selection);
  const editingId = useEditor((s) => s.editingId);
  const zoom = useEditor((s) => s.zoom);
  const select = useEditor((s) => s.select);
  const clearSelection = useEditor((s) => s.clearSelection);
  const setEditing = useEditor((s) => s.setEditing);
  const updateBlock = useEditor((s) => s.updateBlock);
  const updateBlocks = useEditor((s) => s.updateBlocks);
  const commit = useEditor((s) => s.commit);

  const theme = deck.theme;
  const slide = deck.slides.find((s) => s.id === slideId) ?? deck.slides[0]!;

  // ---- sizing -------------------------------------------------------------
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

  const fit = Math.min(size.w / SLIDE_W, size.h / SLIDE_H) * 0.9;
  const scale = (fit || 0.1) * zoom;
  const offset = useMemo(
    () => ({ x: (size.w - SLIDE_W * scale) / 2, y: (size.h - SLIDE_H * scale) / 2 }),
    [size.w, size.h, scale],
  );

  // ---- fonts --------------------------------------------------------------
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

  // ---- transformer binding -----------------------------------------------
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

  // ---- handlers -----------------------------------------------------------
  const onStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const target = e.target;
      const clickedEmpty = target === target.getStage() || target.name() === "slide-bg";
      if (clickedEmpty) clearSelection();
    },
    [clearSelection],
  );

  const onBlockSelect = useCallback(
    (block: Block) => (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      e.cancelBubble = true;
      if (editingId && editingId !== block.id) setEditing(null);
      const additive = "shiftKey" in e.evt && (e.evt.shiftKey || e.evt.metaKey);
      if (!additive && selection.includes(block.id)) return;
      select([block.id], additive);
    },
    [select, selection, editingId, setEditing],
  );

  const onDragMove = useCallback(
    (block: Block) => (e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target;
      const tol = SNAP_PX / scale;
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
    [scale],
  );

  const onDragEnd = useCallback(
    (block: Block) => (e: Konva.KonvaEventObject<DragEvent>) => {
      setGuides([]);
      const node = e.target;
      const dx = node.x() - block.x;
      const dy = node.y() - block.y;
      // Move every selected block by the same delta (multi-drag).
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

  // ---- inline text editing ------------------------------------------------
  const editingBlock = slide.blocks.find((b) => b.id === editingId && b.type === "text") as TextBlock | undefined;

  const bg = resolveColor(slide.background, theme);
  const selectionColor = "#D4A373";

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-canvas">
      {/* slide shadow */}
      {size.w > 0 && (
        <div
          className="pointer-events-none absolute shadow-slide"
          style={{ left: offset.x, top: offset.y, width: SLIDE_W * scale, height: SLIDE_H * scale }}
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
          <Rect name="slide-bg" width={SLIDE_W} height={SLIDE_H} fill={bg} />
          {slide.blocks.map((b) => (
            <BlockNode
              key={b.id}
              block={b}
              theme={theme}
              interactive
              hidden={b.id === editingId}
              onSelect={onBlockSelect(b)}
              onDblClick={b.type === "text" && !b.locked ? () => setEditing(b.id) : undefined}
              onDragMove={onDragMove(b)}
              onDragEnd={onDragEnd(b)}
              onTransformEnd={onTransformEnd(b)}
            />
          ))}
          {guides.map((g, i) =>
            g.axis === "x" ? (
              <Line key={i} points={[g.pos, 0, g.pos, SLIDE_H]} stroke={selectionColor} strokeWidth={1 / scale} dash={[6 / scale, 6 / scale]} listening={false} />
            ) : (
              <Line key={i} points={[0, g.pos, SLIDE_W, g.pos]} stroke={selectionColor} strokeWidth={1 / scale} dash={[6 / scale, 6 / scale]} listening={false} />
            ),
          )}
          <Transformer
            ref={trRef}
            rotateEnabled
            rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
            anchorSize={9}
            anchorCornerRadius={9}
            anchorStroke={selectionColor}
            anchorFill="#0F2A22"
            anchorStrokeWidth={1.5}
            borderStroke={selectionColor}
            borderStrokeWidth={1}
            ignoreStroke
            keepRatio={false}
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 8 || newBox.height < 2 ? oldBox : newBox)}
            onTransformStart={() => commit()}
          />
        </Layer>
      </Stage>

      {editingBlock && (
        <TextEditorOverlay
          key={editingBlock.id}
          block={editingBlock}
          scale={scale}
          offset={offset}
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

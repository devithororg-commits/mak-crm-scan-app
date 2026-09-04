import { memo } from "react";
import { Ellipse, Group, Image as KImage, Rect, Text } from "react-konva";
import type Konva from "konva";
import {
  isGradient,
  resolveColor,
  resolveFont,
  type Block,
  type GroupBlock,
  type ImageBlock,
  type Paint,
  type Shadow,
  type ShapeBlock,
  type StrokeAlign,
  type StrokeStyle,
  type Theme,
} from "@/lib/ast/schema";
import { useImage } from "./useImage";

export type BlockNodeProps = {
  block: Block;
  theme: Theme;
  interactive?: boolean;
  hidden?: boolean;
  onSelect?: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDblClick?: (() => void) | undefined;
  onDragMove?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
};

const noop = () => undefined;

function commonProps(p: BlockNodeProps) {
  const { block, interactive } = p;
  const select = p.onSelect ?? noop;
  return {
    id: block.id,
    x: block.x,
    y: block.y,
    rotation: block.rotation,
    opacity: p.hidden ? 0 : block.opacity,
    draggable: !!interactive && !block.locked,
    listening: !!interactive,
    onMouseDown: select as (e: Konva.KonvaEventObject<MouseEvent>) => void,
    onTouchStart: select as (e: Konva.KonvaEventObject<TouchEvent>) => void,
    onDblClick: p.onDblClick ?? noop,
    onDblTap: p.onDblClick ?? noop,
    onDragMove: p.onDragMove ?? noop,
    onDragEnd: p.onDragEnd ?? noop,
    onTransformEnd: p.onTransformEnd ?? noop,
    perfectDrawEnabled: false,
  };
}

// ---- paint helpers -------------------------------------------------------

/** Konva fill props for a solid colour or gradient inside a w×h frame. */
export function paintProps(paint: Paint | undefined, theme: Theme, w: number, h: number) {
  if (!isGradient(paint)) return { fill: resolveColor(paint, theme) };
  const stops = paint.stops.flatMap((s) => [s.offset, resolveColor(s.color, theme)]);
  if (paint.type === "radial") {
    return {
      fillRadialGradientStartPoint: { x: w / 2, y: h / 2 },
      fillRadialGradientEndPoint: { x: w / 2, y: h / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: Math.max(w, h) / 2,
      fillRadialGradientColorStops: stops,
    };
  }
  // linear: angle 0 = left→right, 90 = top→bottom (CSS-like, clockwise)
  const rad = ((paint.angle - 90) * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const half = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;
  return {
    fillLinearGradientStartPoint: { x: w / 2 - dx * half, y: h / 2 - dy * half },
    fillLinearGradientEndPoint: { x: w / 2 + dx * half, y: h / 2 + dy * half },
    fillLinearGradientColorStops: stops,
  };
}

export function shadowProps(shadow: Shadow | undefined, theme: Theme) {
  if (!shadow) return {};
  return {
    shadowColor: resolveColor(shadow.color, theme),
    shadowBlur: shadow.blur,
    shadowOffsetX: shadow.x,
    shadowOffsetY: shadow.y,
    shadowOpacity: shadow.opacity,
    shadowForStrokeEnabled: false,
  };
}

function strokeProps(stroke: string | undefined, width: number, style: StrokeStyle, theme: Theme) {
  if (!stroke || width <= 0) return {};
  const base = { stroke: resolveColor(stroke, theme), strokeWidth: width };
  if (style === "dashed") return { ...base, dash: [width * 3, width * 2] };
  if (style === "dotted") return { ...base, dash: [0.01, width * 2], lineCap: "round" as const };
  return base;
}

/** Konva strokes are centred on the edge; emulate inside/outside by insetting the geometry. */
function strokeInset(width: number, align: StrokeAlign, hasStroke: boolean) {
  if (!hasStroke || width <= 0 || align === "center") return 0;
  return align === "inside" ? width / 2 : -width / 2;
}

// ---- nodes ---------------------------------------------------------------

function ImageNode(p: BlockNodeProps & { block: ImageBlock }) {
  const { block, theme } = p;
  const img = useImage(block.src);
  const cp = commonProps(p);
  const sp = shadowProps(block.shadow, theme);
  const st = strokeProps(block.stroke, block.strokeWidth, block.strokeStyle, theme);
  const inset = strokeInset(block.strokeWidth, block.strokeAlign, !!block.stroke);

  if (!img) {
    return <Rect {...cp} width={block.w} height={block.h} fill={resolveColor("surface", theme)} cornerRadius={block.cornerRadius} />;
  }

  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;
  const boxRatio = block.w / block.h;
  const imgRatio = iw / ih;
  let crop = { x: 0, y: 0, width: iw, height: ih };

  if (block.fit === "cover") {
    if (imgRatio > boxRatio) {
      const cw = ih * boxRatio;
      crop = { x: (iw - cw) / 2, y: 0, width: cw, height: ih };
    } else {
      const ch = iw / boxRatio;
      crop = { x: 0, y: (ih - ch) / 2, width: iw, height: ch };
    }
  }

  if (block.fit === "cover" || block.fit === "fill") {
    return (
      <KImage
        {...cp}
        {...sp}
        {...st}
        image={img}
        width={block.w}
        height={block.h}
        crop={crop}
        cornerRadius={block.cornerRadius}
        strokeScaleEnabled={false}
        offsetX={-inset}
        offsetY={-inset}
      />
    );
  }

  // contain: letterbox inside a group so the hit box stays the full frame
  const scale = Math.min(block.w / iw, block.h / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  return (
    <Group {...cp}>
      <Rect width={block.w} height={block.h} fill="transparent" />
      <KImage {...sp} {...st} image={img} x={(block.w - dw) / 2} y={(block.h - dh) / 2} width={dw} height={dh} cornerRadius={block.cornerRadius} />
    </Group>
  );
}

function ShapeNode(p: BlockNodeProps & { block: ShapeBlock }) {
  const { block, theme } = p;
  const cp = commonProps(p);
  const fill = paintProps(block.fill, theme, block.w, block.h);
  const sp = shadowProps(block.shadow, theme);
  const st = strokeProps(block.stroke, block.strokeWidth, block.strokeStyle, theme);
  const inset = strokeInset(block.strokeWidth, block.strokeAlign, !!block.stroke);

  if (block.shape === "ellipse") {
    return (
      <Group {...cp}>
        <Ellipse
          x={block.w / 2}
          y={block.h / 2}
          radiusX={Math.max(0.5, block.w / 2 - inset)}
          radiusY={Math.max(0.5, block.h / 2 - inset)}
          {...fill}
          {...sp}
          {...st}
        />
        <Rect width={block.w} height={block.h} fill="transparent" />
      </Group>
    );
  }

  if (inset === 0) {
    return <Rect {...cp} width={block.w} height={block.h} {...fill} {...sp} {...st} cornerRadius={block.cornerRadius} />;
  }

  return (
    <Group {...cp}>
      <Rect width={block.w} height={block.h} fill="transparent" />
      <Rect
        x={inset}
        y={inset}
        width={Math.max(1, block.w - inset * 2)}
        height={Math.max(1, block.h - inset * 2)}
        {...fill}
        {...sp}
        {...st}
        cornerRadius={block.cornerRadius}
      />
    </Group>
  );
}

function GroupNode(p: BlockNodeProps & { block: GroupBlock }) {
  const { block, theme } = p;
  const cp = commonProps(p);
  return (
    <Group {...cp}>
      <Rect width={block.w} height={block.h} fill="transparent" />
      {block.children.map((c) => (
        <BlockNode key={c.id} block={c} theme={theme} />
      ))}
    </Group>
  );
}

export const BlockNode = memo(function BlockNode(p: BlockNodeProps) {
  const { block, theme } = p;

  switch (block.type) {
    case "text": {
      const cp = commonProps(p);
      const style = `${block.italic ? "italic" : "normal"} ${block.fontWeight}`;
      return (
        <Text
          {...cp}
          {...shadowProps(block.shadow, theme)}
          width={block.w}
          height={block.h}
          text={block.uppercase ? block.text.toUpperCase() : block.text}
          fontFamily={resolveFont(block.font, theme, block.fontFamily)}
          fontSize={block.fontSize}
          fontStyle={style}
          lineHeight={block.lineHeight}
          letterSpacing={block.letterSpacing}
          align={block.align}
          verticalAlign={block.verticalAlign}
          fill={resolveColor(block.color, theme)}
          wrap="word"
        />
      );
    }
    case "shape":
      return <ShapeNode {...p} block={block} />;
    case "image":
      return <ImageNode {...p} block={block} />;
    case "group":
      return <GroupNode {...p} block={block} />;
    default:
      return null;
  }
});

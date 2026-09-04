import { nanoid } from "nanoid";
import { SLIDE_H, SLIDE_W, type Block, type GroupBlock, type LeafBlock } from "@/lib/ast/schema";

export type Box = { x: number; y: number; w: number; h: number };

export function bbox(blocks: Box[]): Box {
  if (!blocks.length) return { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H };
  const x1 = Math.min(...blocks.map((b) => b.x));
  const y1 = Math.min(...blocks.map((b) => b.y));
  const x2 = Math.max(...blocks.map((b) => b.x + b.w));
  const y2 = Math.max(...blocks.map((b) => b.y + b.h));
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

export type AlignMode = "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom";

/** Align blocks to a reference box. With one block the reference is the slide. */
export function alignBlocks(blocks: Block[], mode: AlignMode): Record<string, Partial<Block>> {
  const ref: Box = blocks.length > 1 ? bbox(blocks) : { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H };
  const patches: Record<string, Partial<Block>> = {};
  for (const b of blocks) {
    switch (mode) {
      case "left": patches[b.id] = { x: ref.x }; break;
      case "hcenter": patches[b.id] = { x: Math.round(ref.x + (ref.w - b.w) / 2) }; break;
      case "right": patches[b.id] = { x: ref.x + ref.w - b.w }; break;
      case "top": patches[b.id] = { y: ref.y }; break;
      case "vcenter": patches[b.id] = { y: Math.round(ref.y + (ref.h - b.h) / 2) }; break;
      case "bottom": patches[b.id] = { y: ref.y + ref.h - b.h }; break;
    }
  }
  return patches;
}

/** Equal gaps between blocks along an axis (needs 3+). */
export function distributeBlocks(blocks: Block[], axis: "x" | "y"): Record<string, Partial<Block>> {
  if (blocks.length < 3) return {};
  const key = axis;
  const size = axis === "x" ? "w" : "h";
  const sorted = [...blocks].sort((a, b) => a[key] - b[key]);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const total = last[key] + last[size] - first[key];
  const occupied = sorted.reduce((s, b) => s + b[size], 0);
  const gap = (total - occupied) / (sorted.length - 1);
  const patches: Record<string, Partial<Block>> = {};
  let cursor = first[key];
  for (const b of sorted) {
    patches[b.id] = { [key]: Math.round(cursor) } as Partial<Block>;
    cursor += b[size] + gap;
  }
  return patches;
}

const rotate = (x: number, y: number, deg: number) => {
  const r = (deg * Math.PI) / 180;
  return { x: x * Math.cos(r) - y * Math.sin(r), y: x * Math.sin(r) + y * Math.cos(r) };
};

/** Bind leaf blocks into a group. Rotated members keep their rotation relative to the group frame. */
export function makeGroup(blocks: LeafBlock[]): GroupBlock {
  const box = bbox(blocks);
  return {
    id: nanoid(8),
    type: "group",
    name: "Group",
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    rotation: 0,
    opacity: 1,
    locked: false,
    lockAspect: false,
    children: blocks.map((b) => ({ ...b, x: b.x - box.x, y: b.y - box.y })),
  };
}

/** Flatten a group back into slide-space leaf blocks. */
export function explodeGroup(g: GroupBlock): LeafBlock[] {
  return g.children.map((c) => {
    const p = rotate(c.x, c.y, g.rotation);
    return { ...c, x: Math.round(g.x + p.x), y: Math.round(g.y + p.y), rotation: c.rotation + g.rotation, opacity: c.opacity * g.opacity };
  });
}

/** Scale a group's children when the group frame is resized. */
export function scaleGroupChildren(g: GroupBlock, sx: number, sy: number): LeafBlock[] {
  const f = (sx + sy) / 2;
  return g.children.map((c) => {
    const next = { ...c, x: c.x * sx, y: c.y * sy, w: Math.max(1, c.w * sx), h: Math.max(1, c.h * sy) };
    if (next.type === "text") return { ...next, fontSize: Math.max(4, next.fontSize * f), letterSpacing: next.letterSpacing * f };
    return next;
  });
}

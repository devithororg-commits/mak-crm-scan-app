import {
  AlignCenter,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceBetween,
  AlignLeft,
  AlignRight,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceBetween,
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  Copy,
  Group,
  Link2,
  Link2Off,
  Lock,
  LockOpen,
  Trash2,
  Ungroup,
} from "lucide-react";
import { useEffect } from "react";
import { FONT_FAMILIES, preloadFamily } from "@/components/editor/canvas/fonts";
import { TEXT_PRESETS, THEMES } from "@/lib/ast/defaults";
import { TextRole, type Block, type CornerRadius, type ImageBlock, type Shadow, type ShapeBlock, type TextBlock, type Transition } from "@/lib/ast/schema";
import { useEditor } from "@/lib/editor/store";
import { ColorPicker, Dial, IconBtn, Num, PaintEditor, Row, Section, Seg, SliderNum } from "./controls";

const ratioName = (w: number, h: number) => {
  const r = w / h;
  const known: [string, number][] = [["16:9", 16 / 9], ["4:3", 4 / 3], ["1:1", 1], ["3:2", 1.5], ["9:16", 9 / 16]];
  const hit = known.find(([, v]) => Math.abs(v - r) < 0.01);
  return hit ? hit[0] : r.toFixed(2);
};

const cornersOf = (r: CornerRadius): [number, number, number, number] => (typeof r === "number" ? [r, r, r, r] : r);

export function Inspector() {
  const deck = useEditor((s) => s.deck);
  const slideId = useEditor((s) => s.slideId);
  const selection = useEditor((s) => s.selection);
  const slide = deck.slides.find((s) => s.id === slideId) ?? deck.slides[0]!;
  const blocks = slide.blocks.filter((b) => selection.includes(b.id));
  const block = blocks.length === 1 ? blocks[0] : undefined;

  return (
    <aside className="panel scrollbar-thin flex h-full w-[280px] shrink-0 flex-col overflow-y-auto border-l">
      {blocks.length === 0 && <SlidePanel />}
      {blocks.length > 0 && <ArrangePanel blocks={blocks} />}
      {block && <BlockPanel block={block} />}
      {blocks.length > 1 && <MultiPanel blocks={blocks} />}
    </aside>
  );
}

// ---- slide / theme ----------------------------------------------------------

function SlidePanel() {
  const deck = useEditor((s) => s.deck);
  const slideId = useEditor((s) => s.slideId);
  const updateSlide = useEditor((s) => s.updateSlide);
  const setTheme = useEditor((s) => s.setTheme);
  const slide = deck.slides.find((s) => s.id === slideId) ?? deck.slides[0]!;
  const t = slide.transition;
  const setT = (p: Partial<Transition>) => updateSlide(slide.id, { transition: { ...t, ...p } });

  return (
    <>
      <Section title="Slide">
        <Row label="Name">
          <input className="field" value={slide.name} onChange={(e) => updateSlide(slide.id, { name: e.target.value })} />
        </Row>
        <Row label="Background">
          <ColorPicker value={slide.background} onChange={(v) => updateSlide(slide.id, { background: v ?? "background" })} />
        </Row>
      </Section>
      <Section title="Transition">
        <Seg
          value={t.type}
          onChange={(v) => setT({ type: v })}
          options={[{ value: "none", label: "None" }, { value: "fade", label: "Fade" }, { value: "slide", label: "Slide" }, { value: "zoom", label: "Zoom" }]}
        />
        <Row label="Duration">
          <SliderNum value={t.duration} min={0} max={3000} step={50} suffix="ms" onChange={(v) => setT({ duration: v })} />
        </Row>
        <Row label="Delay">
          <SliderNum value={t.delay} min={0} max={3000} step={50} suffix="ms" onChange={(v) => setT({ delay: v })} />
        </Row>
        <Row label="Easing">
          <select className="field" value={t.easing} onChange={(e) => setT({ easing: e.target.value })}>
            <option value="cubic-bezier(0.2, 0.7, 0.2, 1)">Editorial</option>
            <option value="ease-in-out">Ease in-out</option>
            <option value="ease-out">Ease out</option>
            <option value="linear">Linear</option>
            <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">Spring</option>
          </select>
        </Row>
      </Section>
      <Section title="Theme">
        <div className="grid gap-1.5">
          {THEMES.map((th) => (
            <button
              key={th.id}
              onClick={() => setTheme(th)}
              data-on={deck.theme.id === th.id}
              className="flex items-center gap-3 rounded-sm border px-3 py-2 text-left text-xs transition-colors hover:bg-secondary data-[on=true]:border-accent"
            >
              <span className="flex -space-x-1">
                {(["background", "surface", "foreground", "accent"] as const).map((k) => (
                  <span key={k} className="h-4 w-4 rounded-full ring-1 ring-border" style={{ background: th.colors[k] }} />
                ))}
              </span>
              <span>
                <span className="block font-medium">{th.name}</span>
                <span className="block text-[10px] text-muted-foreground">
                  {th.fonts.display} · {th.fonts.body}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Notes">
        <textarea
          className="field h-28 resize-none py-1.5 leading-relaxed"
          placeholder="Speaker notes…"
          value={slide.notes}
          onChange={(e) => updateSlide(slide.id, { notes: e.target.value })}
        />
      </Section>
    </>
  );
}

// ---- arrange (shared by single + multi) --------------------------------------

function ArrangePanel({ blocks }: { blocks: Block[] }) {
  const align = useEditor((s) => s.align);
  const distribute = useEditor((s) => s.distribute);
  const group = useEditor((s) => s.group);
  const ungroup = useEditor((s) => s.ungroup);
  const toggleLock = useEditor((s) => s.toggleLock);
  const reorderBlock = useEditor((s) => s.reorderBlock);
  const duplicateBlocks = useEditor((s) => s.duplicateBlocks);
  const deleteBlocks = useEditor((s) => s.deleteBlocks);
  const ids = blocks.map((b) => b.id);
  const locked = blocks.every((b) => b.locked);
  const hasGroup = blocks.some((b) => b.type === "group");

  return (
    <Section title={blocks.length > 1 ? `Arrange · ${blocks.length}` : "Arrange"}>
      <div className="flex gap-0.5">
        <IconBtn title="Align left" onClick={() => align("left")}><AlignStartVertical /></IconBtn>
        <IconBtn title="Align centre" onClick={() => align("hcenter")}><AlignCenterVertical /></IconBtn>
        <IconBtn title="Align right" onClick={() => align("right")}><AlignEndVertical /></IconBtn>
        <IconBtn title="Align top" onClick={() => align("top")}><AlignStartHorizontal /></IconBtn>
        <IconBtn title="Align middle" onClick={() => align("vcenter")}><AlignCenterHorizontal /></IconBtn>
        <IconBtn title="Align bottom" onClick={() => align("bottom")}><AlignEndHorizontal /></IconBtn>
      </div>
      <div className="flex gap-0.5">
        <IconBtn title="Distribute horizontally" disabled={blocks.length < 3} onClick={() => distribute("x")}><AlignHorizontalSpaceBetween /></IconBtn>
        <IconBtn title="Distribute vertically" disabled={blocks.length < 3} onClick={() => distribute("y")}><AlignVerticalSpaceBetween /></IconBtn>
        <IconBtn title="Group (⌘G)" disabled={blocks.length < 2} onClick={group}><Group /></IconBtn>
        <IconBtn title="Ungroup (⇧⌘G)" disabled={!hasGroup} onClick={ungroup}><Ungroup /></IconBtn>
        <IconBtn title={locked ? "Unlock" : "Lock"} active={locked} onClick={() => toggleLock(ids)}>{locked ? <Lock /> : <LockOpen />}</IconBtn>
      </div>
      <div className="flex gap-0.5">
        <IconBtn title="Bring to front" onClick={() => ids.forEach((id) => reorderBlock(id, "front"))}><ArrowUpToLine /></IconBtn>
        <IconBtn title="Bring forward" onClick={() => ids.forEach((id) => reorderBlock(id, "forward"))}><ArrowUp /></IconBtn>
        <IconBtn title="Send backward" onClick={() => ids.forEach((id) => reorderBlock(id, "backward"))}><ArrowDown /></IconBtn>
        <IconBtn title="Send to back" onClick={() => ids.forEach((id) => reorderBlock(id, "back"))}><ArrowDownToLine /></IconBtn>
        <IconBtn title="Duplicate (⌘D)" onClick={() => duplicateBlocks(ids)}><Copy /></IconBtn>
        <IconBtn title="Delete" onClick={() => deleteBlocks(ids)}><Trash2 /></IconBtn>
      </div>
    </Section>
  );
}

function MultiPanel({ blocks }: { blocks: Block[] }) {
  const updateBlocks = useEditor((s) => s.updateBlocks);
  const opacity = Math.round(blocks.reduce((s, b) => s + b.opacity, 0) / blocks.length) * 100;
  return (
    <Section title="Shared">
      <Row label="Opacity">
        <SliderNum
          value={opacity}
          min={0}
          max={100}
          suffix="%"
          onChange={(v) => updateBlocks(Object.fromEntries(blocks.map((b) => [b.id, { opacity: v / 100 }])), { history: false })}
        />
      </Row>
    </Section>
  );
}

// ---- single block -------------------------------------------------------------

function BlockPanel({ block }: { block: Block }) {
  const updateBlock = useEditor((s) => s.updateBlock);
  const commit = useEditor((s) => s.commit);
  // live edits skip history; commit() snapshots once on release/blur
  const live = (p: Partial<Block>) => updateBlock(block.id, p, { history: false });
  const patch = (p: Partial<Block>) => updateBlock(block.id, p);

  const setSize = (dim: "w" | "h", v: number) => {
    const val = Math.max(1, v);
    if (!block.lockAspect) return live({ [dim]: val } as Partial<Block>);
    const ratio = block.w / block.h;
    live(dim === "w" ? { w: val, h: Math.max(1, Math.round(val / ratio)) } : { h: val, w: Math.max(1, Math.round(val * ratio)) });
  };

  return (
    <>
      <Section
        title={block.name ?? block.type}
        right={<span className="font-mono text-[10px] text-muted-foreground">{ratioName(block.w, block.h)}</span>}
      >
        <div className="grid grid-cols-2 gap-1.5">
          <Num prefix="X" value={block.x} onChange={(v) => live({ x: v })} onCommit={commit} />
          <Num prefix="Y" value={block.y} onChange={(v) => live({ y: v })} onCommit={commit} />
          <Num prefix="W" value={block.w} min={1} onChange={(v) => setSize("w", v)} onCommit={commit} />
          <Num prefix="H" value={block.h} min={1} onChange={(v) => setSize("h", v)} onCommit={commit} />
        </div>
        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
          <Dial value={block.rotation} onChange={(v) => live({ rotation: v })} onCommit={commit} />
          <button
            title={block.lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
            data-active={block.lockAspect}
            className="tool-btn h-7 min-w-7 px-1.5"
            onClick={() => patch({ lockAspect: !block.lockAspect })}
          >
            {block.lockAspect ? <Link2 /> : <Link2Off />}
          </button>
        </div>
        <Row label="Opacity">
          <SliderNum value={Math.round(block.opacity * 100)} min={0} max={100} suffix="%" onChange={(v) => live({ opacity: v / 100 })} onCommit={commit} />
        </Row>
      </Section>

      {block.type === "text" && <TextPanel block={block} live={live} patch={patch} commit={commit} />}
      {block.type === "shape" && <ShapePanel block={block} live={live} patch={patch} commit={commit} />}
      {block.type === "image" && <ImagePanel block={block} live={live} patch={patch} commit={commit} />}
      {(block.type === "shape" || block.type === "image") && <StrokePanel block={block} live={live} patch={patch} commit={commit} />}
      <ShadowPanel block={block} live={live} patch={patch} commit={commit} />
    </>
  );
}

type P<B extends Block = Block> = { block: B; live: (p: Partial<B>) => void; patch: (p: Partial<B>) => void; commit: () => void };

function CornerControl({ value, onChange, onCommit }: { value: CornerRadius; onChange: (v: CornerRadius) => void; onCommit: () => void }) {
  const per = Array.isArray(value);
  const c = cornersOf(value);
  return (
    <div className="space-y-1.5">
      <Row label="Radius">
        <div className="grid grid-cols-[1fr_28px] gap-1.5">
          <Num value={per ? Math.round(c.reduce((a, b) => a + b) / 4) : c[0]} min={0} onChange={(v) => onChange(v)} onCommit={onCommit} />
          <button title="Per-corner" data-active={per} className="tool-btn h-7 min-w-7 px-0 text-[10px]" onClick={() => onChange(per ? c[0] : [...c])}>
            ◰
          </button>
        </div>
      </Row>
      {per && (
        <div className="grid grid-cols-4 gap-1">
          {(["TL", "TR", "BR", "BL"] as const).map((k, i) => (
            <Num
              key={k}
              prefix={k}
              value={c[i]!}
              min={0}
              onChange={(v) => {
                const n = [...c] as [number, number, number, number];
                n[i] = v;
                onChange(n);
              }}
              onCommit={onCommit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TextPanel({ block, live, patch, commit }: P<TextBlock>) {
  useEffect(() => {
    if (block.fontFamily) preloadFamily(block.fontFamily);
  }, [block.fontFamily]);

  return (
    <>
      <Section title="Typography">
        <Row label="Style">
          <select
            className="field"
            value={block.role}
            onChange={(e) => {
              const role = e.target.value as TextRole;
              patch({ role, ...TEXT_PRESETS[role] });
            }}
          >
            {TextRole.options.map((r) => (
              <option key={r} value={r}>
                {r[0]!.toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Family">
          <select
            className="field"
            style={{ fontFamily: block.fontFamily ?? "inherit" }}
            value={block.fontFamily ?? ""}
            onChange={(e) => {
              const fam = e.target.value;
              if (fam) preloadFamily(fam);
              const next: Partial<TextBlock> = fam ? { fontFamily: fam } : {};
              if (!fam) {
                const { fontFamily: _f, ...rest } = block;
                void _f;
                patch({ ...(rest as TextBlock) });
                return;
              }
              patch(next);
            }}
          >
            <option value="">Theme ({block.font})</option>
            {(["serif", "sans", "display", "mono"] as const).map((kind) => (
              <optgroup key={kind} label={kind}>
                {FONT_FAMILIES.filter((f) => f.kind === kind).map((f) => (
                  <option key={f.name} value={f.name} onPointerEnter={() => preloadFamily(f.name)}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Row>
        <div className="grid grid-cols-2 gap-1.5">
          <Num prefix="Aa" value={block.fontSize} min={4} onChange={(v) => live({ fontSize: v })} onCommit={commit} />
          <select className="field" value={block.fontWeight} onChange={(e) => patch({ fontWeight: parseInt(e.target.value) })}>
            {[300, 400, 500, 600, 700, 800].map((w) => (
              <option key={w} value={w}>
                {w === 300 ? "Light" : w === 400 ? "Regular" : w === 500 ? "Medium" : w === 600 ? "Semibold" : w === 700 ? "Bold" : "Black"}
              </option>
            ))}
          </select>
          <Num prefix="↕" value={block.lineHeight} step={0.05} min={0.5} onChange={(v) => live({ lineHeight: v })} onCommit={commit} />
          <Num prefix="↔" value={block.letterSpacing} step={0.5} onChange={(v) => live({ letterSpacing: v })} onCommit={commit} />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Seg
            value={block.align}
            onChange={(v) => patch({ align: v })}
            options={[{ value: "left", label: <AlignLeft /> }, { value: "center", label: <AlignCenter /> }, { value: "right", label: <AlignRight /> }]}
          />
          <Seg
            value={block.verticalAlign}
            onChange={(v) => patch({ verticalAlign: v })}
            options={[{ value: "top", label: "Top" }, { value: "middle", label: "Mid" }, { value: "bottom", label: "Bot" }]}
          />
        </div>
        <div className="flex gap-1">
          <button data-active={block.italic} className="tool-btn h-7 flex-1 font-display italic" onClick={() => patch({ italic: !block.italic })}>I</button>
          <button data-active={block.uppercase} className="tool-btn h-7 flex-1 text-[10px] tracking-widest" onClick={() => patch({ uppercase: !block.uppercase })}>AA</button>
        </div>
        <Row label="Colour">
          <ColorPicker value={block.color} onChange={(v) => patch({ color: v ?? "foreground" })} />
        </Row>
      </Section>
      <Section title="Content">
        <textarea className="field h-24 resize-none py-1.5 leading-relaxed" value={block.text} onChange={(e) => live({ text: e.target.value })} onBlur={commit} />
      </Section>
    </>
  );
}

function ShapePanel({ block, live, patch, commit }: P<ShapeBlock>) {
  return (
    <Section title="Fill">
      <Seg
        value={block.shape}
        onChange={(v) => patch({ shape: v })}
        options={[{ value: "rect", label: "Rect" }, { value: "ellipse", label: "Ellipse" }, { value: "line", label: "Line" }]}
      />
      <PaintEditor value={block.fill} onChange={(fill) => patch({ fill })} />
      {block.shape !== "ellipse" && <CornerControl value={block.cornerRadius} onChange={(cornerRadius) => live({ cornerRadius })} onCommit={commit} />}
    </Section>
  );
}

function ImagePanel({ block, live, patch, commit }: P<ImageBlock>) {
  return (
    <Section title="Image">
      <Row label="Fit">
        <Seg
          value={block.fit}
          onChange={(v) => patch({ fit: v })}
          options={[{ value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }, { value: "fill", label: "Fill" }]}
        />
      </Row>
      <CornerControl value={block.cornerRadius} onChange={(cornerRadius) => live({ cornerRadius })} onCommit={commit} />
      <Row label="Source">
        <input className="field font-mono text-[10px]" value={block.src} onChange={(e) => live({ src: e.target.value })} onBlur={commit} />
      </Row>
      <Row label="Alt text">
        <input className="field" value={block.alt ?? ""} placeholder="Describe the image" onChange={(e) => live({ alt: e.target.value })} onBlur={commit} />
      </Row>
    </Section>
  );
}

function StrokePanel({ block, live, patch, commit }: P<ShapeBlock | ImageBlock>) {
  const on = !!block.stroke;
  return (
    <Section
      title="Stroke"
      right={
        <button
          className="text-[10px] text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (on) {
              const { stroke: _s, ...rest } = block;
              void _s;
              patch(rest as Partial<ShapeBlock | ImageBlock>);
              patch({ stroke: undefined } as unknown as Partial<ShapeBlock>);
            } else patch({ stroke: "accent", strokeWidth: block.strokeWidth || 2 } as Partial<ShapeBlock>);
          }}
        >
          {on ? "Remove" : "+ Add"}
        </button>
      }
    >
      {on && (
        <>
          <Row label="Colour">
            <ColorPicker value={block.stroke} onChange={(v) => patch({ stroke: v ?? "accent" } as Partial<ShapeBlock>)} />
          </Row>
          <Row label="Width">
            <SliderNum value={block.strokeWidth} min={0} max={64} step={0.5} onChange={(v) => live({ strokeWidth: v } as Partial<ShapeBlock>)} onCommit={commit} />
          </Row>
          <Row label="Style">
            <Seg
              value={block.strokeStyle}
              onChange={(v) => patch({ strokeStyle: v } as Partial<ShapeBlock>)}
              options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dash" }, { value: "dotted", label: "Dot" }]}
            />
          </Row>
          <Row label="Align">
            <Seg
              value={block.strokeAlign}
              onChange={(v) => patch({ strokeAlign: v } as Partial<ShapeBlock>)}
              options={[{ value: "inside", label: "In" }, { value: "center", label: "Centre" }, { value: "outside", label: "Out" }]}
            />
          </Row>
        </>
      )}
    </Section>
  );
}

function ShadowPanel({ block, live, patch, commit }: P) {
  const sh = block.shadow;
  const set = (p: Partial<Shadow>) => sh && live({ shadow: { ...sh, ...p } });
  return (
    <Section
      title="Shadow"
      right={
        <button
          className="text-[10px] text-muted-foreground hover:text-foreground"
          onClick={() => patch({ shadow: sh ? undefined : { x: 0, y: 24, blur: 48, color: "#000000", opacity: 0.45 } } as Partial<Block>)}
        >
          {sh ? "Remove" : "+ Add"}
        </button>
      }
    >
      {sh && (
        <>
          <div className="grid grid-cols-3 gap-1.5">
            <Num prefix="X" value={sh.x} onChange={(v) => set({ x: v })} onCommit={commit} />
            <Num prefix="Y" value={sh.y} onChange={(v) => set({ y: v })} onCommit={commit} />
            <Num prefix="B" value={sh.blur} min={0} onChange={(v) => set({ blur: v })} onCommit={commit} />
          </div>
          <Row label="Colour">
            <ColorPicker value={sh.color} onChange={(v) => set({ color: v ?? "#000000" })} />
          </Row>
          <Row label="Opacity">
            <SliderNum value={Math.round(sh.opacity * 100)} min={0} max={100} suffix="%" onChange={(v) => set({ opacity: v / 100 })} onCommit={commit} />
          </Row>
          <div className="flex gap-1">
            <button className="tool-btn h-7 flex-1 text-[11px]" onClick={() => patch({ shadow: { x: 0, y: 24, blur: 48, color: "#000000", opacity: 0.45 } })}>Soft</button>
            <button className="tool-btn h-7 flex-1 text-[11px]" onClick={() => patch({ shadow: { x: 0, y: 0, blur: 60, color: "accent", opacity: 0.7 } })}>Glow</button>
            <button className="tool-btn h-7 flex-1 text-[11px]" onClick={() => patch({ shadow: { x: 12, y: 12, blur: 0, color: "#000000", opacity: 1 } })}>Hard</button>
          </div>
        </>
      )}
    </Section>
  );
}

/**
 * Shared inspector controls. Every numeric control supports direct typing,
 * arrow-key nudge (Shift = ×10), and scrub-drag on the label.
 */
import { Pipette } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ThemeColorKey, isGradient, type Gradient, type Paint, type Theme } from "@/lib/ast/schema";
import { useEditor } from "@/lib/editor/store";

// ---- layout ---------------------------------------------------------------

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="space-y-2.5 border-b px-4 py-3.5">
      <div className="flex items-center justify-between">
        <h3 className="eyebrow">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Row({ label, children, cols = "72px 1fr" }: { label: ReactNode; children: ReactNode; cols?: string }) {
  return (
    <div className="grid items-center gap-2" style={{ gridTemplateColumns: cols }}>
      <span className="truncate text-[11px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: ReactNode; title?: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid h-7 rounded-sm bg-black/25 p-0.5" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          title={o.title}
          data-on={o.value === value}
          onClick={() => onChange(o.value)}
          className="flex items-center justify-center rounded-[3px] text-[11px] text-muted-foreground transition-colors hover:text-foreground data-[on=true]:bg-secondary data-[on=true]:text-foreground [&>svg]:h-3.5 [&>svg]:w-3.5"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function IconBtn({ title, onClick, active, disabled, children }: { title: string; onClick: () => void; active?: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <button title={title} onClick={onClick} disabled={disabled} data-active={!!active} className="tool-btn h-7 min-w-7 flex-1 px-1.5">
      {children}
    </button>
  );
}

// ---- numeric --------------------------------------------------------------

type NumProps = {
  value: number;
  onChange: (v: number) => void;
  onCommit?: (() => void) | undefined;
  step?: number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  precision?: number | undefined;
  prefix?: ReactNode;
  suffix?: string | undefined;
  className?: string | undefined;
};

const clamp = (v: number, min?: number, max?: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v));

/** Number field with scrubbable prefix label. */
export function Num({ value, onChange, onCommit, step = 1, min, max, precision = 2, prefix, suffix, className }: NumProps) {
  const [text, setText] = useState<string | null>(null);
  const start = useRef<{ x: number; v: number } | null>(null);

  const fmt = (v: number) => (Number.isFinite(v) ? String(parseFloat(v.toFixed(precision))) : "0");

  const onScrub = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, v: value };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onScrubMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const mult = e.shiftKey ? 10 : 1;
    onChange(clamp(start.current.v + Math.round((e.clientX - start.current.x) / 2) * step * mult, min, max));
  };
  const onScrubEnd = () => {
    if (start.current) onCommit?.();
    start.current = null;
  };

  return (
    <div className={`field flex items-center gap-1 px-0 ${className ?? ""}`}>
      {prefix !== undefined && (
        <span
          className="flex h-full min-w-6 cursor-ew-resize select-none items-center justify-center px-1.5 text-[10px] text-muted-foreground"
          onPointerDown={onScrub}
          onPointerMove={onScrubMove}
          onPointerUp={onScrubEnd}
          onPointerCancel={onScrubEnd}
        >
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        className="h-full min-w-0 flex-1 bg-transparent px-1 tabular-nums outline-none"
        value={text ?? fmt(value)}
        onChange={(e) => {
          setText(e.target.value);
          const v = parseFloat(e.target.value);
          if (Number.isFinite(v)) onChange(clamp(v, min, max));
        }}
        onBlur={() => {
          setText(null);
          onCommit?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const d = (e.key === "ArrowUp" ? 1 : -1) * step * (e.shiftKey ? 10 : 1);
            onChange(clamp(parseFloat((value + d).toFixed(precision)), min, max));
            setText(null);
          }
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
      {suffix && <span className="pr-1.5 text-[10px] text-muted-foreground">{suffix}</span>}
    </div>
  );
}

/** Slider + number field pair. */
export function SliderNum({ value, onChange, onCommit, min = 0, max = 100, step = 1, suffix }: NumProps) {
  return (
    <div className="grid grid-cols-[1fr_64px] items-center gap-2">
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0]!)} onValueCommit={() => onCommit?.()} />
      <Num value={value} onChange={onChange} onCommit={onCommit} min={min} max={max} step={step} suffix={suffix} />
    </div>
  );
}

/** 360° rotation dial. Shift snaps to 15°. */
export function Dial({ value, onChange, onCommit }: { value: number; onChange: (v: number) => void; onCommit?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    if (!(e.buttons & 1) || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const a = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI + 90;
    let deg = ((a % 360) + 360) % 360;
    if (e.shiftKey) deg = Math.round(deg / 15) * 15;
    onChange(Math.round(deg * 10) / 10);
  };
  return (
    <div className="grid grid-cols-[28px_1fr] items-center gap-2">
      <div
        ref={ref}
        className="relative h-7 w-7 cursor-grab rounded-full border border-input bg-black/25 active:cursor-grabbing"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={move}
        onPointerUp={() => onCommit?.()}
      >
        <span className="absolute top-1/2 left-1/2 h-1/2 w-px origin-top -translate-x-1/2 bg-accent" style={{ transform: `translateX(-50%) rotate(${value + 180}deg)` }} />
        <span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
      </div>
      <Num value={value} onChange={(v) => onChange(((v % 360) + 360) % 360)} onCommit={onCommit} step={1} suffix="°" />
    </div>
  );
}

// ---- colour ---------------------------------------------------------------

const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};
const rgbToHex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");

const RECENT_KEY = "aurora-recent-colors";
function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function pushRecent(c: string) {
  const next = [c, ...readRecent().filter((x) => x !== c)].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

export function Swatch({ value, theme, onClick, active, title, size = "h-5 w-5" }: { value: string | undefined; theme: Theme; onClick?: () => void; active?: boolean; title?: string; size?: string }) {
  const keys = ThemeColorKey.options as readonly string[];
  const css = !value ? "transparent" : keys.includes(value) ? theme.colors[value as ThemeColorKey] : value;
  return (
    <button
      title={title ?? value}
      onClick={onClick}
      data-on={!!active}
      className={`${size} shrink-0 rounded-full ring-offset-1 ring-offset-panel transition-shadow data-[on=true]:ring-2 data-[on=true]:ring-accent`}
      style={{
        background: value ? css : "repeating-conic-gradient(oklch(1 0 0 / 12%) 0 25%, transparent 0 50%) 0 0 / 8px 8px",
        boxShadow: "inset 0 0 0 1px oklch(1 0 0 / 15%)",
      }}
    />
  );
}

/** Token swatches + hex/RGB entry + eyedropper + recents. */
export function ColorPicker({ value, onChange, allowNone, label }: { value: string | undefined; onChange: (v: string | undefined) => void; allowNone?: boolean; label?: string }) {
  const theme = useEditor((s) => s.deck.theme);
  const keys = ThemeColorKey.options;
  const isToken = value ? (keys as readonly string[]).includes(value) : false;
  const hex = !value ? "#ffffff" : isToken ? theme.colors[value as ThemeColorKey] : value.slice(0, 7);
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);
  const rgb = hexToRgb(hex);
  const commitHex = (h: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(h)) return;
    onChange(h.toLowerCase());
    pushRecent(h.toLowerCase());
  };
  const hasEyedropper = typeof window !== "undefined" && "EyeDropper" in window;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="field flex items-center gap-2 px-1.5 text-left">
          <Swatch value={value} theme={theme} size="h-4 w-4" />
          <span className="flex-1 truncate font-mono text-[11px]">{value ? (isToken ? value : value.toUpperCase()) : label ?? "None"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" className="w-60 space-y-3 p-3">
        <div>
          <p className="eyebrow mb-1.5">Theme</p>
          <div className="flex flex-wrap gap-1.5">
            {allowNone && <Swatch value={undefined} theme={theme} title="None" active={!value} onClick={() => onChange(undefined)} />}
            {keys.map((k) => (
              <Swatch key={k} value={k} theme={theme} active={value === k} onClick={() => onChange(k)} />
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-1.5">Custom</p>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={hex}
              onChange={(e) => onChange(e.target.value)}
              onBlur={(e) => pushRecent(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded-sm border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border [&::-webkit-color-swatch]:border-input [&::-webkit-color-swatch-wrapper]:p-0"
            />
            <input
              className="field flex-1 font-mono uppercase"
              defaultValue={hex}
              key={hex}
              onBlur={(e) => commitHex(e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`)}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            />
            {hasEyedropper && (
              <button
                title="Eyedropper"
                className="tool-btn h-7 min-w-7 px-1"
                onClick={async () => {
                  try {
                    const ED = (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper;
                    const r = await new ED().open();
                    commitHex(r.sRGBHex);
                  } catch {
                    /* cancelled */
                  }
                }}
              >
                <Pipette />
              </button>
            )}
          </div>
          <div className="mt-1.5 grid grid-cols-3 gap-1">
            {(["r", "g", "b"] as const).map((ch) => (
              <Num
                key={ch}
                prefix={ch.toUpperCase()}
                value={rgb[ch]}
                min={0}
                max={255}
                onChange={(v) => onChange(rgbToHex(ch === "r" ? v : rgb.r, ch === "g" ? v : rgb.g, ch === "b" ? v : rgb.b))}
                precision={0}
              />
            ))}
          </div>
        </div>
        {recent.length > 0 && (
          <div>
            <p className="eyebrow mb-1.5">Recent</p>
            <div className="flex flex-wrap gap-1.5">
              {recent.map((c) => (
                <Swatch key={c} value={c} theme={theme} active={value === c} onClick={() => onChange(c)} />
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ---- paint (solid / gradient) ---------------------------------------------

const defaultGradient = (from: string): Gradient => ({
  type: "linear",
  angle: 135,
  stops: [
    { offset: 0, color: from },
    { offset: 1, color: "accent" },
  ],
});

export function PaintEditor({ value, onChange }: { value: Paint; onChange: (p: Paint) => void }) {
  const theme = useEditor((s) => s.deck.theme);
  const grad = isGradient(value) ? value : null;
  const mode = grad ? grad.type : "solid";
  const [active, setActive] = useState(0);

  const setMode = (m: "solid" | "linear" | "radial") => {
    if (m === "solid") onChange(grad ? grad.stops[0]!.color : value);
    else onChange({ ...(grad ?? defaultGradient(typeof value === "string" ? value : "surface")), type: m });
  };

  const updateStop = (i: number, patch: Partial<Gradient["stops"][number]>) => {
    if (!grad) return;
    const stops = grad.stops.map((s, j) => (j === i ? { ...s, ...patch } : s));
    onChange({ ...grad, stops });
  };

  const css = grad
    ? `${grad.type === "linear" ? `linear-gradient(${grad.angle}deg` : "radial-gradient(circle"}, ${grad.stops
        .map((s) => `${(ThemeColorKey.options as readonly string[]).includes(s.color) ? theme.colors[s.color as ThemeColorKey] : s.color} ${s.offset * 100}%`)
        .join(", ")})`
    : undefined;

  return (
    <div className="space-y-2">
      <Seg value={mode} onChange={setMode} options={[{ value: "solid", label: "Solid" }, { value: "linear", label: "Linear" }, { value: "radial", label: "Radial" }]} />
      {!grad && <ColorPicker value={value as string} onChange={(v) => onChange(v ?? "surface")} />}
      {grad && (
        <>
          <div className="relative h-6 rounded-sm border border-input" style={{ background: css }}>
            {grad.stops.map((s, i) => (
              <button
                key={i}
                data-on={i === active}
                onClick={() => setActive(i)}
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-panel ring-1 ring-foreground/40 data-[on=true]:ring-accent"
                style={{ left: `${s.offset * 100}%`, background: (ThemeColorKey.options as readonly string[]).includes(s.color) ? theme.colors[s.color as ThemeColorKey] : s.color }}
              />
            ))}
          </div>
          <div className="grid grid-cols-[1fr_64px_24px] items-center gap-1.5">
            <ColorPicker value={grad.stops[active]?.color} onChange={(v) => updateStop(active, { color: v ?? "accent" })} />
            <Num value={(grad.stops[active]?.offset ?? 0) * 100} min={0} max={100} precision={0} suffix="%" onChange={(v) => updateStop(active, { offset: v / 100 })} />
            <button
              title="Remove stop"
              disabled={grad.stops.length <= 2}
              className="tool-btn h-7 min-w-6 px-0 text-xs"
              onClick={() => {
                onChange({ ...grad, stops: grad.stops.filter((_, i) => i !== active) });
                setActive(0);
              }}
            >
              –
            </button>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            {grad.type === "linear" ? <Dial value={grad.angle} onChange={(v) => onChange({ ...grad, angle: v })} /> : <span />}
            <button
              className="tool-btn h-7 text-[11px]"
              onClick={() => {
                const last = grad.stops[grad.stops.length - 1]!;
                onChange({ ...grad, stops: [...grad.stops, { offset: Math.min(1, last.offset + 0.001), color: last.color }] });
                setActive(grad.stops.length);
              }}
            >
              + Stop
            </button>
          </div>
        </>
      )}
    </div>
  );
}

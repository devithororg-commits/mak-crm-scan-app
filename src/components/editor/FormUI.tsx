import { useState, type ReactNode } from 'react'

interface SectionProps {
  title: string
  desc?: string
  children: ReactNode
  noPad?: boolean
}

export function Section({ title, desc, children, noPad }: SectionProps) {
  return (
    <section className="animate-fade-in overflow-hidden rounded-[var(--radius-lg)] border border-slate-200/60 bg-white shadow-[var(--shadow-sm)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-3.5">
        <h3 className="text-[13px] font-bold tracking-tight text-slate-800">{title}</h3>
        {desc && <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{desc}</p>}
      </div>
      <div className={noPad ? '' : 'p-5'}>{children}</div>
    </section>
  )
}

interface FieldProps {
  label: string
  children: ReactNode
  hint?: string
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-[12px] border border-slate-200/80 bg-slate-50/50 px-3.5 py-2.5 text-[13px] font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-[3px] focus:ring-indigo-500/10'

export const textareaClass = `${inputClass} resize-none leading-relaxed`

export const btnActive =
  'border-indigo-500/80 bg-indigo-50 text-indigo-700 shadow-[0_0_0_1px_rgba(99,102,241,0.15)]'

export const btnIdle =
  'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'

export const cardClass = 'rounded-[12px] border border-slate-200/60 bg-slate-50/60 p-4'

export const pillBtn =
  'rounded-[10px] border px-3 py-2 text-[12px] font-semibold transition-all duration-200'

export const primaryBtn =
  'inline-flex items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:brightness-105 active:scale-[0.98]'

export const ghostBtn =
  'inline-flex items-center justify-center gap-2 rounded-[12px] border border-slate-200/80 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]'

/** Canva-style segmented control */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-xl border border-slate-200/80 bg-slate-100/80 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`flex-1 rounded-[10px] px-2 py-2 text-[11px] font-semibold transition ${
            value === opt.id ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/** Canva-style slider with label row */
export function SliderControl({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[12px] font-medium text-slate-700">{label}</span>
        <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#8b3dff]"
      />
    </div>
  )
}

/** Property row — label left, control right */
export function PropertyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-[12px] font-medium text-slate-600">{label}</span>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

/** Collapsible tool section — Canva accordion */
export function ToolSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50/80"
      >
        <span className="text-[12px] font-bold text-slate-800">{title}</span>
        <span className="text-[10px] text-slate-400">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-3">{children}</div>}
    </div>
  )
}

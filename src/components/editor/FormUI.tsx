import type { ReactNode } from 'react'

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

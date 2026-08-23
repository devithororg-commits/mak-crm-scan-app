import { useMemo, useState } from 'react'
import { FlaskConical, RotateCcw } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import type { CreativeData } from '../../types/creative'
import { generatePosterVariants, type PosterVariant } from '../../utils/posterVariants'

export default function PosterVariantPanel() {
  const { data, setData } = useCreative()
  const variants = useMemo(() => generatePosterVariants(data), [
    data.accentColor,
    data.secondaryColor,
    data.ctaText,
    data.highlightStyle,
  ])
  const [activeId, setActiveId] = useState<PosterVariant['id'] | null>(null)
  const [baseline, setBaseline] = useState<CreativeData | null>(null)

  const applyVariant = (variant: PosterVariant) => {
    const base = baseline ?? data
    if (!baseline) setBaseline(data)
    setActiveId(variant.id)
    setData({ ...base, ...variant.patch })
  }

  const resetVariants = () => {
    if (baseline) setData(baseline)
    setBaseline(null)
    setActiveId(null)
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-slate-600">
        Visual A/B/C poster variants — test CTA style, highlight, and palette shifts before publishing.
      </p>

      <div className="space-y-2">
        {variants.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => applyVariant(v)}
            className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
              activeId === v.id
                ? 'border-violet-400 bg-violet-50 ring-1 ring-violet-200'
                : 'border-slate-200 bg-white hover:border-violet-200'
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-black text-white">
              {v.id.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold text-slate-900">{v.label}</p>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  {v.score}%
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500">{v.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {(activeId || baseline) && (
        <button
          type="button"
          onClick={resetVariants}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to original design
        </button>
      )}

      <p className="flex items-center gap-1 text-[10px] text-slate-400">
        <FlaskConical className="h-3 w-3" />
        Preview updates live on canvas — pick winner then export
      </p>
    </div>
  )
}

import { useCreative } from '../../store/CreativeContext'
import { STYLE_PRESETS, DENSITY_PRESETS } from '../../utils/stylePresets'

export default function StylePresetsBar({ compact = false }: { compact?: boolean }) {
  const { setData } = useCreative()

  const applyPreset = (id: string) => {
    const preset = STYLE_PRESETS.find((p) => p.id === id)
    if (!preset) return
    setData((prev) => ({ ...prev, ...preset.apply(prev) }))
  }

  const applyDensity = (textScale: number, lineHeightScale: number) => {
    setData((prev) => ({ ...prev, textScale, lineHeightScale }))
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">One-Click Looks</p>
        <div className={`grid gap-1.5 ${compact ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
            >
              <span className="text-sm">{preset.emoji}</span>
              <p className="text-[11px] font-bold text-slate-900">{preset.name}</p>
              <p className="text-[9px] text-slate-500">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Content Density</p>
        <div className="grid grid-cols-3 gap-1.5">
          {DENSITY_PRESETS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => applyDensity(d.textScale, d.lineHeightScale)}
              className="rounded-lg border border-slate-200 py-2 text-[10px] font-semibold text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useCreative } from '../../store/CreativeContext'
import { TYPOGRAPHY_PRESETS } from '../../utils/typographyPresets'

export default function TypographyPresetsPanel() {
  const { setData } = useCreative()

  const apply = (id: string) => {
    const preset = TYPOGRAPHY_PRESETS.find((p) => p.id === id)
    if (!preset) return
    setData((prev) => ({ ...prev, ...preset.apply() }))
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-slate-600">
        One-click type scales for poster hierarchy — headline, body, and spacing tuned for mobile feeds.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {TYPOGRAPHY_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => apply(preset.id)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 text-left transition hover:border-violet-200 hover:bg-violet-50/40"
          >
              <span className="text-base">{preset.emoji}</span>
              <p className="text-[11px] font-bold text-slate-900">{preset.name}</p>
              <p className="text-[9px] text-slate-500">{preset.desc}</p>
            </button>
        ))}
      </div>
    </div>
  )
}

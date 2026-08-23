import { useMemo } from 'react'
import { Palette, Wand2 } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { apply603010, compute603010 } from '../../utils/colorHarmony'

export default function ColorHarmonyPanel() {
  const { data, setData } = useCreative()
  const palette = useMemo(
    () => compute603010(data.accentColor, data.secondaryColor),
    [data.accentColor, data.secondaryColor],
  )

  const applyHarmony = () => {
    if (data.brandLock) return
    setData((prev) => ({ ...prev, ...apply603010(prev) }))
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-slate-600">
        60-30-10 color rule — dominant neutral field, brand secondary, accent for CTA & highlights.
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex h-10">
          <div className="flex-[6]" style={{ background: palette.dominant }} title={palette.labels.dominant} />
          <div className="flex-[3]" style={{ background: palette.secondary }} title={palette.labels.secondary} />
          <div className="flex-[1]" style={{ background: palette.accent }} title={palette.labels.accent} />
        </div>
        <div className="grid grid-cols-3 gap-1 border-t border-slate-100 bg-slate-50 px-2 py-2 text-[9px] font-semibold text-slate-600">
          <span>60% BG</span>
          <span className="text-center">30% Brand</span>
          <span className="text-right">10% CTA</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {([
          ['dominant', palette.dominant, palette.labels.dominant],
          ['secondary', palette.secondary, palette.labels.secondary],
          ['accent', palette.accent, palette.labels.accent],
        ] as const).map(([key, color, label]) => (
          <div key={key} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2">
            <div className="h-7 w-7 shrink-0 rounded-lg ring-1 ring-slate-200" style={{ background: color }} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-800">{label}</p>
              <p className="font-mono text-[9px] text-slate-400">{color}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={applyHarmony}
        disabled={data.brandLock}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-[11px] font-bold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Wand2 className="h-4 w-4" />
        Apply 60-30-10 to Poster
      </button>

      {data.brandLock ? (
        <p className="text-center text-[10px] text-amber-700">Brand Lock is on — unlock in Brand panel to apply colors</p>
      ) : (
        <p className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
          <Palette className="h-3 w-3" />
          Based on your current primary & secondary brand colors
        </p>
      )}
    </div>
  )
}

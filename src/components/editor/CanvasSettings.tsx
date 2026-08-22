import { useCreative } from '../../store/CreativeContext'
import { PLATFORMS, ASPECT_RATIOS } from '../../data/config'
import type { AspectRatio, Platform } from '../../types/creative'
import { AppIcon, PLATFORM_COLORS } from '../icons'
import { Section } from './FormUI'

export default function CanvasSettings({ compact = false }: { compact?: boolean }) {
  const { data, update } = useCreative()

  if (compact) {
    return (
      <div className="space-y-3">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Platform</p>
          <div className="grid grid-cols-3 gap-1.5">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  update('platform', p.id as Platform)
                  if (p.id !== 'custom') update('aspectRatio', p.aspect)
                }}
                className={`rounded-lg border p-2 text-center transition ${
                  data.platform === p.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <AppIcon name={p.icon} size={14} className={`mx-auto ${PLATFORM_COLORS[p.icon] ?? 'text-slate-500'}`} />
                <p className="mt-1 text-[9px] font-medium text-slate-700">{p.label}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Aspect Ratio</p>
          <div className="grid grid-cols-2 gap-1.5">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.id}
                type="button"
                onClick={() => update('aspectRatio', ar.id as AspectRatio)}
                className={`rounded-lg border px-2 py-2 text-left transition ${
                  data.aspectRatio === ar.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="text-[10px] font-semibold text-slate-900">{ar.label}</p>
                <p className="text-[8px] text-slate-500">{ar.w}×{ar.h}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Section title="Canvas & Format" desc="Platform size — preview updates live">
      <div className="grid grid-cols-3 gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              update('platform', p.id as Platform)
              if (p.id !== 'custom') update('aspectRatio', p.aspect)
            }}
            className={`rounded-xl border p-3 text-center transition ${
              data.platform === p.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm mx-auto ${PLATFORM_COLORS[p.icon] ?? 'text-slate-600'}`}>
              <AppIcon name={p.icon} size={18} />
            </span>
            <p className="mt-1 text-[10px] font-medium text-slate-900">{p.label}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {ASPECT_RATIOS.map((ar) => (
          <button
            key={ar.id}
            type="button"
            onClick={() => update('aspectRatio', ar.id as AspectRatio)}
            className={`rounded-xl border px-3 py-3 text-left transition ${
              data.aspectRatio === ar.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <p className="text-xs font-semibold text-slate-900">{ar.label}</p>
            <p className="text-[10px] text-slate-500">{ar.w}×{ar.h} · {ar.platform}</p>
          </button>
        ))}
      </div>
    </Section>
  )
}

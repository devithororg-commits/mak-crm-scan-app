import { useCreative } from '../../store/CreativeContext'
import type { TextTransform } from '../../types/creative'
import { Field, Section } from './FormUI'

const TRANSFORMS: { id: TextTransform; label: string }[] = [
  { id: 'none', label: 'Normal' },
  { id: 'uppercase', label: 'UPPER' },
  { id: 'capitalize', label: 'Title Case' },
  { id: 'lowercase', label: 'lower' },
]

function Slider({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="text-[11px] text-slate-700">{label}</span>
        <span className="text-[10px] font-mono text-violet-700">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-1.5 w-full accent-violet-600" />
    </div>
  )
}

export default function TextEffectsEditor() {
  const { data, update } = useCreative()

  return (
    <Section title="Text Effects" desc="Shadow, outline & casing — Canva Effects panel">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Text casing</p>
          <div className="grid grid-cols-2 gap-1.5">
            {TRANSFORMS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => update('textTransform', t.id)}
                className={`rounded-xl border py-2 text-[11px] font-semibold transition ${
                  data.textTransform === t.id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <Slider label="Content opacity" value={data.contentOpacity} min={20} max={100} unit="%" onChange={(v) => update('contentOpacity', v)} />

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
          <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-800">
            <input type="checkbox" checked={data.textShadowEnabled} onChange={(e) => update('textShadowEnabled', e.target.checked)} className="rounded accent-violet-600" />
            Drop shadow
          </label>
          {data.textShadowEnabled && (
            <>
              <Slider label="Blur" value={data.textShadowBlur} min={0} max={24} unit="px" onChange={(v) => update('textShadowBlur', v)} />
              <Slider label="Offset X" value={data.textShadowOffsetX} min={-12} max={12} unit="px" onChange={(v) => update('textShadowOffsetX', v)} />
              <Slider label="Offset Y" value={data.textShadowOffsetY} min={-12} max={12} unit="px" onChange={(v) => update('textShadowOffsetY', v)} />
              <Field label="Shadow color">
                <input type="color" value={data.textShadowColor.startsWith('#') ? data.textShadowColor : '#000000'} onChange={(e) => update('textShadowColor', e.target.value)} className="h-10 w-full cursor-pointer rounded-xl" />
              </Field>
            </>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
          <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-800">
            <input type="checkbox" checked={data.textOutlineEnabled} onChange={(e) => update('textOutlineEnabled', e.target.checked)} className="rounded accent-violet-600" />
            Text outline (stroke)
          </label>
          {data.textOutlineEnabled && (
            <>
              <Slider label="Outline width" value={data.textOutlineWidth} min={1} max={4} unit="px" onChange={(v) => update('textOutlineWidth', v)} />
              <Field label="Outline color">
                <input type="color" value={data.textOutlineColor} onChange={(e) => update('textOutlineColor', e.target.value)} className="h-10 w-full cursor-pointer rounded-xl" />
              </Field>
            </>
          )}
        </div>
      </div>
    </Section>
  )
}

import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import type { TextAlign } from '../../types/creative'
import { FONT_SIZE_LIMITS } from '../../utils/typography'

const ALIGN_OPTIONS: { id: TextAlign; label: string; icon: typeof AlignLeft }[] = [
  { id: 'left', label: 'Left', icon: AlignLeft },
  { id: 'center', label: 'Center', icon: AlignCenter },
  { id: 'right', label: 'Right', icon: AlignRight },
]

function Slider({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="text-[11px] text-slate-700">{label}</span>
        <span className="text-[10px] font-mono text-indigo-700">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-indigo-500"
      />
    </div>
  )
}

export default function LayoutSpacingEditor() {
  const { data, update } = useCreative()
  const limits = FONT_SIZE_LIMITS

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Text Alignment</p>
        <div className="grid grid-cols-3 gap-1.5">
          {ALIGN_OPTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => update('textAlign', id)}
              className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-[10px] font-semibold transition ${
                data.textAlign === id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <Slider
        label="Line Height"
        value={data.lineHeightScale}
        min={limits.lineHeightScale.min}
        max={limits.lineHeightScale.max}
        unit="%"
        onChange={(v) => update('lineHeightScale', v)}
      />

      <Slider
        label="Letter Spacing (Title)"
        value={data.letterSpacing}
        min={limits.letterSpacing.min}
        max={limits.letterSpacing.max}
        unit="px"
        onChange={(v) => update('letterSpacing', v)}
      />

      <Slider
        label="Footer Padding"
        value={data.footerPadding}
        min={8}
        max={40}
        unit="px"
        onChange={(v) => update('footerPadding', v)}
      />

      <Slider
        label="Footer Background Opacity"
        value={data.footerBgOpacity}
        min={0}
        max={30}
        unit="%"
        onChange={(v) => update('footerBgOpacity', v)}
      />
    </div>
  )
}

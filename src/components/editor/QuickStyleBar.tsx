import { Palette, Type, ZoomIn } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { COLOR_PALETTES } from '../../data/config'
import type { HighlightStyle } from '../../types/creative'
import { getHighlightStyle } from '../../utils/textHighlight'

const HIGHLIGHT_STYLES: { id: HighlightStyle; label: string }[] = [
  { id: 'accent', label: 'Accent' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'underline', label: 'Underline' },
  { id: 'background', label: 'BG' },
  { id: 'bold', label: 'Bold' },
]

export default function QuickStyleBar() {
  const { data, update } = useCreative()
  const previewStyle = getHighlightStyle(data)

  return (
    <div className="overflow-hidden rounded-[14px] border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-2.5">
        <Palette className="h-4 w-4 text-indigo-500" />
        <p className="text-[12px] font-bold text-slate-900">Quick Style</p>
        <span className="ml-auto text-[10px] text-slate-400">Live preview</span>
      </div>

      <div className="space-y-3 p-4">
        {/* Color swatches */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <Palette className="h-3 w-3" /> Brand Colors
          </p>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PALETTES.map((pal) => (
              <button
                key={pal.name}
                type="button"
                title={pal.name}
                onClick={() => {
                  update('accentColor', pal.primary)
                  update('secondaryColor', pal.secondary)
                }}
                className={`flex h-8 w-8 overflow-hidden rounded-lg border-2 transition hover:scale-105 ${
                  data.accentColor === pal.primary ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-white shadow-sm'
                }`}
              >
                <div className="h-full w-1/2" style={{ background: pal.primary }} />
                <div className="h-full w-1/2" style={{ background: pal.secondary }} />
              </button>
            ))}
          </div>
        </div>

        {/* Highlight styles */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <Type className="h-3 w-3" /> Word Highlight
          </p>
          <div className="flex flex-wrap gap-1.5">
            {HIGHLIGHT_STYLES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => update('highlightStyle', id)}
                className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition ${
                  data.highlightStyle === id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-600">
            Sample: <mark className="bg-transparent" style={previewStyle}>highlighted</mark> text
          </p>
        </div>

        {/* Text scale */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <ZoomIn className="h-3 w-3" /> Text Scale
            </p>
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">{data.textScale}%</span>
          </div>
          <input
            type="range"
            min={75}
            max={160}
            value={data.textScale}
            onChange={(e) => update('textScale', Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-indigo-500"
          />
        </div>
      </div>
    </div>
  )
}

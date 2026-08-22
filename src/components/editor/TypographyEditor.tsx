import { useCreative } from '../../store/CreativeContext'
import { FONT_SIZE_DEFAULTS, FONT_SIZE_LIMITS } from '../../utils/typography'
import { HighlightStylePicker } from './HighlightField'
import { Section } from './FormUI'

function SizeSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-700">{label}</span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-indigo-700">{value}px</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-indigo-500"
      />
      <div className="mt-0.5 flex justify-between text-[9px] text-slate-600">
        <span>{min}px</span>
        <span>{max}px</span>
      </div>
    </div>
  )
}

export default function TypographyEditor() {
  const { data, update } = useCreative()
  const limits = FONT_SIZE_LIMITS

  return (
    <>
      <Section title="Text Size" desc="Adjust font sizes — live preview updates instantly">
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900">Master Scale</span>
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              {data.textScale}%
            </span>
          </div>
          <input
            type="range"
            min={limits.textScale.min}
            max={limits.textScale.max}
            value={data.textScale}
            onChange={(e) => update('textScale', Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-indigo-500"
          />
          <div className="mt-1 flex justify-between text-[9px] text-slate-500">
            <span>75% Smaller</span>
            <span>100% Default</span>
            <span>160% Larger</span>
          </div>
        </div>

        <div className="space-y-4">
          <SizeSlider
            label="Title / Headline"
            value={data.titleFontSize}
            min={limits.titleFontSize.min}
            max={limits.titleFontSize.max}
            onChange={(v) => update('titleFontSize', v)}
          />
          <SizeSlider
            label="Subtitle"
            value={data.subtitleFontSize}
            min={limits.subtitleFontSize.min}
            max={limits.subtitleFontSize.max}
            onChange={(v) => update('subtitleFontSize', v)}
          />
          <SizeSlider
            label="Body / Description"
            value={data.bodyFontSize}
            min={limits.bodyFontSize.min}
            max={limits.bodyFontSize.max}
            onChange={(v) => update('bodyFontSize', v)}
          />
          <SizeSlider
            label="Metrics / Numbers"
            value={data.metricFontSize}
            min={limits.metricFontSize.min}
            max={limits.metricFontSize.max}
            onChange={(v) => update('metricFontSize', v)}
          />
          <SizeSlider
            label="Labels / Small Text"
            value={data.labelFontSize}
            min={limits.labelFontSize.min}
            max={limits.labelFontSize.max}
            onChange={(v) => update('labelFontSize', v)}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            update('titleFontSize', FONT_SIZE_DEFAULTS.titleFontSize)
            update('subtitleFontSize', FONT_SIZE_DEFAULTS.subtitleFontSize)
            update('bodyFontSize', FONT_SIZE_DEFAULTS.bodyFontSize)
            update('metricFontSize', FONT_SIZE_DEFAULTS.metricFontSize)
            update('labelFontSize', FONT_SIZE_DEFAULTS.labelFontSize)
            update('textScale', FONT_SIZE_DEFAULTS.textScale)
            update('textAlign', FONT_SIZE_DEFAULTS.textAlign)
            update('lineHeightScale', FONT_SIZE_DEFAULTS.lineHeightScale)
            update('letterSpacing', FONT_SIZE_DEFAULTS.letterSpacing)
          }}
          className="mt-4 w-full rounded-xl border border-slate-200 py-2 text-xs text-slate-400 transition hover:border-slate-300 hover:text-slate-900"
        >
          Reset to default sizes
        </button>
      </Section>

      <Section title="Word Highlight" desc="Emphasize key words in title, subtitle & description">
        <HighlightStylePicker />
      </Section>
    </>
  )
}

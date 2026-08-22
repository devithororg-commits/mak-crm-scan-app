import { useCreative } from '../../store/CreativeContext'
import { IMAGE_FILTER_PRESETS, applyFilterPreset } from '../../utils/imageFilters'
import { Field, Section, inputClass } from './FormUI'

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

export default function EffectsEditor({ bare = false }: { bare?: boolean }) {
  const { data, update, setData } = useCreative()

  const inner = (
    <div className="space-y-5">
        {/* Image filters */}
        {data.showCreativeImage && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Photo Filters</p>
            <div className="grid grid-cols-4 gap-1.5">
              {IMAGE_FILTER_PRESETS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, ...applyFilterPreset(f.id) }))}
                  className={`rounded-lg border py-2 text-center transition ${
                    data.imageFilter === f.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-[9px] font-medium text-slate-900">{f.name}</p>
                </button>
              ))}
            </div>
            <Slider label="Brightness" value={data.imageBrightness} min={70} max={130} unit="%" onChange={(v) => update('imageBrightness', v)} />
            <Slider label="Contrast" value={data.imageContrast} min={70} max={150} unit="%" onChange={(v) => update('imageContrast', v)} />
            <Slider label="Saturation" value={data.imageSaturation} min={0} max={150} unit="%" onChange={(v) => update('imageSaturation', v)} />
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Image Effects</p>
          <Slider label="Image Opacity" value={data.imageOpacity} min={0} max={100} unit="%" onChange={(v) => update('imageOpacity', v)} />
          <Slider label="Corner Radius" value={data.imageBorderRadius} min={0} max={48} unit="px" onChange={(v) => update('imageBorderRadius', v)} />
          <Slider label="Image Margin" value={data.imageMargin} min={0} max={40} unit="px" onChange={(v) => update('imageMargin', v)} />
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700">
              <input type="checkbox" checked={data.imageBorder} onChange={(e) => update('imageBorder', e.target.checked)} className="rounded accent-indigo-500" />
              Border
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700">
              <input type="checkbox" checked={data.imageShadow} onChange={(e) => update('imageShadow', e.target.checked)} className="rounded accent-indigo-500" />
              Shadow
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={data.imageGradientOverlay} onChange={(e) => update('imageGradientOverlay', e.target.checked)} className="rounded accent-indigo-500" />
            Gradient overlay (text readability)
          </label>
          {data.imageGradientOverlay && (
            <Slider label="Gradient Strength" value={data.imageGradientStrength} min={20} max={90} unit="%" onChange={(v) => update('imageGradientStrength', v)} />
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={data.showWatermark} onChange={(e) => update('showWatermark', e.target.checked)} className="rounded accent-indigo-500" />
            Show watermark on creative
          </label>
          {data.showWatermark && (
            <Field label="Watermark Text">
              <input type="text" value={data.watermarkText} onChange={(e) => update('watermarkText', e.target.value)} placeholder="DRAFT" className={inputClass} />
            </Field>
          )}
        </div>
      </div>
  )

  if (bare) return inner

  return (
    <Section title="Visual Effects" desc="Overlays, opacity, borders & watermark">
      {inner}
    </Section>
  )
}

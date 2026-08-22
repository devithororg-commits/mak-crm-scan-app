import { useCreative } from '../../store/CreativeContext'
import { COLOR_PALETTES, FONT_OPTIONS } from '../../data/config'
import type { FontFamily } from '../../types/creative'
import LogoEditor from './LogoEditor'
import TypographyEditor from './TypographyEditor'
import { Field, Section, inputClass } from './FormUI'

export default function BrandKitEditor() {
  const { data, update } = useCreative()

  return (
    <>
      <Section title="Color Palette" desc="Brand colors applied across template">
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PALETTES.map((pal) => (
            <button
              key={pal.name}
              type="button"
              onClick={() => {
                update('accentColor', pal.primary)
                update('secondaryColor', pal.secondary)
              }}
              className={`group rounded-xl border p-2 transition ${
                data.accentColor === pal.primary
                  ? 'border-indigo-500 ring-2 ring-indigo-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex gap-1">
                <div className="h-6 flex-1 rounded-md" style={{ background: pal.primary }} />
                <div className="h-6 flex-1 rounded-md" style={{ background: pal.secondary }} />
              </div>
              <p className="mt-1.5 text-[9px] text-slate-400">{pal.name}</p>
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Primary Color">
            <div className="flex items-center gap-2">
              <input type="color" value={data.accentColor} onChange={(e) => update('accentColor', e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent" />
              <input type="text" value={data.accentColor} onChange={(e) => update('accentColor', e.target.value)} className={inputClass} />
            </div>
          </Field>
          <Field label="Secondary Color">
            <div className="flex items-center gap-2">
              <input type="color" value={data.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent" />
              <input type="text" value={data.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} className={inputClass} />
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Font Family">
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => update('fontFamily', font.id as FontFamily)}
              className={`rounded-xl border p-3 text-left transition ${
                data.fontFamily === font.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-semibold text-slate-900" style={{ fontFamily: font.id }}>{font.label}</p>
              <p className="text-[10px] text-slate-500">{font.sample}</p>
            </button>
          ))}
        </div>
      </Section>

      <TypographyEditor />

      <LogoEditor />

      <Section title="Watermark">
        <label className="mb-3 flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" checked={data.showWatermark} onChange={(e) => update('showWatermark', e.target.checked)} className="rounded accent-indigo-500" />
          Show watermark on creative
        </label>
        {data.showWatermark && (
          <Field label="Watermark Text">
            <input type="text" value={data.watermarkText} onChange={(e) => update('watermarkText', e.target.value)} className={inputClass} />
          </Field>
        )}
      </Section>
    </>
  )
}

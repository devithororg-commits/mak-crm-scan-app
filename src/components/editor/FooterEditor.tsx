import { useCreative } from '../../store/CreativeContext'
import { FOOTER_STYLES } from '../../data/config'
import type { FooterAlign, FooterStyle } from '../../types/creative'
import { Field, Section, inputClass } from './FormUI'

const ALIGN_OPTIONS: { id: FooterAlign; label: string }[] = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
  { id: 'split', label: 'Split' },
]

const FOOTER_FIELDS = [
  { key: 'footerLine1' as const, label: 'Line 1 — Company / Name', ph: 'MAK Projects Pvt Ltd', toggle: null },
  { key: 'footerLine2' as const, label: 'Line 2 — Website / Tagline', ph: 'www.makprojects.com', toggle: 'footerShowWebsite' as const },
  { key: 'footerLine3' as const, label: 'Line 3 — Location', ph: 'Hyderabad · India', toggle: 'footerShowLocation' as const },
  { key: 'footerLine4' as const, label: 'Line 4 — Extra (optional)', ph: 'RERA: P02400001288', toggle: null },
  { key: 'footerPhone' as const, label: 'Phone', ph: '+91 99127 97979', toggle: 'footerShowPhone' as const },
  { key: 'footerEmail' as const, label: 'Email', ph: 'info@makprojects.com', toggle: 'footerShowEmail' as const },
  { key: 'footerWebsite' as const, label: 'Website (right side)', ph: 'www.makprojects.com', toggle: 'footerShowWebsite' as const },
]

function SizeSlider({ label, value, min, max, unit, onChange }: {
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

export default function FooterEditor({ bare = false }: { bare?: boolean }) {
  const { data, update } = useCreative()

  const inner = (
    <>
      <label className="mb-4 flex items-center gap-2 text-xs text-slate-700">
        <input type="checkbox" checked={data.showFooter} onChange={(e) => update('showFooter', e.target.checked)} className="rounded accent-indigo-500" />
        Show footer on creative
      </label>

      {data.showFooter && (
        <div className="space-y-5">
          {/* Style & Layout */}
          <div>
            <span className="mb-2 block text-[11px] font-medium text-slate-700">Footer Style</span>
            <div className="grid grid-cols-3 gap-1.5">
              {FOOTER_STYLES.map((fs) => (
                <button
                  key={fs.id}
                  type="button"
                  onClick={() => update('footerStyle', fs.id as FooterStyle)}
                  className={`rounded-lg border px-2 py-2.5 text-center transition ${
                    data.footerStyle === fs.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-[10px] font-semibold text-slate-900">{fs.label}</p>
                  <p className="text-[8px] text-slate-500">{fs.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-[11px] font-medium text-slate-700">Text Alignment</span>
            <div className="grid grid-cols-4 gap-1.5">
              {ALIGN_OPTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => update('footerAlign', a.id)}
                  className={`rounded-lg border py-2 text-[10px] font-medium transition ${
                    data.footerAlign === a.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Typography & sizing */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Footer Typography</p>
            <SizeSlider label="Text Size" value={data.footerFontSize} min={8} max={18} unit="px" onChange={(v) => update('footerFontSize', v)} />
            <SizeSlider label="Padding" value={data.footerPadding} min={8} max={40} unit="px" onChange={(v) => update('footerPadding', v)} />
            <SizeSlider label="Background Opacity" value={data.footerBgOpacity} min={0} max={30} unit="%" onChange={(v) => update('footerBgOpacity', v)} />
          </div>

          {/* Visibility toggles */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Show / Hide Elements</p>
            <p className="mb-3 text-[10px] text-slate-500">Logo size controls are in Brand → Logo Size Controls → Footer Logo</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'footerShowLogo' as const, label: 'Logo' },
                { key: 'footerShowPhone' as const, label: 'Phone' },
                { key: 'footerShowEmail' as const, label: 'Email' },
                { key: 'footerShowWebsite' as const, label: 'Website' },
                { key: 'footerShowLocation' as const, label: 'Location' },
                { key: 'footerBorderTop' as const, label: 'Top Border' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-[11px] text-slate-700">
                  <input
                    type="checkbox"
                    checked={data[item.key]}
                    onChange={(e) => update(item.key, e.target.checked)}
                    className="rounded accent-indigo-500"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Text fields */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Footer Text Content</p>
            {FOOTER_FIELDS.map((f) => (
              <Field key={f.key} label={f.label}>
                <input
                  type="text"
                  value={data[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.ph}
                  className={inputClass}
                />
              </Field>
            ))}
          </div>

          <Field label="Custom Text Color" hint="Leave empty for auto (inherits from template)">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.footerTextColor || '#334155'}
                onChange={(e) => update('footerTextColor', e.target.value)}
                className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent"
              />
              <input
                type="text"
                value={data.footerTextColor}
                onChange={(e) => update('footerTextColor', e.target.value)}
                placeholder="Auto"
                className={inputClass}
              />
              {data.footerTextColor && (
                <button type="button" onClick={() => update('footerTextColor', '')} className="text-[10px] text-slate-500 hover:text-slate-900">Clear</button>
              )}
            </div>
          </Field>

          {/* Mini preview */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <p className="bg-slate-50 px-3 py-1.5 text-[9px] text-slate-500">Footer Preview</p>
            <div
              className="flex items-center gap-2 bg-white px-4 text-slate-800"
              style={{
                padding: data.footerPadding,
                fontSize: data.footerFontSize,
                justifyContent: data.footerAlign === 'center' ? 'center' : data.footerAlign === 'right' ? 'flex-end' : 'space-between',
                backgroundColor: `rgba(0,0,0,${data.footerBgOpacity / 100})`,
                color: data.footerTextColor || undefined,
                borderTop: data.footerBorderTop ? '1px solid rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <div className="flex items-center gap-2">
                {data.footerShowLogo && (
                  data.logoUrl ? (
                    <img
                      src={data.logoUrl}
                      alt=""
                      style={{
                        width: data.footerLogoSize,
                        height: data.footerLogoSize,
                        borderRadius: data.footerLogoRadius >= 999 ? '50%' : data.footerLogoRadius,
                        objectFit: data.footerLogoFit,
                      }}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center rounded-md bg-indigo-600 font-bold text-white"
                      style={{ width: data.footerLogoSize, height: data.footerLogoSize, fontSize: data.footerFontSize }}
                    >
                      {(data.footerLine1 || 'M')[0]}
                    </div>
                  )
                )}
                <div>
                  {data.footerLine1 && <p className="font-semibold">{data.footerLine1}</p>}
                  {data.footerShowLocation && data.footerLine3 && <p className="opacity-50">{data.footerLine3}</p>}
                </div>
              </div>
              <div className="text-right opacity-60">
                {data.footerShowWebsite && data.footerWebsite && <p>{data.footerWebsite}</p>}
                {data.footerShowPhone && data.footerPhone && <p>{data.footerPhone}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )

  if (bare) return inner

  return (
    <Section title="Footer Controls" desc="Full control over footer text, style & visibility">
      {inner}
    </Section>
  )
}

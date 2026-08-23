import { Lock, Unlock } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { COLOR_PALETTES, FONT_OPTIONS } from '../../data/config'
import type { FontFamily } from '../../types/creative'
import LogoEditor from './LogoEditor'
import { Field, Section, inputClass } from './FormUI'

export default function BrandKitEditor() {
  const { data, update } = useCreative()

  return (
    <>
      <Section title="Brand Lock" desc="Lock colors, fonts & logo for team consistency">
        <button
          type="button"
          onClick={() => update('brandLock', !data.brandLock)}
          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition ${
            data.brandLock
              ? 'border-amber-300 bg-amber-50 text-amber-900'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {data.brandLock ? <Lock className="h-4 w-4 text-amber-600" /> : <Unlock className="h-4 w-4 text-slate-400" />}
            <div className="text-left">
              <p className="text-[12px] font-bold">{data.brandLock ? 'Brand Locked' : 'Brand Unlocked'}</p>
              <p className="text-[10px] opacity-80">
                {data.brandLock ? 'Colors, fonts & logo cannot be changed' : 'Tap to lock brand kit fields'}
              </p>
            </div>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${data.brandLock ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
            {data.brandLock ? 'ON' : 'OFF'}
          </span>
        </button>
      </Section>

      <Section title="Color Palette" desc="Brand colors applied across template">
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PALETTES.map((pal) => (
            <button
              key={pal.name}
              type="button"
              onClick={() => {
                if (data.brandLock) return
                update('accentColor', pal.primary)
                update('secondaryColor', pal.secondary)
              }}
              disabled={data.brandLock}
              className={`group rounded-xl border p-2 transition ${
                data.brandLock ? 'cursor-not-allowed opacity-50' : ''
              } ${
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
              <input type="color" value={data.accentColor} onChange={(e) => update('accentColor', e.target.value)} disabled={data.brandLock} className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent disabled:opacity-50" />
              <input type="text" value={data.accentColor} onChange={(e) => update('accentColor', e.target.value)} disabled={data.brandLock} className={`${inputClass} disabled:opacity-50`} />
            </div>
          </Field>
          <Field label="Secondary Color">
            <div className="flex items-center gap-2">
              <input type="color" value={data.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} disabled={data.brandLock} className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent disabled:opacity-50" />
              <input type="text" value={data.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} disabled={data.brandLock} className={`${inputClass} disabled:opacity-50`} />
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
              onClick={() => !data.brandLock && update('fontFamily', font.id as FontFamily)}
              disabled={data.brandLock}
              className={`rounded-xl border p-3 text-left transition ${
                data.brandLock ? 'cursor-not-allowed opacity-50' : ''
              } ${
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

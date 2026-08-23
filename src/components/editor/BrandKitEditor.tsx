import { Lock, Unlock, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useCreative } from '../../store/CreativeContext'
import { COLOR_PALETTES, FONT_OPTIONS } from '../../data/config'
import type { FontFamily } from '../../types/creative'
import LogoEditor from './LogoEditor'
import CompanyDnaSection from './CompanyDnaSection'
import { Field, Section, inputClass } from './FormUI'
import { loadStoredCustomFont, processFontFile, saveStoredCustomFont } from '../../utils/customFont'
import { useToast } from '../ux/ToastProvider'

export default function BrandKitEditor() {
  const { data, update } = useCreative()
  const { toast } = useToast()
  const fontInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const storedFont = loadStoredCustomFont()

  const handleFontUpload = async (file: File) => {
    if (data.brandLock) return
    setUploading(true)
    try {
      const record = await processFontFile(file)
      saveStoredCustomFont(record)
      update('fontFamily', 'Custom')
      update('customFontName', record.name)
      toast(`Custom font "${record.name}" applied`, 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Font upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const clearCustomFont = () => {
    saveStoredCustomFont(null)
    update('customFontName', '')
    if (data.fontFamily === 'Custom') update('fontFamily', 'Poppins')
    toast('Custom font removed', 'info')
  }

  return (
    <>
      <CompanyDnaSection />
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
        <input
          ref={fontInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFontUpload(f)
            e.target.value = ''
          }}
        />
        <div className="mb-3 rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-3">
          <p className="text-[10px] font-bold text-violet-800">Custom brand font</p>
          <p className="mt-0.5 text-[9px] text-violet-700/80">TTF, OTF, WOFF, WOFF2 — stored locally in your browser</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={data.brandLock || uploading}
              onClick={() => fontInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-[10px] font-bold text-white disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? 'Uploading…' : 'Upload Font'}
            </button>
            {storedFont && (
              <button
                type="button"
                disabled={data.brandLock}
                onClick={clearCustomFont}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            )}
          </div>
          {storedFont && (
            <p className="mt-2 text-[10px] font-medium text-slate-700" style={{ fontFamily: `"${storedFont.name}", sans-serif` }}>
              Active: {storedFont.name}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => {
                if (data.brandLock) return
                update('fontFamily', font.id as FontFamily)
                if (font.id !== 'Custom') update('customFontName', '')
              }}
              disabled={data.brandLock || (font.id === 'Custom' && !storedFont)}
              className={`rounded-xl border p-3 text-left transition ${
                data.brandLock || (font.id === 'Custom' && !storedFont) ? 'cursor-not-allowed opacity-50' : ''
              } ${
                data.fontFamily === font.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <p
                className="text-sm font-semibold text-slate-900"
                style={{ fontFamily: font.id === 'Custom' && storedFont ? `"${storedFont.name}", sans-serif` : font.id }}
              >
                {font.id === 'Custom' && data.customFontName ? data.customFontName : font.label}
              </p>
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

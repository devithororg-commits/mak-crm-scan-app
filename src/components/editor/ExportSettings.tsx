import { useCreative } from '../../store/CreativeContext'
import { PLATFORMS, ASPECT_RATIOS } from '../../data/config'
import type { AspectRatio, Platform } from '../../types/creative'
import { AppIcon, PLATFORM_COLORS } from '../icons'
import FooterEditor from './FooterEditor'
import { Field, Section, inputClass } from './FormUI'

export default function ExportSettings() {
  const { data, update } = useCreative()

  return (
    <>
      <Section title="Social Platform" desc="Auto-selects optimal size">
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
                data.platform === p.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ${PLATFORM_COLORS[p.icon] ?? 'text-slate-600'}`}>
                <AppIcon name={p.icon} size={18} />
              </span>
              <p className="mt-1 text-[10px] font-medium text-slate-900">{p.label}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Export Size">
        <div className="grid grid-cols-2 gap-2">
          {ASPECT_RATIOS.map((ar) => (
            <button
              key={ar.id}
              type="button"
              onClick={() => update('aspectRatio', ar.id as AspectRatio)}
              className={`rounded-xl border px-3 py-3 text-left transition ${
                data.aspectRatio === ar.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <p className="text-xs font-semibold text-slate-900">{ar.label}</p>
              <p className="text-[10px] text-slate-500">{ar.w}×{ar.h} · {ar.platform}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Export Quality">
        <div className="flex flex-wrap gap-2">
          {([2, 3, 4, 5, 6] as const).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => update('exportQuality', q)}
              className={`rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
                data.exportQuality === q
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              {q}× {q === 3 ? '(Rec)' : q === 6 ? '(4K)' : q === 4 ? '(Ultra)' : ''}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[9px] text-slate-500">6× = 6480px for 1:1 square · Best with Ultra upload quality</p>
      </Section>

      <Section title="QR Code Overlay" desc="Adds scannable QR to exported image">
        <label className="mb-3 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={data.showQrCode}
            onChange={(e) => update('showQrCode', e.target.checked)}
            className="rounded border-slate-300 bg-slate-50 text-indigo-600"
          />
          <span className="text-xs text-slate-700">Include QR code on export</span>
        </label>
        {data.showQrCode && (
          <Field label="QR Link URL">
            <input
              type="url"
              value={data.qrCodeUrl || data.website}
              onChange={(e) => update('qrCodeUrl', e.target.value)}
              placeholder="https://www.yoursite.com/listing"
              className={inputClass}
            />
          </Field>
        )}
      </Section>

      <FooterEditor />
    </>
  )
}

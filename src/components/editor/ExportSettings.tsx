import { useCreative } from '../../store/CreativeContext'
import CanvasSettings from './CanvasSettings'
import FooterEditor from './FooterEditor'
import { Field, Section, inputClass } from './FormUI'

export default function ExportSettings() {
  const { data, update } = useCreative()

  return (
    <>
      <CanvasSettings />

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
              value={data.qrCodeUrl}
              onChange={(e) => update('qrCodeUrl', e.target.value)}
              placeholder={data.website || 'https://www.yoursite.com/listing'}
              className={inputClass}
            />
          </Field>
        )}
      </Section>

      <FooterEditor />
    </>
  )
}

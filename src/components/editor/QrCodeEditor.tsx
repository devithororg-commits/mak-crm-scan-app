import { QrCode, Link2 } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { Field, inputClass } from './FormUI'

const QUICK_LINKS = [
  { label: 'Website', field: 'website' as const },
  { label: 'Listing URL', field: 'listingUrl' as const },
  { label: 'Social Handle', field: 'socialHandle' as const },
]

export default function QrCodeEditor({ bare = false }: { bare?: boolean }) {
  const { data, update } = useCreative()

  const inner = (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3">
        <input
          type="checkbox"
          checked={data.showQrCode}
          onChange={(e) => update('showQrCode', e.target.checked)}
          className="rounded accent-indigo-500"
        />
        <QrCode className="h-4 w-4 text-indigo-500" />
        <div>
          <p className="text-[12px] font-semibold text-slate-900">Show QR on export</p>
          <p className="text-[10px] text-slate-500">Adds scannable code to bottom corner</p>
        </div>
      </label>

      {data.showQrCode && (
        <>
          <Field label="QR Link URL">
            <input
              type="url"
              value={data.qrCodeUrl}
              onChange={(e) => update('qrCodeUrl', e.target.value)}
              placeholder={data.website || data.listingUrl || 'https://yoursite.com'}
              className={inputClass}
            />
          </Field>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <Link2 className="h-3 w-3" /> Quick Fill
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_LINKS.map(({ label, field }) => {
                const val = data[field]
                if (!val) return null
                const url = field === 'socialHandle' ? `https://instagram.com/${val.replace('@', '')}` : val.startsWith('http') ? val : `https://${val}`
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => update('qrCodeUrl', url)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    Use {label}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="text-[10px] text-slate-400">
            Tip: Use listing URL for property posts, website for brand posts
          </p>
        </>
      )}
    </div>
  )

  if (bare) return inner

  return inner
}

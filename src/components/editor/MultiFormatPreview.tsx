import { useCreative } from '../../store/CreativeContext'
import { ASPECT_RATIOS } from '../../data/config'
import type { AspectRatio } from '../../types/creative'
import { fontFamilyCss } from '../../utils/exportImage'
import TemplateRenderer from '../templates/TemplateRenderer'

export default function MultiFormatPreview() {
  const { data, update } = useCreative()

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold text-slate-900">All Formats Preview</p>
          <p className="text-[10px] text-slate-500">
            {data.formatSyncEnabled
              ? 'Auto-sync ON — typography & layout adapt per size'
              : 'Auto-sync OFF — same layout on all sizes'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => update('formatSyncEnabled', !data.formatSyncEnabled)}
          className={`shrink-0 rounded-lg px-2.5 py-1 text-[9px] font-bold transition ${
            data.formatSyncEnabled
              ? 'bg-violet-600 text-white'
              : 'border border-slate-200 bg-white text-slate-600'
          }`}
        >
          {data.formatSyncEnabled ? 'SYNC ON' : 'SYNC OFF'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ASPECT_RATIOS.map((ar) => {
          const thumbW = ar.id === '16:9' ? 120 : 72
          const scale = thumbW / ar.w
          const active = data.aspectRatio === ar.id
          return (
            <button
              key={ar.id}
              type="button"
              onClick={() => update('aspectRatio', ar.id as AspectRatio)}
              className={`rounded-xl border p-2 text-left transition ${
                active
                  ? 'border-violet-400 bg-violet-50 ring-1 ring-violet-200'
                  : 'border-slate-200 bg-white hover:border-violet-200'
              }`}
            >
              <div
                className="mx-auto overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-100"
                style={{ width: thumbW, height: ar.h * scale }}
              >
                <div
                  style={{
                    width: ar.w,
                    height: ar.h,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    fontFamily: fontFamilyCss(data.fontFamily),
                  }}
                >
                  <TemplateRenderer data={{ ...data, aspectRatio: ar.id }} />
                </div>
              </div>
              <p className={`mt-1.5 text-center text-[9px] font-bold ${active ? 'text-violet-700' : 'text-slate-600'}`}>
                {ar.id} · {ar.platform}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

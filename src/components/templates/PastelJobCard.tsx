import { ArrowRight, Bookmark } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import CreativeFooter from './CreativeFooter'
import CreativeLogo from './CreativeLogo'

const PASTELS = ['bg-purple-100', 'bg-amber-50', 'bg-emerald-50', 'bg-sky-50', 'bg-rose-50', 'bg-violet-50']

export default function PastelJobCard({ data }: { data: CreativeData }) {
  const bg = PASTELS[data.title.length % PASTELS.length]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-lg">
      <div className={`relative flex flex-1 flex-col justify-between p-8 ${bg}`}>
        <div className="flex items-start justify-between">
          <span className="text-sm font-semibold">{data.metric1Value || data.subtitle}</span>
          <Bookmark className="h-5 w-5 text-slate-400" />
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-tight">{data.title}</h2>
          <ArrowRight className="mt-4 h-5 w-5" />
        </div>

        <div className="flex justify-center gap-1.5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`h-1.5 w-1.5 rounded-full ${n === 1 ? 'bg-slate-800' : 'bg-slate-300'}`} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <CreativeLogo
            data={data}
            placement="badge"
            fallback={
              <div
                className="flex items-center justify-center bg-slate-900 font-bold text-white"
                style={{
                  width: data.badgeLogoSize,
                  height: data.badgeLogoSize,
                  borderRadius: data.badgeLogoRadius >= 999 ? '50%' : data.badgeLogoRadius,
                  fontSize: data.badgeLogoSize * 0.35,
                }}
              >
                {(data.companyName || data.eyebrow || 'B')[0]}
              </div>
            }
          />
          <span className="text-sm font-medium">{data.companyName || data.eyebrow}</span>
        </div>
        <button type="button" className="rounded-full bg-slate-900 px-5 py-2 text-xs font-medium text-white">
          View
        </button>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

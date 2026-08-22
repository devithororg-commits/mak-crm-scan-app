import { Bookmark } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import CreativeFooter from './CreativeFooter'
import CreativeLogo from './CreativeLogo'

export default function JobCard({ data }: { data: CreativeData }) {
  const tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-xl">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-start justify-between">
          <CreativeLogo
            data={data}
            placement="badge"
            fallback={
              <div
                className="flex items-center justify-center bg-slate-100 font-bold"
                style={{
                  width: data.badgeLogoSize,
                  height: data.badgeLogoSize,
                  borderRadius: data.badgeLogoRadius >= 999 ? '50%' : data.badgeLogoRadius,
                  fontSize: data.badgeLogoSize * 0.4,
                }}
              >
                {(data.companyName || data.eyebrow || 'C')[0]}
              </div>
            }
          />
          <button type="button" className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs">
            <Bookmark className="h-3.5 w-3.5" /> Save
          </button>
        </div>

        <p className="text-sm text-slate-500">
          {data.companyName || data.eyebrow} · {data.badge || 'New'}
        </p>
        <h2 className="mt-1 text-2xl font-bold">{data.title}</h2>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-6 text-sm leading-relaxed text-slate-500">{data.description}</p>

        <div className="mt-8 flex items-end justify-between border-t border-slate-100 pt-6">
          <div>
            <p className="text-xl font-bold">{data.metric1Value}</p>
            <p className="text-sm text-slate-400">{data.location || data.metric1Label}</p>
          </div>
          <button type="button" className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white">
            Learn More
          </button>
        </div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

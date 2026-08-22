import { Calendar, Flag } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import CreativeFooter from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function KanbanCard({ data }: { data: CreativeData }) {
  const tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-lg">
      <div className="flex-1 p-8">
        <div className="mb-5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-500">
            <Flag className="h-3 w-3" /> High
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="h-3 w-3" /> <HighlightText text={data.badge || 'Today'} data={data} />
          </span>
        </div>

        <h2 className="text-xl font-bold"><HighlightText text={data.title} data={data} /></h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500"><HighlightText text={data.description} data={data} /></p>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500">
                # {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-dashed border-slate-200 pt-5">
          <div className="flex items-center gap-2">
            <CreativeLogo
              data={data}
              placement="badge"
              fallback={
                <div
                  className="flex items-center justify-center bg-indigo-100 font-bold text-indigo-600"
                  style={{
                    width: data.badgeLogoSize,
                    height: data.badgeLogoSize,
                    borderRadius: data.badgeLogoRadius >= 999 ? '50%' : data.badgeLogoRadius,
                    fontSize: data.badgeLogoSize * 0.35,
                  }}
                >
                  {(data.personName || 'A')[0]}
                </div>
              }
            />
            <span className="text-sm font-medium">{data.personName || 'Assignee'}</span>
          </div>
          <span className="text-sm text-slate-400">{data.progressPercent}%</span>
        </div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

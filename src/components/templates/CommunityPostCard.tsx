import { Bookmark, FileText } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import CreativeFooter from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function CommunityPostCard({ data }: { data: CreativeData }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 to-amber-50 text-slate-900">
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <CreativeLogo
              data={data}
              placement="badge"
              fallback={
                <div
                  className="flex items-center justify-center bg-orange-200 font-bold"
                  style={{
                    width: data.badgeLogoSize,
                    height: data.badgeLogoSize,
                    borderRadius: data.badgeLogoRadius >= 999 ? '50%' : data.badgeLogoRadius,
                    fontSize: data.badgeLogoSize * 0.35,
                  }}
                >
                  {(data.personName || data.eyebrow || 'S')[0]}
                </div>
              }
            />
            <div>
              <p className="text-xs text-slate-400"><HighlightText text={data.eyebrow || 'Community'} data={data} /></p>
              <p className="font-semibold"><HighlightText text={data.title} data={data} /></p>
            </div>
          </div>
          <button type="button" className="rounded-full bg-orange-100 p-2">
            <Bookmark className="h-4 w-4 text-orange-500" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-slate-600"><HighlightText text={data.description} data={data} /></p>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <FileText className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium"><HighlightText text={data.subtitle || 'Document.pdf'} data={data} /></p>
            <p className="text-xs text-slate-400">{data.metric1Value || '3.2 MB'}</p>
          </div>
        </div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

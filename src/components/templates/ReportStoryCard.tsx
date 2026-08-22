import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'
import HighlightsList from './HighlightsList'
import HighlightText from './HighlightText'

export default function ReportStoryCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)

  const header = (
    <div className="flex shrink-0 items-center justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <CreativeLogo
          data={data}
          placement="header"
          fallback={
            <div
              className="flex h-full w-full items-center justify-center text-xs font-bold text-white"
              style={{ background: data.accentColor }}
            >
              ✦
            </div>
          }
        />
        <span className="truncate font-semibold" style={t.subtitle}><HighlightText text={data.eyebrow || data.companyName} data={data} /></span>
      </div>
      {data.badge && (
        <span
          className="shrink-0 rounded-full border px-3 py-1 font-medium"
          style={{ ...t.label, borderColor: data.accentColor, color: data.accentColor }}
        >
          <HighlightText text={data.badge} data={data} />
        </span>
      )}
    </div>
  )

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-stone-50 text-slate-900">
      <Watermark data={data} />
      <div className="flex min-h-0 flex-1 flex-col justify-between p-10">
        <TemplateLayout data={data} header={header}>
          <div className="my-6 min-h-0 flex-1">
            <h2 className="font-bold leading-tight tracking-tight" style={t.title}><HighlightText text={data.title} data={data} /></h2>
            {data.subtitle && <p className="mt-3 text-slate-500" style={t.subtitle}><HighlightText text={data.subtitle} data={data} /></p>}
            <p className="mt-4 leading-relaxed text-slate-500" style={t.body}><HighlightText text={data.description} data={data} /></p>
            <div className="mt-6">
              <HighlightsList data={data} />
            </div>
            {(data.authorName || data.publishedDate) && (
              <p className="mt-6 text-slate-400" style={t.label}>
                {data.authorName}{data.authorName && data.publishedDate ? ' · ' : ''}{data.publishedDate}
              </p>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: n === 1 ? data.accentColor : '#d6d3d1' }}
              />
            ))}
          </div>
        </TemplateLayout>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

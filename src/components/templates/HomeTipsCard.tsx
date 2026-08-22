import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'
import HighlightsList from './HighlightsList'

export default function HomeTipsCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-slate-900">
      <Watermark data={data} />

      <div className="relative flex min-h-0 flex-1 flex-col p-10">
        <CreativeLogo data={data} placement="header" />

        {data.eyebrow && (
          <p className="mb-2 font-semibold uppercase tracking-widest text-orange-600" style={t.label}>
            <HighlightText text={data.eyebrow} data={data} />
          </p>
        )}

        <h2 className="font-bold leading-tight" style={t.title}>
          <HighlightText text={data.title || '5 Tips Before You Buy'} data={data} />
        </h2>
        <p className="mt-2 text-slate-600" style={t.subtitle}>
          <HighlightText text={data.subtitle || 'Essential checklist for smart home buyers'} data={data} />
        </p>

        {data.description && (
          <p className="mt-4 text-slate-500" style={t.body}>
            <HighlightText text={data.description} data={data} />
          </p>
        )}

        <div className="mt-6 min-h-0 flex-1 rounded-2xl border border-orange-200/60 bg-white/80 p-5 backdrop-blur-sm">
          <HighlightsList data={data} />
        </div>

        {data.ctaText && (
          <span className="mt-6 inline-block self-start rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/25" style={t.subtitle}>
            <HighlightText text={data.ctaText} data={data} />
          </span>
        )}
      </div>

      <CreativeFooter data={data} />
    </div>
  )
}

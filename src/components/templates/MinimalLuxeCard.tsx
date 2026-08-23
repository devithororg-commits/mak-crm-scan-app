import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { Headline, SectionLabel } from './templateShared'

export default function MinimalLuxeCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />
      <div className="flex min-h-0 flex-1 flex-col justify-between p-10">
        <p className="font-medium uppercase tracking-[0.5em] text-slate-300" style={t.label}>{data.companyName || data.eyebrow || 'BRAND'}</p>
        <div>
          <Headline data={data} t={t} scale={1.5} className="font-light tracking-tight" />
          <div className="mt-6 h-px w-12 bg-slate-900" />
          <p className="mt-6 max-w-xs leading-relaxed text-slate-500" style={t.body}>
            <HighlightText text={data.description || 'Less noise. More meaning. Luxury in whitespace.'} data={data} />
          </p>
        </div>
        <div className="flex items-end justify-between">
          {data.ctaText ? (
            <span className="border-b border-slate-900 pb-1 font-medium uppercase tracking-widest" style={t.label}>
              <HighlightText text={data.ctaText} data={data} />
            </span>
          ) : <span />}
          <SectionLabel data={data} t={t} text={data.badge || data.publishedDate || '2026'} />
        </div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

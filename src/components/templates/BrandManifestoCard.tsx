import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { Headline, SectionLabel } from './templateShared'

export default function BrandManifestoCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const lines = data.highlights.filter(Boolean).length >= 3
    ? data.highlights.filter(Boolean).slice(0, 4)
    : ['We believe in **craft** over clutter.', 'We design for **humans**, not algorithms.', 'We build **trust** before transactions.', 'We create work that **lasts**.']

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#fafafa] text-slate-900">
      <Watermark data={data} />
      <div className="flex min-h-0 flex-1 flex-col p-8">
        <SectionLabel data={data} t={t} text={data.companyName || data.eyebrow || 'OUR MANIFESTO'} />
        <Headline data={data} t={t} scale={1.1} className="mt-2" />
        <div className="mt-8 space-y-5">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="font-extrabold" style={{ ...t.metric, color: data.accentColor }}>{String(i + 1).padStart(2, '0')}</span>
              <p className="leading-relaxed" style={t.body}><HighlightText text={line} data={data} /></p>
            </div>
          ))}
        </div>
        {data.ctaText && (
          <p className="mt-auto pt-8 font-semibold uppercase tracking-[0.25em]" style={{ ...t.label, color: data.accentColor }}>
            <HighlightText text={data.ctaText} data={data} />
          </p>
        )}
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

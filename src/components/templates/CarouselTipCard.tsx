import { ChevronRight } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

export default function CarouselTipCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const step = data.badge || '02'
  const year = data.publishedDate || '2025'
  const headline = data.title || 'Be **Consistent**'
  const body = data.description || data.subtitle || "Ensure that your branding is consistent across all channels to reinforce your brand's message and make it easier for consumers to recognize and remember."
  const brand = data.eyebrow || data.companyName || 'YOUR.BRAND'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#F9F9FB] text-slate-900">
      <Watermark data={data} />

      {/* Corner gradient waves */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `linear-gradient(135deg, ${hexToRgba('#FDE68A', 0.7)}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl"
        style={{ background: `linear-gradient(315deg, ${hexToRgba(data.accentColor, 0.5)}, ${hexToRgba(data.secondaryColor, 0.3)}, transparent)` }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col p-10">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <span className="rounded-full border border-slate-900 px-4 py-1 text-sm font-semibold">{step}</span>
          <span className="text-sm font-medium text-slate-500" style={t.label}>{year}</span>
        </div>

        {/* Center content */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h2 className="max-w-md font-bold leading-tight tracking-tight" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.3 }}>
            <HighlightText text={headline} data={data} />
          </h2>
          <p className="mt-6 max-w-lg leading-relaxed text-slate-700" style={{ ...t.body, fontSize: (t.body.fontSize as number) * 1.05 }}>
            <HighlightText text={body} data={data} />
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <span className="rounded-full border border-slate-900 px-5 py-1.5 text-xs font-bold uppercase tracking-wider">
            {brand}
          </span>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-900"
            aria-hidden
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

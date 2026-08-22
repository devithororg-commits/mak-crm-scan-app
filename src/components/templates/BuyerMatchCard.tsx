import { ArrowRight, Check } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'

const GOLD = '#d1a550'

export default function BuyerMatchCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const headline = data.title || 'Buying a home'
  const items = data.highlights.filter(Boolean)
  const cta = data.ctaText || 'Get My Buyer Match'
  const secondaryLink = data.comparisonLabel || data.eyebrow || 'How matching works'
  const coverUrl = data.showCreativeImage && data.imageUrl ? data.imageUrl : ''

  const defaultItems = [
    'An agent with real results in your target neighborhoods',
    'Guidance level matched to how you like to decide',
    'No spam, no pressure, and no obligation to proceed',
  ]
  const listItems = items.length > 0 ? items : defaultItems

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
      <Watermark data={data} />

      {/* Header image — top third */}
      <div className="relative h-[34%] min-h-[160px] shrink-0 overflow-hidden bg-gradient-to-br from-emerald-100 via-amber-50 to-sky-100">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,rgba(34,197,94,0.2),transparent_60%),radial-gradient(circle_at_70%_30%,rgba(209,165,80,0.25),transparent_50%)]" />
        )}
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col px-8 py-7">
        <h2
          className="font-bold leading-tight text-slate-900"
          style={{ ...t.title, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {headline}
        </h2>

        <ul className="mt-5 space-y-3.5">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600" style={t.body}>
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} strokeWidth={2.5} />
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-bold text-slate-900"
            style={{ ...t.subtitle, background: GOLD }}
          >
            {cta}
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </div>

          {secondaryLink && (
            <p className="mt-4 inline-flex items-center gap-1.5 font-semibold" style={{ ...t.label, color: GOLD }}>
              {secondaryLink}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </p>
          )}
        </div>
      </div>

      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

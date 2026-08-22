import { Sparkles } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function MinimalPillCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const pill = data.badge || 'FOUR'
  const headline = data.title || 'Attraction & **Companionship**'
  const body = data.description || data.subtitle || 'Beauty, wellness, fitness, fragrances. Products that help people feel attractive, confident & connected.'
  const site = data.website || data.footerWebsite || 'yourbrand.com'
  const brand = data.companyName || 'Your Brand'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-slate-50 text-slate-900">
      <Watermark data={data} />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl"
        style={{ background: `linear-gradient(135deg, ${hexToRgba(data.accentColor, 0.35)}, ${hexToRgba(data.secondaryColor, 0.3)})` }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col justify-between p-10">
        <div>
          <Sparkles className="mb-3 h-5 w-5" style={{ color: data.accentColor }} strokeWidth={2} />
          <span className="inline-block rounded-full border border-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-wide">
            {pill}
          </span>
          <h2 className="mt-8 max-w-md font-bold leading-tight tracking-tight" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.15 }}>
            <HighlightText text={headline} data={data} />
          </h2>
          <p className="mt-5 max-w-sm leading-relaxed text-slate-600" style={{ ...t.body, fontSize: (t.body.fontSize as number) * 1.05 }}>
            <HighlightText text={body} data={data} />
          </p>
        </div>

        <div className="flex items-end justify-between">
          <p className="text-sm text-slate-500" style={t.label}>{site}</p>
          <div className="flex items-center gap-2">
            <CreativeLogo
              data={data}
              placement="badge"
              fallback={
                <div
                  className="flex items-center justify-center rounded-lg font-bold text-white"
                  style={{ width: 28, height: 28, background: data.accentColor, fontSize: 12 }}
                >
                  {brand[0]}
                </div>
              }
            />
            <span className="font-bold text-slate-900" style={t.subtitle}>{brand}</span>
          </div>
        </div>
      </div>
      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

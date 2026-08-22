import { ArrowUpRight, MapPin, TrendingUp } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

export default function MarketUpdateCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const location = data.location || data.state || 'Hyderabad'
  const period = data.badge || 'Q4 2025'
  const growth = data.changePercent || data.metric1Value || '+22%'

  const stats = [
    { label: data.metric1Label || 'Growth', value: data.metric1Value || '+22%', icon: TrendingUp },
    { label: data.metric2Label || 'Avg Price', value: data.metric2Value || '₹5,800/sft', icon: null },
    { label: data.metric3Label || 'New Launches', value: data.metric3Value || '145', icon: null },
    { label: data.metric4Label || 'Demand', value: data.metric4Value || 'High', icon: null },
  ]

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl text-white" style={{ background: `linear-gradient(145deg, ${data.accentColor}, ${data.secondaryColor})` }}>
      <Watermark data={data} />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_50%)]" />

      <div className="relative flex min-h-0 flex-1 flex-col p-10">
        <div className="mb-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 backdrop-blur-sm" style={t.label}>
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm" style={t.label}>{period}</span>
        </div>

        <p className="mb-2 font-medium uppercase tracking-widest text-white/60" style={t.label}>
          <HighlightText text={data.eyebrow || 'Market Intelligence'} data={data} />
        </p>
        <h2 className="mb-3 font-bold leading-tight" style={t.title}>
          <HighlightText text={data.title || `${location} Market Update`} data={data} />
        </h2>
        <p className="mb-6 text-white/75" style={t.subtitle}><HighlightText text={data.subtitle} data={data} /></p>

        <div className="mb-6 inline-flex items-center gap-2 self-start rounded-2xl bg-white/15 px-5 py-3 backdrop-blur-sm">
          <ArrowUpRight className="h-6 w-6 text-emerald-300" />
          <div>
            <p className="text-2xl font-bold" style={t.metric}>{growth}</p>
            <p className="text-white/60" style={t.label}>YoY Growth</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="font-bold" style={t.metric}>{s.value}</p>
              <p className="text-white/60" style={t.label}>{s.label}</p>
            </div>
          ))}
        </div>

        {data.highlights.filter(Boolean).length > 0 && (
          <ul className="mt-6 space-y-2">
            {data.highlights.slice(0, 4).map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-white/80" style={t.body}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/60" />
                {h}
              </li>
            ))}
          </ul>
        )}

        {data.ctaText && (
          <div className="mt-auto pt-8">
            <span className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-slate-900" style={t.subtitle}>
              <HighlightText text={data.ctaText} data={data} />
            </span>
          </div>
        )}
      </div>

      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

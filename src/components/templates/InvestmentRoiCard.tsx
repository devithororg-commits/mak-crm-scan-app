import { TrendingUp, IndianRupee, Percent } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function InvestmentRoiCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const stats = [
    { icon: Percent, label: data.metric1Label || 'Rental Yield', value: data.metric1Value || '4.2%', color: 'text-emerald-400' },
    { icon: TrendingUp, label: data.metric2Label || 'Appreciation', value: data.metric2Value || '+22% YoY', color: 'text-amber-400' },
    { icon: IndianRupee, label: data.metric3Label || '5Y ROI', value: data.metric3Value || '68%', color: 'text-violet-400' },
  ]

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-900 text-white">
      <Watermark data={data} />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative flex min-h-0 flex-1 flex-col p-8">
        <div className="flex items-center justify-between">
          <CreativeLogo
            data={data}
            placement="header"
            fallback={
              <div className="flex items-center justify-center rounded-lg bg-violet-500/30 font-bold" style={{ width: data.headerLogoSize, height: data.headerLogoSize }}>
                {(data.companyName || 'M')[0]}
              </div>
            }
          />
          <span className="rounded-full bg-amber-400/20 px-3 py-1 font-bold text-amber-300" style={t.label}>
            <HighlightText text={data.badge || 'NRI Investment'} data={data} />
          </span>
        </div>

        <p className="mt-6 font-medium uppercase tracking-widest text-violet-300" style={t.label}>
          <HighlightText text={data.eyebrow || 'Investment Opportunity'} data={data} />
        </p>
        <h2 className="mt-1 font-bold leading-tight" style={t.title}>
          <HighlightText text={data.propertyTitle || data.title || 'Hyderabad Real Estate'} data={data} />
        </h2>
        <p className="mt-2 text-white/50" style={t.subtitle}>{data.propertyAddress || data.location}</p>

        <div className="my-8 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
              <s.icon className={`mx-auto h-5 w-5 ${s.color}`} />
              <p className={`mt-2 font-extrabold ${s.color}`} style={t.metric}>{s.value}</p>
              <p className="mt-1 text-white/40" style={t.label}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50" style={t.label}>Property Price</p>
              <p className="font-bold text-white" style={{ ...t.subtitle, fontSize: (t.subtitle.fontSize as number) * 1.2 }}>
                {data.propertyPrice || '₹1.25 Cr'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/50" style={t.label}>Expected Returns</p>
              <p className="font-bold text-emerald-400" style={t.metric}>{data.changePercent || '+68% in 5Y'}</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400" style={{ width: `${data.progressPercent || 68}%` }} />
          </div>
        </div>

        {data.highlights.filter(Boolean).length > 0 && (
          <ul className="mt-5 space-y-2">
            {data.highlights.filter(Boolean).slice(0, 3).map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-white/70" style={t.body}>
                <span className="text-emerald-400">✓</span> {h}
              </li>
            ))}
          </ul>
        )}

        {data.ctaText && (
          <div className="mt-auto pt-6">
            <span className="block rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-center font-semibold shadow-lg shadow-violet-500/30" style={t.subtitle}>
              <HighlightText text={data.ctaText} data={data} />
            </span>
          </div>
        )}
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

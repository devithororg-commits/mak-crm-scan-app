import { IndianRupee, TrendingUp } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function RentalYieldCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const rent = data.metric1Value || '₹45,000'
  const yieldPct = data.metric2Value || '4.3%'
  const occupancy = data.metric3Value || '98%'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />

      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-8 py-5 text-white">
        <div className="flex items-center justify-between">
          <CreativeLogo data={data} placement="header" />
          <span className="rounded-full bg-white/20 px-3 py-1 font-bold backdrop-blur-sm" style={t.label}>
            RENTAL INCOME
          </span>
        </div>
        <h2 className="mt-4 font-bold leading-tight" style={t.title}>
          <HighlightText text={data.propertyTitle || data.title || 'Premium Rental Asset'} data={data} />
        </h2>
        <p className="mt-1 text-cyan-100" style={t.subtitle}>
          <HighlightText text={data.propertyAddress || data.location || 'Downtown, Your City'} data={data} />
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-8">
        <TemplateLayout data={data}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: IndianRupee, label: 'Monthly Rent', value: rent, color: 'text-cyan-600' },
              { icon: TrendingUp, label: 'Annual Yield', value: yieldPct, color: 'text-emerald-600' },
              { icon: null, label: 'Occupancy', value: occupancy, color: 'text-violet-600' },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                {m.icon && <m.icon className={`mx-auto mb-2 h-5 w-5 ${m.color}`} />}
                <p className={`font-bold ${m.color}`} style={t.metric}>{m.value}</p>
                <p className="mt-1 text-slate-400" style={t.label}>{m.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
            <p className="text-white/60" style={t.label}>Property Value</p>
            <p className="font-bold" style={t.title}>
              <HighlightText text={data.propertyPrice || '₹1.25 Cr'} data={data} />
            </p>
            {data.changePercent && (
              <p className="mt-1 text-emerald-400" style={t.subtitle}>
                <HighlightText text={data.changePercent} data={data} />
              </p>
            )}
          </div>

          {data.ctaText && (
            <span className="mt-6 inline-block rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-3 font-semibold text-white" style={t.subtitle}>
              <HighlightText text={data.ctaText} data={data} />
            </span>
          )}
        </TemplateLayout>
      </div>

      <CreativeFooter data={data} />
    </div>
  )
}

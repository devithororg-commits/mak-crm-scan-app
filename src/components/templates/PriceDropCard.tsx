import { TrendingDown } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function PriceDropCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const oldPrice = data.previousValue || '₹1.50 Cr'
  const newPrice = data.propertyPrice || data.metric1Value || '₹1.25 Cr'
  const savings = data.changePercent || '₹25 Lakh OFF'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 px-6 py-3 text-white" style={t.label}>
        <TrendingDown className="h-4 w-4" strokeWidth={2.5} />
        <span className="font-bold uppercase tracking-widest">Price Reduced</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col pt-12">
        <TemplateLayout
          data={data}
          header={
            <div className="flex shrink-0 items-center justify-between px-8 pt-4">
              <CreativeLogo
                data={data}
                placement="header"
                fallback={
                  <div
                    className="flex items-center justify-center rounded-lg bg-rose-600 font-bold text-white"
                    style={{ width: data.headerLogoSize, height: data.headerLogoSize }}
                  >
                    {(data.companyName || 'M')[0]}
                  </div>
                }
              />
              <span className="rounded-full bg-rose-100 px-3 py-1 font-bold text-rose-700" style={t.label}>
                {savings}
              </span>
            </div>
          }
        >
          <div className="flex min-h-0 flex-1 flex-col px-8 pb-4">
            <h2 className="font-bold leading-tight" style={t.title}>
              <HighlightText text={data.propertyTitle || data.title} data={data} />
            </h2>
            <p className="mt-2 text-slate-500" style={t.subtitle}>{data.propertyAddress}</p>

            <div className="mt-6 rounded-2xl border-2 border-dashed border-rose-200 bg-gradient-to-br from-rose-50 to-red-50 p-6 text-center">
              <p className="text-slate-400 line-through" style={{ ...t.subtitle, fontSize: (t.subtitle.fontSize as number) * 1.1 }}>
                {oldPrice}
              </p>
              <p className="mt-1 font-extrabold text-rose-600" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.15 }}>
                {newPrice}
              </p>
              <p className="mt-2 font-semibold text-emerald-600" style={t.label}>
                {data.comparisonLabel || 'Limited time offer'}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: 'Beds', value: data.propertyBeds },
                { label: 'Baths', value: data.propertyBaths },
                { label: 'Sqft', value: data.propertySqft },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-slate-50 p-2.5 text-center">
                  <p className="font-bold text-slate-800" style={t.metric}>{m.value}</p>
                  <p className="text-slate-400" style={t.label}>{m.label}</p>
                </div>
              ))}
            </div>

            {data.ctaText && (
              <div className="mt-6">
                <span className="inline-block rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-3 font-semibold text-white shadow-lg shadow-rose-500/25" style={t.subtitle}>
                  <HighlightText text={data.ctaText} data={data} />
                </span>
              </div>
            )}
          </div>
        </TemplateLayout>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

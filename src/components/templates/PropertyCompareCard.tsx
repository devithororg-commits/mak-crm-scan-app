import { Scale } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

export default function PropertyCompareCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const nameA = data.propertyTitle || data.title || 'Option A — 2BHK'
  const nameB = data.subtitle || 'Option B — 3BHK'
  const priceA = data.propertyPrice || '₹85 Lakh'
  const priceB = data.previousValue || '₹1.10 Cr'
  const areaA = data.propertySqft || '1,200 sqft'
  const areaB = data.metric1Value || '1,650 sqft'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-slate-50 text-slate-900">
      <Watermark data={data} />

      <div className="bg-slate-900 px-8 py-5 text-white">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-indigo-400" />
          <span className="font-bold uppercase tracking-widest text-indigo-300" style={t.label}>
            <HighlightText text={data.eyebrow || 'Property Comparison'} data={data} />
          </span>
        </div>
        <h2 className="mt-2 font-bold" style={t.title}>
          <HighlightText text={data.badge || 'Which is right for you?'} data={data} />
        </h2>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-0">
        <div className="flex flex-col border-r border-slate-200 bg-white p-6">
          <span className="mb-3 w-fit rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-bold uppercase text-indigo-700">Option A</span>
          <h3 className="font-bold leading-tight" style={t.subtitle}>
            <HighlightText text={nameA} data={data} />
          </h3>
          <p className="mt-4 font-extrabold text-indigo-600" style={t.metric}>{priceA}</p>
          <p className="mt-2 text-slate-500" style={t.body}>{areaA}</p>
          <div className="mt-4 space-y-2">
            <p className="text-slate-600" style={t.label}>{data.propertyBeds} Beds · {data.propertyBaths} Baths</p>
          </div>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-violet-50 to-indigo-50 p-6">
          <span className="mb-3 w-fit rounded-full bg-violet-200 px-3 py-1 text-[10px] font-bold uppercase text-violet-800">Option B</span>
          <h3 className="font-bold leading-tight" style={t.subtitle}>
            <HighlightText text={nameB} data={data} />
          </h3>
          <p className="mt-4 font-extrabold text-violet-600" style={t.metric}>{priceB}</p>
          <p className="mt-2 text-slate-500" style={t.body}>{areaB}</p>
        </div>
      </div>

      {data.comparisonLabel && (
        <div className="border-t border-slate-200 bg-emerald-50 px-8 py-4 text-center">
          <p className="font-bold text-emerald-700" style={t.subtitle}>
            <HighlightText text={data.comparisonLabel} data={data} />
          </p>
        </div>
      )}

      {data.ctaText && (
        <div className="px-8 py-4">
          <span className="block rounded-xl bg-slate-900 py-3 text-center font-semibold text-white" style={t.subtitle}>
            <HighlightText text={data.ctaText} data={data} />
          </span>
        </div>
      )}

      <CreativeFooter data={data} />
    </div>
  )
}

import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function JustSoldCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 text-white">
      <Watermark data={data} />
      <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
        <CreativeLogo data={data} placement="header" fallback={
          <div className="mb-6 flex items-center justify-center rounded-full bg-amber-500 font-bold" style={{ width: 56, height: 56, fontSize: 24 }}>
            {(data.companyName || 'M')[0]}
          </div>
        } />
        <p className="mb-2 font-semibold uppercase tracking-[0.3em] text-amber-400" style={t.label}>Just Sold</p>
        <h2 className="mb-3 font-bold leading-tight" style={t.title}><HighlightText text={data.propertyTitle || data.title} data={data} /></h2>
        <p className="text-white/70" style={t.subtitle}>{data.propertyAddress}</p>
        <div className="my-8 h-px w-24 bg-amber-400" />
        <p className="text-3xl font-bold text-amber-400" style={t.metric}>{data.propertyPrice}</p>
        <p className="mt-2 text-white/50" style={t.label}>
          {data.propertyBeds} BHK · {data.propertySqft} sqft · {data.propertyType}
        </p>
        {data.companyName && (
          <p className="mt-8 text-white/60" style={t.body}>Sold by {data.companyName}</p>
        )}
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

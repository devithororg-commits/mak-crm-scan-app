import { Building2 } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'
import { CtaButton, Headline, HighlightsList, SectionLabel } from './templateShared'

export default function CommercialHubCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />
      <div className="flex items-center justify-between px-6 py-4" style={{ background: data.accentColor }}>
        <CreativeLogo data={data} placement="header" fallback={<Building2 className="h-6 w-6 text-white" />} />
        <span className="rounded bg-white/20 px-3 py-1 font-bold text-white" style={t.label}>{data.badge || 'Commercial'}</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <SectionLabel data={data} t={t} text={data.eyebrow || 'Office & Retail'} />
        <Headline data={data} t={t} />
        <p className="mt-2 text-slate-600" style={t.body}><HighlightText text={data.description || data.propertyAddress || 'Prime business district · High footfall · Ready to move'} data={data} /></p>
        <div className="my-4 grid grid-cols-2 gap-3">
          {[
            { label: 'Area', value: data.propertySqft ? `${data.propertySqft} sqft` : '5,000 sqft' },
            { label: 'Lease', value: data.propertyPrice || '₹85/sqft' },
            { label: 'Type', value: data.propertyType || 'Grade A' },
            { label: 'Yield', value: data.metric1Value || '8.2%' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-slate-200 p-3">
              <p className="text-slate-400" style={t.label}>{m.label}</p>
              <p className="font-bold" style={{ ...t.metric, color: data.accentColor }}>{m.value}</p>
            </div>
          ))}
        </div>
        <HighlightsList data={data} t={t} icon="✓" />
        <div className="mt-auto pt-4"><CtaButton data={data} t={t} style={{ background: data.accentColor, color: '#fff' }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

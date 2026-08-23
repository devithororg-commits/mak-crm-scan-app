import { Percent } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, Headline, MetricGrid, SectionLabel } from './templateShared'

export default function HomeLoanProCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white">
      <Watermark data={data} />
      <div className="absolute -right-10 top-10 h-40 w-40 rounded-full opacity-30 blur-3xl" style={{ background: data.accentColor }} />
      <div className="relative flex min-h-0 flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2" style={{ background: hexToRgba(data.accentColor, 0.2) }}><Percent className="h-6 w-6" style={{ color: data.accentColor }} /></div>
          <SectionLabel data={data} t={t} text={data.eyebrow || 'Home Loan Offer'} />
        </div>
        <Headline data={data} t={t} scale={1.15} className="mt-3" />
        <p className="mt-2 text-indigo-200/70" style={t.body}><HighlightText text={data.description || 'Special rates for first-time buyers. Pre-approved in 24 hours.'} data={data} /></p>
        <div className="my-5 rounded-2xl border border-indigo-400/20 p-4 text-center" style={{ background: hexToRgba('#fff', 0.05) }}>
          <p className="text-indigo-300/60" style={t.label}>Starting EMI from</p>
          <p className="font-extrabold text-white" style={{ fontSize: (t.metric.fontSize as number) * 1.8 }}>{data.metric1Value || '₹42,500/mo'}</p>
          <p className="mt-1 text-indigo-300/50" style={t.label}>@ {data.metric2Value || '8.35%'} interest · {data.metric3Value || '20 yr'} tenure</p>
        </div>
        <MetricGrid data={data} t={t} items={[
          { label: 'Max Loan', value: data.propertyPrice || '₹1.5 Cr' },
          { label: 'Processing', value: data.changePercent || '0.25%' },
          { label: 'Approval', value: data.badge || '24 hrs' },
        ]} />
        <div className="mt-4"><CtaButton data={data} t={t} style={{ background: `linear-gradient(135deg, ${data.accentColor}, ${data.secondaryColor})` }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

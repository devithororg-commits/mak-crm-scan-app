import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, Headline, MetricGrid, SectionLabel } from './templateShared'

export default function InvestorSnapshotCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 to-indigo-950 text-white">
      <Watermark data={data} />
      <div className="relative flex min-h-0 flex-1 flex-col p-6">
        <div className="flex items-center justify-between">
          <SectionLabel data={data} t={t} text={data.companyName || data.eyebrow || 'INVESTOR DECK'} />
          <span className="rounded border border-white/20 px-2 py-0.5" style={t.label}>{data.badge || 'Confidential'}</span>
        </div>
        <Headline data={data} t={t} scale={1.1} className="mt-2" />
        <p className="mt-2 text-indigo-200/60" style={t.body}><HighlightText text={data.description || 'Series A snapshot — traction, unit economics, and growth trajectory.'} data={data} /></p>
        <div className="my-4 rounded-2xl p-4" style={{ background: hexToRgba(data.accentColor, 0.12), border: `1px solid ${hexToRgba(data.accentColor, 0.25)}` }}>
          <p className="text-indigo-300/50" style={t.label}>Raising</p>
          <p className="font-extrabold" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.1, color: data.accentColor }}>{data.propertyPrice || data.metric1Value || '$2M'}</p>
          <p className="mt-1 text-indigo-300/50" style={t.label}>Valuation: {data.metric2Value || '$12M'} · Runway: {data.metric3Value || '18 mo'}</p>
        </div>
        <MetricGrid data={data} t={t} cols={2} items={[
          { label: 'ARR', value: data.changePercent || '$480K' },
          { label: 'MoM', value: data.comparisonLabel || '+22%' },
          { label: 'CAC', value: data.previousValue || '$42' },
          { label: 'LTV', value: data.targetValue || '$840' },
        ]} />
        <div className="mt-4"><CtaButton data={data} t={t} style={{ background: data.accentColor }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

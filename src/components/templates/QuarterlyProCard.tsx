import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, DotGrid, Headline, MetricGrid, SectionLabel } from './templateShared'

export default function QuarterlyProCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-slate-900 text-white">
      <Watermark data={data} />
      <DotGrid />
      <div className="relative flex min-h-0 flex-1 flex-col p-6">
        <div className="flex items-start justify-between">
          <div>
            <SectionLabel data={data} t={t} text={data.eyebrow || 'Quarterly Report'} />
            <Headline data={data} t={t} scale={1.1} />
          </div>
          <span className="rounded-lg px-3 py-1.5 font-bold" style={{ ...t.label, background: hexToRgba(data.accentColor, 0.2), color: data.accentColor }}>{data.badge || 'Q4 2025'}</span>
        </div>
        <p className="mt-3 text-slate-400" style={t.body}><HighlightText text={data.description || 'Revenue up, costs optimized, and market share expanded across key segments.'} data={data} /></p>
        <div className="my-4 rounded-xl border border-white/10 p-4">
          <p className="text-slate-500" style={t.label}>Revenue Growth</p>
          <p className="font-extrabold text-emerald-400" style={{ fontSize: (t.metric.fontSize as number) * 1.6 }}>{data.changePercent || '+34% YoY'}</p>
        </div>
        <MetricGrid data={data} t={t} cols={2} items={[
          { label: data.metric1Label || 'Revenue', value: data.metric1Value || '₹48 Cr' },
          { label: data.metric2Label || 'Profit', value: data.metric2Value || '₹12 Cr' },
          { label: data.metric3Label || 'Clients', value: data.metric3Value || '1,240' },
          { label: data.metric4Label || 'NPS', value: data.metric4Value || '72' },
        ]} />
        <div className="mt-4"><CtaButton data={data} t={t} style={{ background: data.accentColor }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

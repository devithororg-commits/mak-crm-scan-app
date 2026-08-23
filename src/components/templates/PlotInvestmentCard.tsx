import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, DotGrid, Headline, MetricGrid, SectionLabel } from './templateShared'

export default function PlotInvestmentCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-emerald-950 text-white">
      <Watermark data={data} />
      <DotGrid color="#34d399" opacity={0.12} />
      <div className="relative flex min-h-0 flex-1 flex-col p-6">
        <SectionLabel data={data} t={t} text={data.eyebrow || 'Land Investment'} />
        <Headline data={data} t={t} scale={1.2} />
        <p className="mt-2 text-emerald-100/70" style={t.body}><HighlightText text={data.description || 'DTCP approved plot in fast-growing corridor with high appreciation potential.'} data={data} /></p>
        <div className="my-5 rounded-2xl border border-emerald-400/30 p-4" style={{ background: hexToRgba(data.accentColor, 0.15) }}>
          <p className="text-emerald-300/60" style={t.label}>Starting from</p>
          <p className="font-extrabold text-emerald-300" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.1 }}>{data.propertyPrice || '₹45 Lakh'}</p>
          <p className="mt-1 text-emerald-200/60" style={t.body}>{data.propertyAddress || data.location}</p>
        </div>
        <MetricGrid data={data} t={t} items={[
          { label: data.metric1Label || 'Plot Size', value: data.metric1Value || '2400 sqft' },
          { label: data.metric2Label || 'ROI', value: data.metric2Value || '18% p.a.' },
          { label: data.metric3Label || 'Approval', value: data.metric3Value || 'DTCP' },
        ]} />
        <div className="mt-4"><CtaButton data={data} t={t} style={{ background: data.accentColor, color: '#fff' }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

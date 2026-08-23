import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, Headline, MetricGrid, SectionLabel } from './templateShared'

export default function StartupPitchCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />
      <div className="px-6 py-4" style={{ background: `linear-gradient(135deg, ${data.accentColor}, ${data.secondaryColor})` }}>
        <p className="font-bold text-white/80" style={t.label}>{data.companyName || 'STARTUP CO'}</p>
        <p className="font-extrabold text-white" style={t.subtitle}>{data.badge || 'Seed Round · $2M'}</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <SectionLabel data={data} t={t} text={data.eyebrow || 'The Problem'} />
        <Headline data={data} t={t} />
        <p className="mt-2 text-slate-600" style={t.body}><HighlightText text={data.description || 'We solve the biggest bottleneck in real estate marketing with AI-powered creatives.'} data={data} /></p>
        <div className="my-4 rounded-xl p-4" style={{ background: hexToRgba(data.accentColor, 0.08) }}>
          <p className="font-semibold" style={{ ...t.subtitle, color: data.accentColor }}>{data.subtitle || 'Our Solution'}</p>
          <p className="mt-1 text-slate-600" style={t.body}>{data.comparisonLabel || 'One platform. Infinite posters. Zero design skills.'}</p>
        </div>
        <MetricGrid data={data} t={t} cols={2} items={[
          { label: 'TAM', value: data.metric1Value || '$4.2B' },
          { label: 'MRR', value: data.metric2Value || '$48K' },
          { label: 'Growth', value: data.metric3Value || '+340%' },
          { label: 'Team', value: data.metric4Value || '12' },
        ]} />
        <div className="mt-auto pt-4"><CtaButton data={data} t={t} style={{ background: data.accentColor, color: '#fff' }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

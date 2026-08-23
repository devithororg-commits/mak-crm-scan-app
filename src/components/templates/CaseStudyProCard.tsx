import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, Headline, HighlightsList, SectionLabel } from './templateShared'

export default function CaseStudyProCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${data.accentColor}, ${data.secondaryColor})` }} />
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <span className="w-fit rounded bg-slate-100 px-2 py-0.5 font-bold uppercase text-slate-500" style={t.label}>Case Study</span>
        <Headline data={data} t={t} scale={1.05} className="mt-3" />
        <p className="mt-2 text-slate-600" style={t.body}><HighlightText text={data.description || `How ${data.companyName || 'Client Co'} achieved ${data.changePercent || '3x ROI'} in 90 days.`} data={data} /></p>
        <div className="my-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Before', value: data.previousValue || '₹12L', sub: 'Monthly' },
            { label: 'After', value: data.metric1Value || '₹48L', sub: 'Monthly' },
            { label: 'ROI', value: data.metric2Value || '340%', sub: 'Return' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: hexToRgba(data.accentColor, 0.08) }}>
              <p className="text-slate-400" style={t.label}>{m.label}</p>
              <p className="font-bold" style={{ ...t.metric, color: data.accentColor }}>{m.value}</p>
              <p className="text-slate-400" style={{ fontSize: 9 }}>{m.sub}</p>
            </div>
          ))}
        </div>
        <SectionLabel data={data} t={t} text={data.subtitle || 'Key Results'} />
        <HighlightsList data={data} t={t} icon="✓" />
        <div className="mt-auto pt-4"><CtaButton data={data} t={t} style={{ background: data.accentColor, color: '#fff' }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

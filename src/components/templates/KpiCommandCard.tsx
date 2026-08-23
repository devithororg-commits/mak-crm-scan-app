import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { Headline, SectionLabel } from './templateShared'

export default function KpiCommandCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const metrics = [
    { label: data.metric1Label || 'Revenue', value: data.metric1Value || '₹48Cr', trend: data.changePercent || '+12%', color: data.accentColor },
    { label: data.metric2Label || 'Leads', value: data.metric2Value || '2,840', trend: '+28%', color: data.secondaryColor },
    { label: data.metric3Label || 'Conv.', value: data.metric3Value || '18.4%', trend: '+3.2%', color: '#22C55E' },
    { label: data.metric4Label || 'Churn', value: data.metric4Value || '2.1%', trend: '-0.8%', color: '#F59E0B' },
  ]

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#0B0F19] text-white">
      <Watermark data={data} />
      <div className="border-b border-white/10 px-6 py-4">
        <SectionLabel data={data} t={t} text={data.eyebrow || 'Command Center'} />
        <Headline data={data} t={t} scale={0.95} />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-px bg-white/5 p-px">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col justify-between bg-[#0B0F19] p-4">
            <p className="text-slate-500" style={t.label}>{m.label}</p>
            <p className="font-extrabold" style={{ ...t.metric, color: m.color, fontSize: (t.metric.fontSize as number) * 1.2 }}>{m.value}</p>
            <span className="w-fit rounded px-2 py-0.5 font-medium" style={{ ...t.label, background: hexToRgba(m.color, 0.15), color: m.color }}>{m.trend}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-6 py-3 text-center text-slate-500" style={t.label}>{data.ctaText || data.companyName || 'Live Dashboard'}</div>
      <CreativeFooter data={data} />
    </div>
  )
}

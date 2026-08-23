import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, Headline, SectionLabel } from './templateShared'

function CountdownUnit({ value, label, t }: { value: string; label: string; t: ReturnType<typeof getTypography> }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm">
      <span className="font-extrabold leading-none" style={{ ...t.metric, fontSize: (t.metric.fontSize as number) * 1.4 }}>{value}</span>
      <span className="mt-1 uppercase text-white/50" style={t.label}>{label}</span>
    </div>
  )
}

export default function FlashSaleCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const parts = (data.badge || '02:14:59').split(':')
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 text-white">
      <Watermark data={data} />
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
        <SectionLabel data={data} t={t} text={data.eyebrow || '⚡ Flash Sale'} />
        <Headline data={data} t={t} scale={1.35} className="mt-2" />
        <p className="mt-2 text-white/80" style={t.body}><HighlightText text={data.description || `Up to ${data.changePercent || '40% OFF'} on selected properties`} data={data} /></p>
        <div className="my-6 flex gap-2">
          <CountdownUnit value={parts[0] || '02'} label="Hrs" t={t} />
          <CountdownUnit value={parts[1] || '14'} label="Min" t={t} />
          <CountdownUnit value={parts[2] || '59'} label="Sec" t={t} />
        </div>
        <p className="rounded-full bg-black/25 px-4 py-1 font-bold" style={t.label}>{data.comparisonLabel || 'Use code: FLASH40'}</p>
        <div className="mt-5 w-full"><CtaButton data={data} t={t} className="bg-white text-rose-600" /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

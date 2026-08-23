import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, MetricGrid, SectionLabel } from './templateShared'

export default function HolographicProCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const holo = 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)'
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#0a0a12] text-white">
      <Watermark data={data} />
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ background: holo, filter: 'blur(60px)' }} />
      <div className="relative m-4 flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 p-5" style={{ background: hexToRgba('#fff', 0.04) }}>
        <div className="mb-1 h-1 w-full rounded-full" style={{ background: holo }} />
        <SectionLabel data={data} t={t} text={data.eyebrow || 'Holographic Pro'} />
        <h2 className="mt-2 font-bold leading-tight" style={{ ...t.title, background: holo, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          <HighlightText text={data.title || '**Iridescent** Future'} data={data} />
        </h2>
        <p className="mt-2 text-white/60" style={t.body}><HighlightText text={data.description || 'Prismatic gradients for next-gen brand visuals.'} data={data} /></p>
        <MetricGrid data={data} t={t} items={[
          { label: data.metric1Label || 'Impact', value: data.metric1Value || '10x' },
          { label: data.metric2Label || 'Reach', value: data.metric2Value || '5.2M' },
          { label: data.metric3Label || 'Score', value: data.metric3Value || 'A++' },
        ]} />
        <div className="mt-4"><CtaButton data={data} t={t} style={{ background: holo }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

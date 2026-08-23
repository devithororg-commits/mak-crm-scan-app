import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, GlassPanel, Headline, MetricGrid, PhotoBackground, SectionLabel } from './templateShared'

export default function PenthouseSkyCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-slate-950 text-white">
      <Watermark data={data} />
      <div className="relative h-[45%] min-h-[140px]">
        <PhotoBackground data={data} overlay={`linear-gradient(to top, ${hexToRgba('#020617', 1)}, transparent)`} />
        <div className="absolute bottom-4 left-6 right-6">
          <SectionLabel data={data} t={t} text={data.eyebrow || 'Sky Collection'} />
          <Headline data={data} t={t} scale={1.15} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-6">
        <GlassPanel>
          <p className="text-white/70" style={t.body}><HighlightText text={data.description || 'Panoramic city views with floor-to-ceiling glass and private terrace.'} data={data} /></p>
        </GlassPanel>
        <MetricGrid data={data} t={t} items={[
          { label: 'Floor', value: data.metric1Value || '42F' },
          { label: 'Views', value: data.metric2Value || '360°' },
          { label: 'Price', value: data.propertyPrice || '₹8.5 Cr' },
        ]} />
        <CtaButton data={data} t={t} style={{ background: `linear-gradient(135deg, ${data.accentColor}, ${data.secondaryColor})` }} />
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

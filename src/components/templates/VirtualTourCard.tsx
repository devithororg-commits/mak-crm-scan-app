import { Play } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { Headline, PhotoBackground, PropertyStats, SectionLabel } from './templateShared'

export default function VirtualTourCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl text-white">
      <Watermark data={data} />
      <PhotoBackground data={data} overlay={`linear-gradient(135deg, ${hexToRgba('#000', 0.5)}, ${hexToRgba(data.accentColor, 0.4)})`} />
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/80 bg-white/10 backdrop-blur-md">
          <Play className="h-10 w-10 fill-white text-white" />
        </div>
        <SectionLabel data={data} t={t} text={data.eyebrow || '360° Virtual Tour'} />
        <Headline data={data} t={t} scale={1.15} className="mt-2" />
        <p className="mt-3 max-w-sm text-white/75" style={t.body}><HighlightText text={data.description || 'Walk through every room from your phone. Book a live guided tour.'} data={data} /></p>
        <div className="mt-6"><PropertyStats data={data} t={t} /></div>
        {data.ctaText && (
          <span className="mt-6 inline-block rounded-full border-2 border-white px-8 py-3 font-bold uppercase tracking-widest" style={t.label}>
            <HighlightText text={data.ctaText} data={data} />
          </span>
        )}
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

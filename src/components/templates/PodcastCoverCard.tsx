import { Mic } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { Headline, PhotoBackground } from './templateShared'

export default function PodcastCoverCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl text-white">
      <Watermark data={data} />
      <PhotoBackground data={data} overlay={`linear-gradient(135deg, ${hexToRgba(data.accentColor, 0.85)}, ${hexToRgba(data.secondaryColor, 0.9)})`} />
      <div className="relative flex min-h-0 flex-1 flex-col justify-between p-7">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 backdrop-blur-md">
            <Mic className="h-4 w-4" />
            <span style={t.label}>EP {data.badge || '042'}</span>
          </div>
          <p className="font-bold uppercase tracking-widest text-white/60" style={t.label}>{data.companyName || data.eyebrow || 'THE PODCAST'}</p>
          <Headline data={data} t={t} scale={1.2} className="mt-2" />
        </div>
        <div>
          <p className="text-white/75" style={t.body}><HighlightText text={data.description || `Featuring ${data.personName || 'Industry Expert'} — ${data.personRole || 'CEO & Founder'}`} data={data} /></p>
          <p className="mt-3 font-medium text-white/50" style={t.label}>{data.publishedDate || '45 min · New Episode'}</p>
        </div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

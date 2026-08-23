import { Calendar, MapPin } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, Headline, SectionLabel } from './templateShared'

export default function EventPosterCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl text-white" style={{ background: `linear-gradient(160deg, ${data.accentColor}, ${data.secondaryColor})` }}>
      <Watermark data={data} />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
      <div className="relative flex min-h-0 flex-1 flex-col p-7">
        <SectionLabel data={data} t={t} text={data.eyebrow || 'You Are Invited'} />
        <Headline data={data} t={t} scale={1.3} />
        <p className="mt-3 max-w-sm text-white/80" style={t.body}><HighlightText text={data.description || 'Join industry leaders for an exclusive networking evening.'} data={data} /></p>
        <div className="my-6 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            <Calendar className="h-5 w-5 shrink-0" />
            <span style={t.body}>{data.publishedDate || 'Saturday, March 15 · 6:00 PM'}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            <MapPin className="h-5 w-5 shrink-0" />
            <span style={t.body}>{data.location || data.propertyAddress || 'Grand Ballroom, Downtown'}</span>
          </div>
        </div>
        <div className="mt-auto rounded-xl p-4 text-center" style={{ background: hexToRgba('#000', 0.2) }}>
          <p className="text-white/60" style={t.label}>Limited Seats</p>
          <p className="font-extrabold" style={t.metric}>{data.badge || '120 Spots Left'}</p>
        </div>
        <div className="mt-4"><CtaButton data={data} t={t} className="bg-white text-slate-900" /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

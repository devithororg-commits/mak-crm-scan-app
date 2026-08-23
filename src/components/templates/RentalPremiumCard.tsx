import { Key } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, Headline, HighlightsList, PhotoBackground, SectionLabel } from './templateShared'

export default function RentalPremiumCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl text-white">
      <Watermark data={data} />
      <div className="relative h-[50%]">
        <PhotoBackground data={data} overlay={`linear-gradient(to top, ${hexToRgba('#0f172a', 1)}, transparent)`} />
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-md">
          <Key className="h-4 w-4" />
          <span style={t.label}>{data.badge || 'For Rent'}</span>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col bg-slate-900 p-6">
        <SectionLabel data={data} t={t} text={data.eyebrow || 'Premium Rental'} />
        <Headline data={data} t={t} />
        <p className="mt-2 text-slate-400" style={t.body}><HighlightText text={data.propertyAddress || data.description || 'Fully furnished · Premium amenities · Immediate move-in'} data={data} /></p>
        <div className="my-4 flex gap-6">
          <div><p className="text-slate-500" style={t.label}>Monthly</p><p className="font-bold text-teal-400" style={t.metric}>{data.propertyPrice || '₹85,000'}</p></div>
          <div><p className="text-slate-500" style={t.label}>Deposit</p><p className="font-bold" style={t.metric}>{data.metric1Value || '2 months'}</p></div>
          <div><p className="text-slate-500" style={t.label}>BHK</p><p className="font-bold" style={t.metric}>{data.propertyBeds || '3'} BHK</p></div>
        </div>
        <HighlightsList data={data} t={t} />
        <div className="mt-auto"><CtaButton data={data} t={t} style={{ background: data.accentColor }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import { CtaButton, FrameBorder, Headline, HighlightsList, PhotoBackground, PropertyStats, SectionLabel } from './templateShared'

export default function VillaPrestigeCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const gold = data.accentColor
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl text-white">
      <Watermark data={data} />
      <PhotoBackground data={data} overlay={`linear-gradient(180deg, ${hexToRgba('#000', 0.3)} 0%, ${hexToRgba('#000', 0.85)} 100%)`} />
      <FrameBorder color={gold} inset={12} />
      <div className="relative flex min-h-0 flex-1 flex-col justify-between p-8">
        <div className="flex items-start justify-between">
          <CreativeLogo data={data} placement="header" fallback={<span className="font-serif tracking-[0.2em] text-amber-200/80" style={t.label}>{data.companyName || 'PRESTIGE'}</span>} />
          <span className="rounded-sm px-3 py-1 font-serif uppercase tracking-widest" style={{ ...t.label, border: `1px solid ${hexToRgba(gold, 0.5)}`, color: gold }}>{data.badge || 'Villa'}</span>
        </div>
        <div>
          <SectionLabel data={data} t={t} text={data.eyebrow || 'Private Estate'} />
          <Headline data={data} t={t} scale={1.35} className="mt-2 font-serif" />
          <p className="mt-2 text-white/65" style={t.body}>{data.propertyAddress || data.location || 'Exclusive gated community'}</p>
          <div className="mt-5"><PropertyStats data={data} t={t} /></div>
          <div className="mt-4 text-white/75"><HighlightsList data={data} t={t} icon="◆" /></div>
          <div className="mt-5"><CtaButton data={data} t={t} className="rounded-sm uppercase tracking-[0.2em]" style={{ background: gold, color: '#1a1208' }} /></div>
        </div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

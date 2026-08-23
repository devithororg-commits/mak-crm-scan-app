import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { FrameBorder, SectionLabel } from './templateShared'

function DecoCorner({ className }: { className: string }) {
  return (
    <svg className={`absolute h-12 w-12 ${className}`} viewBox="0 0 48 48" fill="none">
      <path d="M0 0 L48 0 L48 4 L4 4 L4 48 L0 48 Z" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

export default function ArtDecoLuxeCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const gold = data.accentColor
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl text-amber-50" style={{ background: 'linear-gradient(180deg, #1a1510 0%, #0d0a08 100%)' }}>
      <Watermark data={data} />
      <FrameBorder color={gold} inset={20} />
      <DecoCorner className="left-4 top-4 text-amber-400" />
      <DecoCorner className="right-4 top-4 rotate-90 text-amber-400" />
      <DecoCorner className="bottom-4 left-4 -rotate-90 text-amber-400" />
      <DecoCorner className="bottom-4 right-4 rotate-180 text-amber-400" />
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-10 text-center">
        <SectionLabel data={data} t={t} text={data.eyebrow || '◆ Art Deco ◆'} />
        <h2 className="mt-4 font-serif font-bold uppercase leading-none tracking-[0.15em]" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.2, color: gold }}>
          <HighlightText text={data.title || '**Gilded** Age'} data={data} />
        </h2>
        <div className="my-5 h-px w-24" style={{ background: `linear-gradient(90deg, transparent, ${gold}, transparent)` }} />
        <p className="max-w-xs font-serif italic text-amber-200/70" style={t.body}><HighlightText text={data.description || 'Timeless elegance meets modern luxury.'} data={data} /></p>
        {data.ctaText && (
          <span className="mt-8 border px-8 py-2 font-serif uppercase tracking-[0.3em]" style={{ borderColor: hexToRgba(gold, 0.5), color: gold }}>
            <HighlightText text={data.ctaText} data={data} />
          </span>
        )}
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

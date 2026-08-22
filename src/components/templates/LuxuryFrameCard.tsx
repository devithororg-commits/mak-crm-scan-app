import { MoreHorizontal } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'

const FRAME = '#f4f1ea'

export default function LuxuryFrameCard({ data, slideIndex }: { data: CreativeData; slideIndex?: number }) {
  const t = getTypography(data)
  const current = (slideIndex ?? data.activeCarouselSlide) + 1
  const total = data.carouselSlides.length || 7
  const slideLabel = data.badge || `${current} / ${total}`
  const brandLeft = data.companyName || 'ALFA'
  const brandRight = data.eyebrow || data.industry || 'BINGHATTI'
  const partnerName = data.title || 'Mercedes - Benz'
  const coverUrl = data.showCreativeImage && data.imageUrl ? data.imageUrl : ''

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-[2rem]"
      style={{ background: FRAME, padding: 14 }}
    >
      <Watermark data={data} />

      {/* Inner image area */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-stone-300 via-stone-200 to-amber-100" />
        )}

        {/* Top-left slide badge */}
        <div
          className="absolute left-0 top-0 z-10 rounded-br-2xl px-5 py-2.5 font-semibold text-slate-700"
          style={{ ...t.label, background: FRAME }}
        >
          {slideLabel}
        </div>

        {/* Top-right menu dots */}
        <div className="absolute right-5 top-5 z-10">
          <MoreHorizontal className="h-6 w-6 text-white drop-shadow-md" strokeWidth={2} />
        </div>

        {/* Bottom black bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center bg-black/90 px-5 py-3">
          <div className="flex items-center gap-3">
            {data.headerShowLogo && data.logoUrl ? (
              <img
                src={data.logoUrl}
                alt=""
                className="h-5 object-contain brightness-0 invert"
                style={{ maxWidth: data.headerLogoSize }}
              />
            ) : (
              <span className="text-sm font-bold tracking-widest text-white" style={t.label}>{brandLeft}</span>
            )}
            <span className="text-white/40">|</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/90" style={t.label}>
              {brandRight}
            </span>
          </div>
        </div>

        {/* Bottom-right partner badge */}
        <div
          className="absolute bottom-0 right-0 z-20 rounded-tl-[2rem] px-6 py-4"
          style={{ background: FRAME }}
        >
          <p className="font-bold leading-tight text-slate-900" style={{ ...t.subtitle, fontSize: (t.subtitle.fontSize as number) * 1.1 }}>
            {partnerName}
          </p>
        </div>
      </div>

      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

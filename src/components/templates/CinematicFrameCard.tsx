import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

function FilmGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

export default function CinematicFrameCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const coverUrl = data.showCreativeImage && data.imageUrl ? data.imageUrl : ''
  const rating = data.reviewRating || data.badge || '★★★★★'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-black text-white">
      <Watermark data={data} />

      <div className="relative z-10 h-[8%] min-h-[28px] bg-black" />
      <div className="relative min-h-0 flex-1">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-800 to-slate-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60" />
        <FilmGrain />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
          <p className="font-medium uppercase tracking-[0.5em] text-amber-400/90" style={t.label}>
            {data.eyebrow || 'NOW SHOWING'}
          </p>
          <h2
            className="mt-3 font-serif font-bold uppercase leading-none tracking-wide"
            style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.2, letterSpacing: '0.08em' }}
          >
            <HighlightText text={data.title || '**THE** ESTATE'} data={data} />
          </h2>
          <p className="mt-2 text-amber-200/60" style={t.label}>{rating}</p>
          <p className="mt-4 max-w-md text-white/75" style={t.body}>
            <HighlightText text={data.description || data.subtitle || 'A cinematic showcase for premium properties and brand stories.'} data={data} />
          </p>
          {data.ctaText && (
            <span className="mt-6 rounded border border-amber-400/60 px-6 py-2 uppercase tracking-[0.3em] text-amber-300" style={t.label}>
              <HighlightText text={data.ctaText} data={data} />
            </span>
          )}
        </div>
      </div>
      <div className="relative z-10 h-[8%] min-h-[28px] bg-black" />

      <CreativeFooter data={data} />
    </div>
  )
}

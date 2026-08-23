import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'
import { TemplateLayout } from './CreativeImage'

export default function EditorialMagazineCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const issue = data.badge || 'ISSUE 12'
  const year = data.publishedDate || '2026'
  const tagline = data.eyebrow || data.companyName || 'CREATIVE STUDIO'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#0a0a0a] text-white">
      <Watermark data={data} />

      <div className="flex items-center justify-between border-b border-white/10 px-6 py-3">
        <CreativeLogo
          data={data}
          placement="header"
          fallback={<span className="font-bold tracking-[0.3em]" style={t.label}>{tagline.slice(0, 12)}</span>}
        />
        <div className="text-right">
          <p className="font-medium uppercase tracking-[0.25em] text-white/50" style={t.label}>{issue}</p>
          <p className="text-white/70" style={t.label}>{year}</p>
        </div>
      </div>

      <TemplateLayout data={{ ...data, imageCoverHeight: data.imageCoverHeight || 180, imagePosition: data.showCreativeImage ? data.imagePosition : 'cover' }}>
        <div className="relative flex min-h-0 flex-1 flex-col px-6 py-5">
          <div
            className="absolute right-4 top-1/2 origin-center rotate-90 text-[10px] font-medium uppercase tracking-[0.4em] text-white/30"
            style={t.label}
          >
            {data.location || data.industry || 'DESIGN · BRAND · LIFESTYLE'}
          </div>

          <p className="mb-2 font-medium uppercase tracking-[0.35em]" style={{ ...t.label, color: data.accentColor }}>
            <HighlightText text={data.subtitle || 'The Art of'} data={data} />
          </p>

          <h2
            className="max-w-[85%] font-serif font-bold leading-[0.92] tracking-tight"
            style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.45, fontFamily: '"Playfair Display", Georgia, serif' }}
          >
            <HighlightText text={data.title || '**Modern** Living'} data={{ ...data, highlightStyle: 'accent' }} />
          </h2>

          <div className="mt-4 flex items-end gap-4">
            <div className="h-16 w-1 shrink-0" style={{ background: `linear-gradient(to bottom, ${data.accentColor}, transparent)` }} />
            <p className="max-w-xs text-white/65" style={t.body}>
              <HighlightText text={data.description || 'Curated spaces, bold typography, and timeless design for the next generation.'} data={data} />
            </p>
          </div>

          {data.highlights.filter(Boolean).length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {data.highlights.filter(Boolean).slice(0, 4).map((h, i) => (
                <span key={i} className="rounded-full border border-white/20 px-3 py-1 text-white/80" style={t.label}>
                  {h}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-end justify-between pt-6">
            {data.ctaText && (
              <span
                className="inline-block border-b-2 pb-1 font-semibold uppercase tracking-widest"
                style={{ ...t.label, borderColor: data.accentColor, color: data.accentColor }}
              >
                <HighlightText text={data.ctaText} data={data} />
              </span>
            )}
            <div className="flex gap-0.5 opacity-40">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="h-6 w-0.5 bg-white" style={{ height: i % 3 === 0 ? 20 : 12 }} />
              ))}
            </div>
          </div>
        </div>
      </TemplateLayout>

      <div className="h-1" style={{ background: `linear-gradient(90deg, ${data.accentColor}, ${data.secondaryColor}, ${hexToRgba(data.accentColor, 0.3)})` }} />
      <CreativeFooter data={data} />
    </div>
  )
}

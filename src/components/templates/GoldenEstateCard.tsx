import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function GoldenEstateCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const gold = data.accentColor || '#C9A227'
  const deep = data.secondaryColor || '#1a1208'
  const coverUrl = data.showCreativeImage && data.imageUrl ? data.imageUrl : ''

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl text-white">
      <Watermark data={data} />

      {coverUrl ? (
        <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" crossOrigin="anonymous" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-amber-950 to-black" />
      )}

      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(160deg, ${hexToRgba(deep, 0.85)} 0%, ${hexToRgba(deep, 0.4)} 45%, ${hexToRgba(gold, 0.25)} 100%)` }}
      />

      <div className="pointer-events-none absolute inset-4 rounded-2xl border" style={{ borderColor: hexToRgba(gold, 0.45) }} />
      <div className="pointer-events-none absolute inset-6 rounded-xl border border-dashed" style={{ borderColor: hexToRgba(gold, 0.2) }} />

      <div className="relative flex min-h-0 flex-1 flex-col px-8 py-7">
        <div className="flex items-start justify-between">
          <CreativeLogo
            data={data}
            placement="header"
            fallback={
              <span className="font-serif tracking-[0.2em] text-amber-200/80" style={t.label}>
                {data.companyName || 'LUXE ESTATES'}
              </span>
            }
          />
          <span className="rounded-full px-3 py-1 font-medium uppercase tracking-widest" style={{ ...t.label, background: hexToRgba(gold, 0.2), color: gold, border: `1px solid ${hexToRgba(gold, 0.4)}` }}>
            {data.badge || 'Exclusive'}
          </span>
        </div>

        <div className="mt-auto">
          <p className="font-medium uppercase tracking-[0.35em] text-amber-200/70" style={t.label}>
            <HighlightText text={data.eyebrow || 'Premium Listing'} data={data} />
          </p>
          <h2
            className="mt-2 font-serif font-bold leading-tight"
            style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.3, color: '#FAF5E6' }}
          >
            <HighlightText text={data.propertyTitle || data.title || '**Palm Grove** Villa'} data={{ ...data, highlightStyle: 'accent', highlightColor: gold }} />
          </h2>
          <p className="mt-2 text-amber-100/70" style={t.body}>
            {data.propertyAddress || data.location || 'Banjara Hills, Hyderabad'}
          </p>

          <div className="mt-5 flex flex-wrap gap-4">
            {[
              { label: 'Price', value: data.propertyPrice || '₹4.8 Cr' },
              { label: 'Beds', value: data.propertyBeds || '4' },
              { label: 'Area', value: data.propertySqft ? `${data.propertySqft} sqft` : '3,200 sqft' },
            ].map((m) => (
              <div key={m.label}>
                <p className="uppercase tracking-widest text-amber-300/50" style={t.label}>{m.label}</p>
                <p className="font-semibold text-amber-100" style={t.metric}>{m.value}</p>
              </div>
            ))}
          </div>

          {data.ctaText && (
            <span
              className="mt-6 inline-block rounded-sm px-8 py-3 font-semibold uppercase tracking-[0.2em]"
              style={{ background: `linear-gradient(135deg, ${gold}, ${hexToRgba(gold, 0.7)})`, color: deep }}
            >
              <HighlightText text={data.ctaText} data={data} />
            </span>
          )}
        </div>
      </div>

      <CreativeFooter data={data} />
    </div>
  )
}

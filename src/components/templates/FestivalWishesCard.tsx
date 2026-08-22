import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

const FESTIVAL_GRADIENTS: Record<string, string> = {
  diwali: 'from-amber-600 via-orange-600 to-red-700',
  ugadi: 'from-emerald-600 via-green-600 to-teal-700',
  holi: 'from-pink-500 via-purple-500 to-indigo-600',
  christmas: 'from-red-700 via-red-600 to-green-700',
  newyear: 'from-indigo-700 via-violet-600 to-purple-700',
  default: 'from-amber-500 via-orange-500 to-rose-600',
}

function getFestivalGradient(badge: string) {
  const key = badge.toLowerCase()
  if (key.includes('diwali') || key.includes('deepavali')) return FESTIVAL_GRADIENTS.diwali
  if (key.includes('ugadi')) return FESTIVAL_GRADIENTS.ugadi
  if (key.includes('holi')) return FESTIVAL_GRADIENTS.holi
  if (key.includes('christmas')) return FESTIVAL_GRADIENTS.christmas
  if (key.includes('new year') || key.includes('newyear')) return FESTIVAL_GRADIENTS.newyear
  return FESTIVAL_GRADIENTS.default
}

export default function FestivalWishesCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const festival = data.badge || 'Diwali 2025'
  const gradient = getFestivalGradient(festival)

  return (
    <div className={`relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} text-white`}>
      <Watermark data={data} />

      {data.showCreativeImage && data.imageUrl && (
        <div className="absolute inset-0">
          <img src={data.imageUrl} alt="" className="h-full w-full object-cover" style={{ opacity: (data.imageOpacity ?? 30) / 100 }} />
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              width: 4 + (i % 3) * 4,
              height: 4 + (i % 3) * 4,
              top: `${10 + (i * 7) % 80}%`,
              left: `${5 + (i * 11) % 90}%`,
              opacity: 0.3 + (i % 5) * 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-10 text-center">
        <CreativeLogo
          data={data}
          placement="header"
          fallback={
            <div
              className="mb-6 flex items-center justify-center rounded-2xl bg-white/20 font-bold text-white backdrop-blur-sm"
              style={{ width: data.headerLogoSize + 8, height: data.headerLogoSize + 8 }}
            >
              {(data.companyName || 'M')[0]}
            </div>
          }
        />

        <p className="font-medium uppercase tracking-[0.2em] text-white/80" style={t.label}>
          <HighlightText text={data.eyebrow || data.companyName || 'MAK Projects'} data={data} />
        </p>

        <div className="my-4 h-px w-16 bg-white/40" />

        <p className="font-bold uppercase tracking-wider text-amber-200" style={{ ...t.subtitle, letterSpacing: '0.15em' }}>
          {festival}
        </p>

        <h2 className="mt-4 max-w-sm font-bold leading-tight" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.1 }}>
          <HighlightText text={data.title || 'Wishing you joy, prosperity & a beautiful home!'} data={data} />
        </h2>

        <p className="mt-4 max-w-xs text-white/80" style={t.body}>
          <HighlightText text={data.description || data.subtitle || 'May this festive season bring happiness and new beginnings to you and your family.'} data={data} />
        </p>

        {data.ctaText && (
          <span className="mt-8 inline-block rounded-full border-2 border-white/40 bg-white/15 px-8 py-3 font-semibold backdrop-blur-sm" style={t.subtitle}>
            <HighlightText text={data.ctaText} data={data} />
          </span>
        )}

        <p className="mt-6 text-white/50" style={t.label}>
          {data.website || data.footerWebsite}
        </p>
      </div>

      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'

export default function QuoteCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const quote = data.title || data.description || 'Success is not final, failure is not fatal — it is the courage to continue that counts.'
  const author = data.personName || data.authorName || 'Winston Churchill'
  const role = data.personRole || data.subtitle || 'British Statesman'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white">
      <Watermark data={data} />

      {data.showCreativeImage && data.imageUrl && (
        <div className="absolute inset-0">
          <img src={data.imageUrl} alt="" className="h-full w-full object-cover opacity-20" />
        </div>
      )}

      <div className="absolute left-8 top-16 font-serif text-[120px] leading-none text-white/5">"</div>

      <div className="relative flex min-h-0 flex-1 flex-col justify-center p-10">
        <CreativeLogo
          data={data}
          placement="header"
          fallback={
            <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 font-bold">
              {(data.companyName || 'M')[0]}
            </div>
          }
        />

        {data.eyebrow && (
          <p className="mb-4 font-medium uppercase tracking-[0.2em] text-indigo-300" style={t.label}>
            {data.eyebrow}
          </p>
        )}

        <blockquote className="relative">
          <p className="font-medium italic leading-relaxed text-white/90" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 0.95, lineHeight: 1.5 }}>
            "{quote}"
          </p>
        </blockquote>

        <div className="mt-8 flex items-center gap-4">
          {data.showCreativeImage && data.imageUrl ? (
            <img
              src={data.imageUrl}
              alt=""
              className="rounded-full border-2 border-white/20 object-cover"
              style={{ width: 52, height: 52 }}
            />
          ) : (
            <div className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold" style={{ width: 52, height: 52 }}>
              {author[0]}
            </div>
          )}
          <div>
            <p className="font-bold text-white" style={t.subtitle}>{author}</p>
            <p className="text-indigo-300" style={t.label}>{role}</p>
            {data.companyName && (
              <p className="text-white/40" style={t.label}>{data.companyName}</p>
            )}
          </div>
        </div>

        {data.ctaText && (
          <span className="mt-8 inline-block self-start rounded-full border border-white/20 bg-white/10 px-6 py-2.5 backdrop-blur-sm" style={t.subtitle}>
            {data.ctaText}
          </span>
        )}
      </div>

      {data.badge && (
        <div className="absolute bottom-8 right-8 rounded-full bg-indigo-500/20 px-4 py-1.5 font-semibold text-indigo-200" style={t.label}>
          {data.badge}
        </div>
      )}

      <CreativeFooter data={data} />
    </div>
  )
}

import { Quote, Star } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

export default function TestimonialCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const name = data.reviewerName || data.authorName || data.personName || 'Client Name'
  const role = data.reviewerRole || data.personRole || 'Happy Customer'
  const review = data.reviewText || data.description || 'Outstanding service and professionalism throughout the entire process.'
  const rating = parseFloat(data.reviewRating || data.metric1Value || '5') || 5
  const stars = Math.min(5, Math.max(1, Math.round(rating)))

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
      <Watermark data={data} />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{ background: `radial-gradient(circle at 20% 20%, ${data.accentColor}, transparent 50%)` }}
      />

      <div className="relative flex min-h-0 flex-1 flex-col p-10">
        <Quote className="mb-6 h-10 w-10 opacity-20" style={{ color: data.accentColor }} />

        <p className="flex-1 leading-relaxed text-slate-700" style={{ ...t.body, fontSize: (t.body.fontSize as number) * 1.15 }}>
          &ldquo;<HighlightText text={review} data={data} />&rdquo;
        </p>

        <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-8">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${data.accentColor}, ${data.secondaryColor})` }}
          >
            {data.avatarShowLogo && data.logoUrl ? (
              <img src={data.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span style={{ fontSize: 22 }}>{name[0]}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900" style={t.subtitle}>{name}</p>
            <p className="text-slate-400" style={t.label}>{role}</p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4"
                  fill={i < stars ? data.accentColor : '#e2e8f0'}
                  stroke={i < stars ? data.accentColor : '#e2e8f0'}
                  strokeWidth={0}
                />
              ))}
            </div>
            <span className="font-bold text-slate-700" style={t.metric}>{rating.toFixed(1)}</span>
          </div>
        </div>

        {data.companyName && (
          <p className="mt-4 text-center text-slate-400" style={t.label}>
            {data.companyName}
          </p>
        )}
      </div>

      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

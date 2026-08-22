import { Bookmark, Camera, MapPin, Star } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'

export default function ProfileGlassCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const name = data.personName || data.title || 'Aiwanfo Faith'
  const tagline = data.description || 'Designing for clarity & usability'
  const role = data.personRole || data.subtitle || 'Product designer'
  const location = data.location || 'In the feedback loop.'
  const tools = data.tags || 'Framer, WordPress, Figma'
  const toolList = tools.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 4)
  const cta = data.ctaText || 'Get in touch'
  const alternate = data.status?.toLowerCase() === 'alternate'

  const stats = [
    { icon: Star, value: data.metric1Value || '4.6', label: data.metric1Label || 'rating', fill: true },
    { icon: null, value: data.metric2Value || '7 days', label: data.metric2Label || 'duration', fill: false },
    { icon: null, value: data.metric3Value || '$44/hr', label: data.metric3Label || 'rate', fill: false },
  ]

  const bgUrl = data.showCreativeImage && data.imageUrl ? data.imageUrl : ''
  const avatarSize = data.avatarLogoSize || 72

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-white/60 shadow-[0_12px_48px_rgba(0,0,0,0.15)]">
      <Watermark data={data} />

      {/* Full-bleed background */}
      {bgUrl ? (
        <img src={bgUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-emerald-200 to-amber-100" />
      )}

      {/* White gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/85 to-white/20" />

      {/* Bookmark */}
      <div className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm">
        <Bookmark className="h-[18px] w-[18px] text-slate-700" strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end p-8">
        {/* Avatar */}
        <div
          className="mb-5 overflow-hidden rounded-full bg-white shadow-lg"
          style={{
            width: avatarSize,
            height: avatarSize,
            border: `${data.avatarLogoBorder || 3}px solid white`,
          }}
        >
          {data.avatarShowLogo && data.logoUrl ? (
            <img src={data.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 font-bold text-slate-600"
              style={{ fontSize: avatarSize * 0.38 }}
            >
              {name[0]}
            </div>
          )}
        </div>

        {/* Name + tagline */}
        <h2 className="font-bold leading-tight text-slate-900" style={t.title}>{name}</h2>
        <p className="mt-1 text-slate-500" style={t.subtitle}>{tagline}</p>

        {/* Role + location (+ tools inline for layout A) */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="inline-flex items-center gap-1.5 text-slate-600" style={t.body}>
            <Camera className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
            {role}
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-600" style={t.body}>
            <MapPin className="h-4 w-4 text-slate-400" strokeWidth={1.75} />
            {location}
          </span>
          {!alternate && toolList.length > 0 && (
            <span className="ml-auto inline-flex items-center gap-2 text-slate-500" style={t.label}>
              <span className="font-medium text-slate-400">Tools</span>
              {toolList.map((tool) => (
                <span key={tool} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {tool}
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Stats (moved up for layout B) */}
        {alternate && (
          <div className="mt-5 flex items-stretch gap-6">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <div className="flex items-center gap-1">
                  {s.icon && (
                    <s.icon className="h-4 w-4 text-slate-800" fill={s.fill ? '#1e293b' : 'none'} strokeWidth={s.fill ? 0 : 2} />
                  )}
                  <span className="font-bold text-slate-900" style={t.metric}>{s.value}</span>
                </div>
                <span className="mt-0.5 text-slate-400" style={{ ...t.label, fontSize: 10 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer row: stats + CTA (layout A) or tools + CTA (layout B) */}
        <div className="mt-6 flex items-end justify-between gap-4">
          {alternate ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-400" style={t.label}>Tools</span>
              {toolList.map((tool) => (
                <span key={tool} className="rounded-md bg-white/70 px-2.5 py-1 text-[10px] font-semibold text-slate-600 backdrop-blur-sm">
                  {tool}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-stretch gap-6">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {s.icon && (
                      <s.icon className="h-4 w-4 text-slate-800" fill={s.fill ? '#1e293b' : 'none'} strokeWidth={s.fill ? 0 : 2} />
                    )}
                    <span className="font-bold text-slate-900" style={t.metric}>{s.value}</span>
                  </div>
                  <span className="mt-0.5 text-slate-400" style={{ ...t.label, fontSize: 10 }}>{s.label}</span>
                </div>
              ))}
            </div>
          )}

          <span
            className={`shrink-0 rounded-full px-6 py-3 font-semibold ${
              alternate
                ? 'bg-white text-slate-900 shadow-md'
                : 'bg-slate-900 text-white'
            }`}
            style={t.subtitle}
          >
            {cta}
          </span>
        </div>
      </div>

      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

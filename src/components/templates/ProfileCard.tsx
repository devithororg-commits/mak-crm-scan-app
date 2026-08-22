import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  Video,
  FolderOpen,
  Wrench,
} from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'

export default function ProfileCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const name = data.personName || data.title || 'Your Name'
  const role = data.personRole || data.subtitle || 'Your Role'
  const studio = data.companyName || data.eyebrow || 'Studio'
  const tools = data.tags || 'Figma, WordPress'
  const toolList = tools.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 3)

  const stats = [
    { icon: Star, value: data.metric1Value || '4.0', label: data.metric1Label || 'rating', fill: true },
    { icon: null, value: data.metric2Value || '10 hrs/day', label: data.metric2Label || 'duration', fill: false },
    { icon: null, value: data.metric3Value || '₹40/hr', label: data.metric3Label || 'rate', fill: false },
  ]

  const coverUrl = data.showCreativeImage && data.imageUrl ? data.imageUrl : ''

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-white text-slate-900 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
      <Watermark data={data} />

      {/* Cover image — top ~34% */}
      <div className="relative h-[34%] min-h-[140px] shrink-0 overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(251,191,36,0.4),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(244,63,94,0.25),transparent_50%)]" />
        )}
      </div>

      {/* Avatar row — overlaps cover */}
      <div className="relative z-10 flex items-end justify-between px-8" style={{ marginTop: -(data.avatarLogoSize / 2 + 4) }}>
        <div
          className="overflow-hidden rounded-full bg-white shadow-md"
          style={{
            border: `${data.avatarLogoBorder || 4}px solid white`,
            width: data.avatarLogoSize,
            height: data.avatarLogoSize,
          }}
        >
          {data.avatarShowLogo && data.logoUrl ? (
            <img
              src={data.logoUrl}
              alt=""
              className="h-full w-full object-cover"
              style={{ width: data.avatarLogoSize, height: data.avatarLogoSize }}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 font-bold text-indigo-600"
              style={{ fontSize: data.avatarLogoSize * 0.38, width: data.avatarLogoSize, height: data.avatarLogoSize }}
            >
              {name[0]}
            </div>
          )}
        </div>
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
          <Heart className="h-[18px] w-[18px] text-rose-400" fill="#fb7185" strokeWidth={1.5} />
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1 flex-col px-8 pt-4">
        {/* Name + verified */}
        <div className="flex items-center gap-2">
          <h2 className="font-bold leading-tight text-slate-900" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 0.95 }}>
            {name}
          </h2>
          <BadgeCheck className="h-[22px] w-[22px] shrink-0 text-emerald-500" fill="#10b981" strokeWidth={0} />
        </div>

        {/* Role */}
        <p className="mt-1 text-slate-400" style={{ ...t.subtitle, fontSize: (t.subtitle.fontSize as number) * 0.95 }}>
          {role}
        </p>

        {/* Pill badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-slate-600" style={t.label}>
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            {studio}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-slate-600" style={t.label}>
            <Wrench className="h-3.5 w-3.5 text-slate-400" />
            {toolList.length > 0 ? toolList.join(' · ') : 'Tools'}
          </span>
        </div>

        {/* Stats row */}
        <div className="mt-6 flex items-stretch border-y border-slate-100 py-5">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex flex-1 flex-col items-center justify-center ${i > 0 ? 'border-l border-slate-100' : ''}`}>
              <div className="flex items-center gap-1">
                {s.icon && (
                  <s.icon
                    className="h-4 w-4 text-slate-800"
                    fill={s.fill ? '#1e293b' : 'none'}
                    strokeWidth={s.fill ? 0 : 2}
                  />
                )}
                <span className="font-bold text-slate-900" style={t.metric}>{s.value}</span>
              </div>
              <span className="mt-0.5 text-slate-400" style={{ ...t.label, fontSize: 10 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Description (optional) */}
        {data.description && (
          <p className="mt-4 line-clamp-2 text-slate-500" style={t.body}>{data.description}</p>
        )}

        {/* Action buttons */}
        <div className="mt-auto flex justify-center gap-4 pb-2 pt-6">
          {[Phone, MessageCircle, Video, FolderOpen].map((Icon, i) => (
            <div
              key={i}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-slate-100 transition"
            >
              <Icon className="h-5 w-5 text-slate-500" strokeWidth={1.75} />
            </div>
          ))}
        </div>
      </div>

      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

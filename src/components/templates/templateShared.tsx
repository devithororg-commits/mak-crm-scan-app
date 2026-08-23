import type { CSSProperties, ReactNode } from 'react'
import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import type { TypographyStyles } from '../../utils/typography'
import HighlightText from './HighlightText'

export function PhotoBackground({ data, overlay }: { data: CreativeData; overlay?: string }) {
  const url = data.showCreativeImage && data.imageUrl ? data.imageUrl : ''
  return (
    <>
      {url ? (
        <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" crossOrigin="anonymous" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950" />
      )}
      {overlay && <div className="absolute inset-0" style={{ background: overlay }} />}
    </>
  )
}

export function MetricGrid({
  data,
  t,
  items,
  cols = 3,
}: {
  data: CreativeData
  t: TypographyStyles
  items: { label: string; value: string }[]
  cols?: 2 | 3 | 4
}) {
  return (
    <div className={`grid gap-2 ${cols === 4 ? 'grid-cols-2' : cols === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {items.map((m) => (
        <div key={m.label} className="rounded-xl bg-white/10 p-2.5 text-center backdrop-blur-sm">
          <p className="font-bold" style={{ ...t.metric, color: data.accentColor }}>{m.value}</p>
          <p className="text-white/50" style={t.label}>{m.label}</p>
        </div>
      ))}
    </div>
  )
}

export function HighlightsList({ data, t, limit = 4, icon = '•' }: { data: CreativeData; t: TypographyStyles; limit?: number; icon?: string }) {
  const items = data.highlights.filter(Boolean).slice(0, limit)
  if (!items.length) return null
  return (
    <ul className="space-y-1.5">
      {items.map((h, i) => (
        <li key={i} className="flex items-center gap-2" style={t.body}>
          <span style={{ color: data.accentColor }}>{icon}</span> {h}
        </li>
      ))}
    </ul>
  )
}

export function CtaButton({ data, t, className = '', style }: { data: CreativeData; t: TypographyStyles; className?: string; style?: CSSProperties }) {
  if (!data.ctaText) return null
  return (
    <span className={`block rounded-xl py-3 text-center font-bold ${className}`} style={{ ...t.subtitle, ...style }}>
      <HighlightText text={data.ctaText} data={data} />
    </span>
  )
}

export function GlowOrb({ color, className }: { color: string; className: string }) {
  return <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} style={{ background: hexToRgba(color, 0.35) }} />
}

export function SectionLabel({ data, t, text }: { data: CreativeData; t: TypographyStyles; text?: string }) {
  return (
    <p className="font-medium uppercase tracking-[0.3em]" style={{ ...t.label, color: data.accentColor }}>
      {text || data.eyebrow}
    </p>
  )
}

export function Headline({ data, t, scale = 1.2, className = '' }: { data: CreativeData; t: TypographyStyles; scale?: number; className?: string }) {
  return (
    <h2 className={`font-bold leading-tight ${className}`} style={{ ...t.title, fontSize: (t.title.fontSize as number) * scale }}>
      <HighlightText text={data.title || data.propertyTitle || 'Your Headline'} data={data} />
    </h2>
  )
}

export function FrameBorder({ color, inset = 16 }: { color: string; inset?: number }) {
  return (
    <div
      className="pointer-events-none absolute rounded-2xl border"
      style={{ inset, borderColor: hexToRgba(color, 0.45) }}
    />
  )
}

export function DotGrid({ color = '#ffffff', opacity = 0.08 }: { color?: string; opacity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    />
  )
}

export function PropertyStats({ data, t }: { data: CreativeData; t: TypographyStyles }) {
  return (
    <div className="flex flex-wrap gap-4">
      {[
        { label: 'Price', value: data.propertyPrice || '₹1.25 Cr' },
        { label: 'Beds', value: data.propertyBeds || '3' },
        { label: 'Area', value: data.propertySqft ? `${data.propertySqft} sqft` : '1,850 sqft' },
      ].map((m) => (
        <div key={m.label}>
          <p className="uppercase tracking-widest opacity-50" style={t.label}>{m.label}</p>
          <p className="font-semibold" style={t.metric}>{m.value}</p>
        </div>
      ))}
    </div>
  )
}

export function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  )
}

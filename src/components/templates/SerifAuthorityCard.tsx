import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

function GrowthArrow({ accent, secondary }: { accent: string; secondary: string }) {
  const dots = [
    { cx: 30, cy: 140, color: accent },
    { cx: 70, cy: 110, color: '#F472B6' },
    { cx: 120, cy: 75, color: secondary },
    { cx: 170, cy: 35, color: '#FBBF24' },
  ]
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full" fill="none">
      <path
        d="M 20 150 Q 60 130 90 100 T 180 20"
        stroke={`url(#arrowGrad)`}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M 20 150 Q 60 130 90 100 T 180 20" stroke={hexToRgba(accent, 0.2)} strokeWidth="8" fill="none" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r="7" fill={d.color} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
      ))}
      <polygon points="175,15 190,25 178,32" fill="#FBBF24" />
      <defs>
        <linearGradient id="arrowGrad" x1="20" y1="150" x2="180" y2="20">
          <stop offset="0%" stopColor={accent} />
          <stop offset="50%" stopColor={secondary} />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function SerifAuthorityCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const headline = data.title || 'Consistency Builds **Authority**.'
  const sub = data.description || data.subtitle || "Posting more isn't the strategy. Posting with a system is."
  const footer = data.ctaText || `Plan smarter with **${data.companyName || 'Your Brand'}**.`

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl"
      style={{
        background: `radial-gradient(ellipse 50% 40% at 100% 0%, ${hexToRgba('#FB923C', 0.2)}, transparent 50%),
          radial-gradient(ellipse 40% 35% at 0% 100%, ${hexToRgba(data.accentColor, 0.12)}, transparent 50%),
          #FAFAFA`,
      }}
    >
      <Watermark data={data} />
      <div className="relative flex min-h-0 flex-1 flex-col p-10">
        <h2
          className="max-w-md font-bold leading-[1.15] tracking-tight text-slate-900"
          style={{ ...t.title, fontFamily: "'Playfair Display', Georgia, serif", fontSize: (t.title.fontSize as number) * 1.25 }}
        >
          <HighlightText text={headline} data={data} />
        </h2>
        <p className="mt-5 max-w-sm leading-relaxed text-slate-600" style={{ ...t.body, fontSize: (t.body.fontSize as number) * 1.08 }}>
          <HighlightText text={sub} data={data} />
        </p>
        <div className="mt-auto flex items-end justify-between pt-8">
          <p className="text-sm text-slate-500" style={t.body}>
            <HighlightText text={footer} data={data} />
          </p>
          <div className="h-28 w-44">
            <GrowthArrow accent={data.accentColor} secondary={data.secondaryColor} />
          </div>
        </div>
      </div>
      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

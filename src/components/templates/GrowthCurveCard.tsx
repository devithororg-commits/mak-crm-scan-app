import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

function CurveChart({ accent, secondary }: { accent: string; secondary: string }) {
  const points = [
    { cx: 40, cy: 130, color: '#FB923C' },
    { cx: 90, cy: 95, color: '#F472B6' },
    { cx: 140, cy: 60, color: secondary },
    { cx: 190, cy: 25, color: accent },
  ]
  return (
    <svg viewBox="0 0 230 150" className="h-full w-full" fill="none">
      <path
        d="M 30 140 C 60 120, 80 100, 110 80 S 170 40, 200 20"
        stroke={`url(#curveGrad)`}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${hexToRgba(accent, 0.3)})` }}
      />
      {points.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.cx} cy={p.cy + 4} rx="8" ry="3" fill="rgba(0,0,0,0.08)" />
          <circle cx={p.cx} cy={p.cy} r="9" fill={p.color} style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }} />
        </g>
      ))}
      <defs>
        <linearGradient id="curveGrad" x1="30" y1="140" x2="200" y2="20">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="45%" stopColor="#EC4899" />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function GrowthCurveCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const brand = data.companyName || data.eyebrow || 'Your Brand'
  const headline = data.title || 'Consistency Beats **Virality**.'
  const sub = data.description || data.subtitle || 'Growth comes from systems, not random posting.'
  const footer = data.ctaText || `Plan smarter with **${brand}**.`

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-slate-50"
      style={{
        background: `radial-gradient(ellipse 60% 50% at 80% 90%, ${hexToRgba(data.secondaryColor, 0.15)}, transparent 55%), #F8FAFC`,
      }}
    >
      <Watermark data={data} />
      <div className="relative flex min-h-0 flex-1 flex-col p-10">
        <div className="mb-8 flex items-center gap-2">
          <CreativeLogo
            data={data}
            placement="badge"
            fallback={
              <div
                className="flex items-center justify-center rounded-lg bg-slate-900 font-bold text-white"
                style={{ width: 28, height: 28, fontSize: 12 }}
              >
                {brand[0]}
              </div>
            }
          />
          <span className="font-semibold text-slate-800" style={t.subtitle}>{brand}</span>
        </div>

        <h2 className="max-w-md font-bold leading-tight tracking-tight text-slate-900" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.2 }}>
          <HighlightText text={headline} data={data} />
        </h2>
        <p className="mt-4 max-w-sm text-slate-600" style={{ ...t.body, fontSize: (t.body.fontSize as number) * 1.05 }}>
          <HighlightText text={sub} data={data} />
        </p>

        <div className="mt-6 flex-1">
          <CurveChart accent={data.accentColor} secondary={data.secondaryColor} />
        </div>

        <p className="mt-2 text-sm text-slate-500" style={t.body}>
          <HighlightText text={footer} data={data} />
        </p>
      </div>
      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

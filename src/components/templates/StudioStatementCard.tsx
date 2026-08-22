import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

function BottomArc({ accent, secondary }: { accent: string; secondary: string }) {
  return (
    <svg viewBox="0 0 400 120" className="w-full" fill="none" preserveAspectRatio="xMidYMax meet">
      <path
        d="M 0 120 Q 100 20, 200 40 T 400 80 L 400 120 Z"
        fill={`url(#arcGrad)`}
        opacity="0.9"
      />
      {[80, 160, 240, 320].map((x, i) => (
        <circle key={i} cx={x} cy={55 - i * 5} r="4" fill="white" opacity="0.8" />
      ))}
      <defs>
        <linearGradient id="arcGrad" x1="0" y1="0" x2="400" y2="120">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function StudioStatementCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const studio = data.companyName || data.eyebrow || 'STUDIO'
  const headline = data.title || '**Simplicity.**'
  const sub = data.description || data.subtitle || 'is the meaning of an excellent interface'
  const btn1 = data.ctaText || 'If you like it, comment.'
  const btn2 = data.comparisonLabel || 'And share with someone.'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#F9F9F9] text-slate-900">
      <Watermark data={data} />
      <p className="absolute right-8 top-8 z-10 font-semibold tracking-wide" style={{ ...t.label, color: data.accentColor }}>
        {studio}
      </p>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-10 pb-4 pt-16 text-center">
        <h2
          className="font-extrabold leading-none tracking-tight"
          style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.6 }}
        >
          <HighlightText text={headline} data={{ ...data, highlightStyle: 'gradient' }} />
        </h2>
        <p className="mt-4 max-w-sm text-slate-600" style={{ ...t.body, fontSize: (t.body.fontSize as number) * 1.05 }}>
          <HighlightText text={sub} data={data} />
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[btn1, btn2].map((label) => (
            <span
              key={label}
              className="rounded-full border-2 px-5 py-2.5 text-sm font-medium"
              style={{ borderColor: data.accentColor, color: data.accentColor }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative -mb-1 mt-auto" style={{ filter: `drop-shadow(0 -4px 20px ${hexToRgba(data.accentColor, 0.2)})` }}>
        <BottomArc accent={data.accentColor} secondary={data.secondaryColor} />
      </div>
      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

function RadarGraphic({ accent, secondary }: { accent: string; secondary: string }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" fill="none">
      {[40, 65, 90].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} stroke={hexToRgba(accent, 0.25)} strokeWidth="1.5" />
      ))}
      <circle cx="100" cy="100" r="8" fill={accent} style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(accent, 0.6)})` }} />
      <line x1="100" y1="100" x2="165" y2="45" stroke={`url(#radarGrad)`} strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="radarGrad" x1="100" y1="100" x2="165" y2="45">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function GradientRadarCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const accent = data.accentColor
  const secondary = data.secondaryColor
  const lead = data.eyebrow || 'This tells you something:'
  const line1 = data.subtitle || 'Design is'
  const line2 = data.title || '**changing.**'
  const line3 = data.badge || '**Fast.**'

  return (
    <div
      className="relative flex h-full overflow-hidden rounded-3xl text-slate-900"
      style={{
        background: `radial-gradient(ellipse 60% 50% at 0% 0%, ${hexToRgba(accent, 0.12)}, transparent 60%),
          radial-gradient(ellipse 50% 40% at 100% 100%, ${hexToRgba(secondary, 0.15)}, transparent 55%),
          #FAFAFC`,
        backgroundImage: `
          radial-gradient(circle, ${hexToRgba(accent, 0.08)} 1px, transparent 1px),
          radial-gradient(ellipse 60% 50% at 0% 0%, ${hexToRgba(accent, 0.12)}, transparent 60%),
          radial-gradient(ellipse 50% 40% at 100% 100%, ${hexToRgba(secondary, 0.15)}, transparent 55%)`,
        backgroundSize: '24px 24px, 100% 100%, 100% 100%',
      }}
    >
      <Watermark data={data} />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[58%] flex-col justify-center px-10 py-12">
          <p className="font-medium text-slate-700" style={{ ...t.body, fontSize: (t.body.fontSize as number) * 1.05 }}>
            {lead}
          </p>
          <p className="mt-4 font-bold leading-[1.1] text-slate-900" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.2 }}>
            {line1}
          </p>
          <p className="font-bold leading-[1.05]" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.35 }}>
            <HighlightText text={line2} data={data} />
          </p>
          <p className="font-bold leading-[1.05]" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.35 }}>
            <HighlightText text={line3} data={{ ...data, highlightStyle: 'gradient' }} />
          </p>
          {data.description && (
            <p className="mt-5 text-slate-500" style={t.body}>
              <HighlightText text={data.description} data={data} />
            </p>
          )}
        </div>
        <div className="flex w-[42%] items-center justify-center p-8">
          <RadarGraphic accent={accent} secondary={secondary} />
        </div>
      </div>
      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

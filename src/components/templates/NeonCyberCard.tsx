import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

function ScanLines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
      }}
    />
  )
}

export default function NeonCyberCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const accent = data.accentColor
  const secondary = data.secondaryColor

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#050510] text-white">
      <Watermark data={data} />
      <ScanLines />

      <div
        className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full blur-3xl"
        style={{ background: hexToRgba(accent, 0.35) }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: hexToRgba(secondary, 0.3) }}
      />

      <div className="relative m-4 flex min-h-0 flex-1 flex-col rounded-2xl border p-6" style={{ borderColor: hexToRgba(accent, 0.6), boxShadow: `0 0 30px ${hexToRgba(accent, 0.25)}, inset 0 0 40px ${hexToRgba(accent, 0.05)}` }}>
        <div className="flex items-center justify-between">
          <span className="rounded border px-2 py-0.5 font-mono uppercase tracking-widest" style={{ ...t.label, borderColor: hexToRgba(accent, 0.5), color: accent }}>
            {data.eyebrow || '// LIVE'}
          </span>
          <span className="font-mono text-white/40" style={t.label}>{data.badge || 'v2.0'}</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center py-4">
          <h2
            className="font-extrabold uppercase leading-none tracking-tight"
            style={{
              ...t.title,
              fontSize: (t.title.fontSize as number) * 1.35,
              textShadow: `0 0 20px ${hexToRgba(accent, 0.8)}, 0 0 40px ${hexToRgba(accent, 0.4)}`,
              color: '#fff',
            }}
          >
            <HighlightText text={data.title || '**FUTURE** MODE'} data={{ ...data, highlightStyle: 'accent' }} />
          </h2>
          <p className="mt-3 max-w-sm font-mono text-white/60" style={t.body}>
            <HighlightText text={data.description || data.subtitle || 'Neon-grade visuals for launches that demand attention.'} data={data} />
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: data.metric1Label || 'Speed', value: data.metric1Value || '10x' },
            { label: data.metric2Label || 'Reach', value: data.metric2Value || '2.4M' },
            { label: data.metric3Label || 'Score', value: data.metric3Value || '99%' },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border p-2 text-center" style={{ borderColor: hexToRgba(secondary, 0.4), background: hexToRgba(secondary, 0.08) }}>
              <p className="font-bold" style={{ ...t.metric, color: secondary, textShadow: `0 0 12px ${hexToRgba(secondary, 0.6)}` }}>{m.value}</p>
              <p className="text-white/40" style={t.label}>{m.label}</p>
            </div>
          ))}
        </div>

        {data.ctaText && (
          <div className="mt-4">
            <span
              className="block rounded-lg py-3 text-center font-bold uppercase tracking-widest"
              style={{ background: `linear-gradient(135deg, ${accent}, ${secondary})`, boxShadow: `0 0 24px ${hexToRgba(accent, 0.5)}` }}
            >
              <HighlightText text={data.ctaText} data={data} />
            </span>
          </div>
        )}
      </div>

      <CreativeFooter data={data} />
    </div>
  )
}

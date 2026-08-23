import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

function AuroraBackground({ accent, secondary }: { accent: string; secondary: string }) {
  return (
    <>
      <div
        className="pointer-events-none absolute -left-1/4 -top-1/4 h-3/4 w-3/4 rounded-full blur-3xl"
        style={{ background: hexToRgba(accent, 0.5) }}
      />
      <div
        className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-2/3 w-2/3 rounded-full blur-3xl"
        style={{ background: hexToRgba(secondary, 0.45) }}
      />
      <div
        className="pointer-events-none absolute left-1/3 top-1/3 h-1/2 w-1/2 rounded-full blur-3xl"
        style={{ background: hexToRgba('#22D3EE', 0.25) }}
      />
    </>
  )
}

export default function AuroraMeshCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#0f0f1a] text-white">
      <Watermark data={data} />
      <AuroraBackground accent={data.accentColor} secondary={data.secondaryColor} />

      <div className="relative flex min-h-0 flex-1 flex-col p-5">
        <div
          className="rounded-2xl border border-white/10 p-5 backdrop-blur-xl"
          style={{ background: hexToRgba('#ffffff', 0.06) }}
        >
          <p className="font-medium uppercase tracking-[0.3em] text-white/50" style={t.label}>
            {data.eyebrow || 'Aurora Series'}
          </p>
          <h2 className="mt-2 font-bold leading-tight" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.2 }}>
            <HighlightText text={data.title || '**Gradient** Stories'} data={{ ...data, highlightStyle: 'gradient' }} />
          </h2>
          <p className="mt-2 text-white/65" style={t.body}>
            <HighlightText text={data.description || data.subtitle || 'Mesh gradients and glass cards for premium social content.'} data={data} />
          </p>
        </div>

        <div className="mt-3 grid flex-1 grid-cols-2 gap-3">
          {[
            { label: data.metric1Label || 'Views', value: data.metric1Value || '48K', color: data.accentColor },
            { label: data.metric2Label || 'Engage', value: data.metric2Value || '12%', color: data.secondaryColor },
            { label: data.metric3Label || 'Reach', value: data.metric3Value || '2.1M', color: '#22D3EE' },
            { label: data.metric4Label || 'Score', value: data.metric4Value || 'A+', color: '#F472B6' },
          ].map((m) => (
            <div
              key={m.label}
              className="flex flex-col justify-center rounded-2xl border border-white/10 p-3 backdrop-blur-md"
              style={{ background: hexToRgba(m.color, 0.12) }}
            >
              <p className="font-bold" style={{ ...t.metric, color: m.color }}>{m.value}</p>
              <p className="text-white/45" style={t.label}>{m.label}</p>
            </div>
          ))}
        </div>

        {data.highlights.filter(Boolean).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.highlights.filter(Boolean).slice(0, 4).map((h, i) => (
              <span
                key={i}
                className="rounded-full px-3 py-1 backdrop-blur-sm"
                style={{ background: hexToRgba(data.accentColor, 0.2), ...t.label }}
              >
                {h}
              </span>
            ))}
          </div>
        )}

        {data.ctaText && (
          <span
            className="mt-3 block rounded-xl py-3.5 text-center font-bold"
            style={{ background: `linear-gradient(135deg, ${data.accentColor}, ${data.secondaryColor})` }}
          >
            <HighlightText text={data.ctaText} data={data} />
          </span>
        )}
      </div>

      <CreativeFooter data={data} />
    </div>
  )
}

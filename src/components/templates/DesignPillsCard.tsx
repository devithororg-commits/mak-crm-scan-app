import { ArrowRight } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

export default function DesignPillsCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const line1 = data.subtitle || 'Every design'
  const line2 = data.comparisonLabel || 'should do'
  const accent = data.title || '**something**'
  const pills = data.highlights.filter(Boolean).length > 0
    ? data.highlights.filter(Boolean).slice(0, 4)
    : ['Help people understand faster.', 'Build trust quicker.', 'Guide attention better.']
  const author = data.personName || data.authorName || 'Your Name'
  const role = data.personRole || data.badge || 'Designer'

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#F9F9F9] text-slate-900"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
        backgroundPosition: '0 0',
      }}
    >
      <Watermark data={data} />
      <div
        className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-slate-200/40 blur-3xl"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-slate-200/30 blur-3xl"
      />

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-10 py-12 text-center">
        <p
          className="italic leading-tight text-slate-900"
          style={{ ...t.title, fontFamily: "'Playfair Display', Georgia, serif", fontSize: (t.title.fontSize as number) * 1.1 }}
        >
          {line1}
        </p>
        <p
          className="italic leading-tight text-slate-900"
          style={{ ...t.subtitle, fontFamily: "'Playfair Display', Georgia, serif", fontSize: (t.subtitle.fontSize as number) * 1.05 }}
        >
          {line2}
        </p>
        <p className="mt-1 font-extrabold leading-none" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.5, color: data.accentColor }}>
          <HighlightText text={accent} data={data} />
        </p>

        <div className="mt-10 w-full max-w-md space-y-3">
          {pills.map((pill, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200">
                <ArrowRight className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
              </span>
              <span className="text-left text-sm text-slate-800" style={t.body}>
                <HighlightText text={pill} data={data} />
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-slate-500" style={t.body}>
          <span className="font-bold text-slate-900">{author}</span>
          {' '}{role}
        </p>
      </div>
      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

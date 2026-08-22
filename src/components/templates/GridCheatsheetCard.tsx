import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

const FOREST = '#1B4332'
const TEAL = '#2D6A4F'

function DotGrid({ rows, cols, className = '' }: { rows: number; cols: number; className?: string }) {
  return (
    <div
      className={`grid gap-1.5 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, width: cols * 14 }}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: TEAL }} />
      ))}
    </div>
  )
}

export default function GridCheatsheetCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const brand = data.eyebrow || "Instagram's"
  const sheetTitle = data.badge || 'New Grid Cheatsheet'
  const intro = data.subtitle || 'Introducing'
  const headline = data.title || 'The New **Grid**'
  const explainer = data.description || 'Aka the 3:4 grid, but that may sound complicated...'
  const cta = data.status || data.comparisonLabel || "Let's break it down..."
  const author = data.authorName || data.personName || 'Your Name'
  const date = data.publishedDate || '2025 January'

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl text-slate-800"
      style={{
        backgroundColor: '#FAFAFA',
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }}
    >
      <Watermark data={data} />

      {/* Header */}
      <div className="flex shrink-0 items-start justify-between px-10 pt-10">
        <div>
          <p className="font-bold leading-tight" style={{ ...t.label, color: FOREST, fontSize: 13 }}>
            {brand}
          </p>
          <p className="mt-0.5" style={{ ...t.label, color: '#9CA3AF', fontSize: 12 }}>
            {sheetTitle}
          </p>
        </div>
      </div>

      {/* Center content */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-10 text-center">
        <DotGrid rows={2} cols={3} className="mb-8 opacity-90" />

        <p className="font-bold" style={{ ...t.subtitle, color: FOREST, fontSize: (t.subtitle.fontSize as number) * 1.1 }}>
          {intro}
        </p>

        <h2
          className="mt-2 max-w-md font-extrabold leading-[1.05] tracking-tight"
          style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.35, color: FOREST }}
        >
          <HighlightText text={headline} data={data} />
        </h2>

        <p className="mt-5 max-w-sm text-slate-400" style={{ ...t.body, lineHeight: 1.6 }}>
          <HighlightText text={explainer} data={data} />
        </p>

        <p className="mt-6 font-semibold" style={{ ...t.subtitle, color: FOREST }}>
          <HighlightText text={cta} data={data} />
        </p>

        <DotGrid rows={3} cols={4} className="mt-8 opacity-90" />
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-end justify-between px-10 pb-10">
        <div className="text-left">
          <p className="text-slate-400" style={t.label}>Created by</p>
          <p className="font-bold" style={{ ...t.subtitle, color: FOREST }}>{author}</p>
          <p className="mt-1 text-slate-400" style={t.label}>{date}</p>
        </div>
        <svg className="h-8 w-6 text-slate-300" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 3h14a2 2 0 012 2v22l-9-5-9 5V5a2 2 0 012-2z" />
        </svg>
      </div>

      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

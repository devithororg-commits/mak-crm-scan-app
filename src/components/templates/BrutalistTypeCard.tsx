import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

export default function BrutalistTypeCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const accent = data.accentColor

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-none bg-[#f5f0e8] text-black">
      <Watermark data={data} />

      <div className="flex items-stretch border-b-4 border-black">
        <div className="flex flex-1 items-center bg-black px-4 py-2 text-white" style={t.label}>
          {data.eyebrow || data.companyName || 'STUDIO'}
        </div>
        <div className="flex items-center border-l-4 border-black px-4 py-2 font-bold" style={{ ...t.label, color: accent }}>
          {data.badge || data.publishedDate || '2026'}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between p-5">
        <h2
          className="font-black uppercase leading-[0.85] tracking-tighter"
          style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.55, wordBreak: 'break-word' }}
        >
          <HighlightText text={data.title || '**BOLD** IDEAS'} data={{ ...data, highlightStyle: 'background' }} />
        </h2>

        <div className="my-4 h-1 w-full bg-black" />

        <p className="max-w-sm font-medium leading-snug" style={{ ...t.body, fontSize: (t.body.fontSize as number) * 1.1 }}>
          <HighlightText text={data.description || data.subtitle || 'Raw typography. Zero decoration. Maximum impact.'} data={data} />
        </p>

        {data.highlights.filter(Boolean).length > 0 && (
          <div className="mt-4 space-y-1">
            {data.highlights.filter(Boolean).slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-center gap-2 border-l-4 border-black pl-3 font-bold uppercase" style={t.label}>
                {h}
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-4">
          {data.ctaText ? (
            <span className="bg-black px-6 py-3 font-black uppercase tracking-wider text-white" style={t.label}>
              <HighlightText text={data.ctaText} data={data} />
            </span>
          ) : (
            <span />
          )}
          <div className="grid grid-cols-2 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-3 w-3 border-2 border-black" style={{ background: i % 2 === 0 ? accent : 'transparent' }} />
            ))}
          </div>
        </div>
      </div>

      <CreativeFooter data={data} />
    </div>
  )
}

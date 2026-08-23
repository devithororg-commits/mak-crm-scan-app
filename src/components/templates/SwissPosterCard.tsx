import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { Headline } from './templateShared'

export default function SwissPosterCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-none bg-[#E8E4DE] text-black">
      <Watermark data={data} />
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_3fr]">
        <div className="flex flex-col justify-between border-r-2 border-black p-4">
          <p className="origin-left -rotate-90 whitespace-nowrap font-bold uppercase tracking-[0.4em]" style={{ ...t.label, writingMode: 'vertical-rl' as const }}>
            {data.companyName || data.eyebrow || 'DESIGN'}
          </p>
          <p className="font-bold" style={{ ...t.metric, color: data.accentColor }}>{data.badge || '2026'}</p>
        </div>
        <div className="flex flex-col justify-center p-6">
          <Headline data={data} t={t} scale={1.4} className="font-black uppercase leading-[0.9] tracking-tighter" />
          <div className="my-4 h-1 w-16 bg-black" />
          <p className="max-w-sm leading-snug" style={{ ...t.body, fontSize: (t.body.fontSize as number) * 1.05 }}>
            <HighlightText text={data.description || data.subtitle || 'Form follows function. Grid follows truth.'} data={data} />
          </p>
          {data.ctaText && (
            <p className="mt-6 font-bold uppercase tracking-widest" style={{ ...t.label, color: data.accentColor }}>
              <HighlightText text={data.ctaText} data={data} />
            </p>
          )}
        </div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

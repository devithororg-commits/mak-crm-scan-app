import { FileText } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, Headline, SectionLabel } from './templateShared'

export default function WhitepaperProCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-stone-50 text-slate-900">
      <Watermark data={data} />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-2/5 flex-col items-center justify-center p-4" style={{ background: data.accentColor }}>
          <FileText className="h-12 w-12 text-white/80" />
          <p className="mt-3 text-center font-bold uppercase tracking-widest text-white/70" style={t.label}>Whitepaper</p>
          <p className="mt-1 text-center font-extrabold text-white" style={t.subtitle}>{data.badge || '2026 Edition'}</p>
        </div>
        <div className="flex w-3/5 flex-col p-5">
          <SectionLabel data={data} t={t} text={data.eyebrow || 'Research Report'} />
          <Headline data={data} t={t} scale={0.95} />
          <p className="mt-3 flex-1 text-slate-600" style={t.body}><HighlightText text={data.description || 'A comprehensive guide to market trends, data insights, and actionable strategies.'} data={data} /></p>
          <div className="space-y-1 border-t border-slate-200 pt-3 text-slate-500" style={t.label}>
            <p>{data.metric1Value || '48 pages'} · {data.metric2Value || '12 charts'}</p>
            <p>{data.companyName || 'Research Team'}</p>
          </div>
          <div className="mt-3"><CtaButton data={data} t={t} style={{ background: data.accentColor, color: '#fff' }} /></div>
        </div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

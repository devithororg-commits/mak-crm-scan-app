import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'
import { CtaButton, Headline, HighlightsList, SectionLabel } from './templateShared'

export default function LinkedinProCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#f3f2ef] text-slate-900">
      <Watermark data={data} />
      <div className="h-2" style={{ background: '#0A66C2' }} />
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          <CreativeLogo data={data} placement="avatar" fallback={<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A66C2] font-bold text-white">in</div>} />
          <div>
            <p className="font-bold" style={t.subtitle}>{data.personName || data.companyName || 'Your Name'}</p>
            <p className="text-slate-500" style={t.label}>{data.personRole || data.industry || 'Industry Leader'}</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionLabel data={data} t={t} text={data.eyebrow || 'Thought Leadership'} />
          <Headline data={data} t={t} scale={1.05} />
          <p className="mt-3 text-slate-600" style={t.body}><HighlightText text={data.description || 'Three insights that changed how we think about growth in 2026.'} data={data} /></p>
          <HighlightsList data={data} t={t} icon="→" />
        </div>
        <div className="mt-4 flex gap-4 text-slate-500" style={t.label}>
          <span>👍 {data.metric1Value || '248'}</span>
          <span>💬 {data.metric2Value || '42'}</span>
          <span>↗ {data.metric3Value || '18'}</span>
        </div>
        <div className="mt-auto pt-4"><CtaButton data={data} t={t} style={{ background: '#0A66C2', color: '#fff' }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

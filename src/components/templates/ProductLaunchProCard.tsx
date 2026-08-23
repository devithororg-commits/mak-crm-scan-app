import { Rocket } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, GlowOrb, Headline, MetricGrid, SectionLabel } from './templateShared'

export default function ProductLaunchProCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-slate-950 text-white">
      <Watermark data={data} />
      <GlowOrb color={data.accentColor} className="-left-16 -top-16 h-48 w-48" />
      <GlowOrb color={data.secondaryColor} className="-bottom-10 -right-10 h-40 w-40" />
      <div className="relative flex min-h-0 flex-1 flex-col p-6">
        <div className="flex items-center justify-between">
          <Rocket className="h-7 w-7" style={{ color: data.accentColor }} />
          <span className="rounded-full px-3 py-1 font-bold uppercase" style={{ ...t.label, background: hexToRgba(data.accentColor, 0.2), color: data.accentColor }}>{data.badge || 'Launch Day'}</span>
        </div>
        <SectionLabel data={data} t={t} text={data.eyebrow || 'Introducing'} />
        <Headline data={data} t={t} scale={1.25} className="mt-2" />
        <p className="mt-3 text-slate-400" style={t.body}><HighlightText text={data.description || 'The next generation product built for speed, scale, and simplicity.'} data={data} /></p>
        <MetricGrid data={data} t={t} items={[
          { label: data.metric1Label || 'Speed', value: data.metric1Value || '3x Faster' },
          { label: data.metric2Label || 'Users', value: data.metric2Value || '50K+' },
          { label: data.metric3Label || 'Rating', value: data.metric3Value || '4.9★' },
        ]} />
        <div className="mt-4"><CtaButton data={data} t={t} style={{ background: `linear-gradient(135deg, ${data.accentColor}, ${data.secondaryColor})` }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

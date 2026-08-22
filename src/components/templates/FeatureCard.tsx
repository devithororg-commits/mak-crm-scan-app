import { Network } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'
import HighlightsList from './HighlightsList'

export default function FeatureCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const isBg = data.showCreativeImage && data.imagePosition === 'background'

  const header = (
    <div className="mb-6 flex shrink-0 items-center justify-between">
      <CreativeLogo
        data={data}
        placement="header"
        withContainer
        fallback={<Network className="text-white/80" style={{ width: '50%', height: '50%' }} />}
      />
      {data.badge && (
        <span className="shrink-0 rounded-full border border-white/30 px-4 py-1" style={t.subtitle}>{data.badge}</span>
      )}
    </div>
  )

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl text-white"
      style={!isBg ? { background: `linear-gradient(135deg, ${data.accentColor}, ${data.secondaryColor})` } : undefined}
    >
      <Watermark data={data} />
      <div className="flex min-h-0 flex-1 flex-col justify-center px-10 py-10">
        <TemplateLayout data={data} header={header}>
          {data.eyebrow && <p className="mb-2 shrink-0 font-medium text-white/70" style={t.label}>{data.eyebrow}</p>}
          <h2 className="mb-4 shrink-0 font-bold leading-tight" style={t.title}>{data.title}</h2>
          <p className="shrink-0 leading-relaxed text-white/80" style={t.body}>{data.description || data.subtitle}</p>
          <div className="mt-6 min-h-0 flex-1">
            <HighlightsList data={data} light />
          </div>
          {data.ctaText && (
            <div className="mt-8 shrink-0">
              <span className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-slate-900" style={t.subtitle}>
                {data.ctaText}
              </span>
            </div>
          )}
        </TemplateLayout>
      </div>
      {!isBg && (
        <div className="h-12 bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,rgba(0,0,0,0.06)_4px,rgba(0,0,0,0.06)_5px)]" />
      )}
      <CreativeFooter data={data} />
    </div>
  )
}

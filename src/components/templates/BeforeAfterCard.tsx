import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function BeforeAfterCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const beforeImg = data.imageGallery[0] || ''
  const afterImg = data.imageUrl || data.imageGallery[1] || ''
  const beforeLabel = data.comparisonLabel || 'Before'
  const afterLabel = data.subtitle || 'After'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-slate-900 text-white">
      <Watermark data={data} />

      <div className="flex items-center justify-between px-8 py-5">
        <CreativeLogo
          data={data}
          placement="header"
          fallback={
            <div className="flex items-center justify-center rounded-lg bg-white/10 font-bold" style={{ width: data.headerLogoSize, height: data.headerLogoSize }}>
              {(data.companyName || 'M')[0]}
            </div>
          }
        />
        <span className="rounded-full bg-white/10 px-3 py-1 font-bold uppercase tracking-wider text-amber-300" style={t.label}>
          <HighlightText text={data.badge || 'Transformation'} data={data} />
        </span>
      </div>

      <h2 className="px-8 font-bold leading-tight" style={t.title}>
        <HighlightText text={data.propertyTitle || data.title || 'Stunning Renovation'} data={data} />
      </h2>
      <p className="mt-1 px-8 text-white/50" style={t.subtitle}>{data.propertyAddress}</p>

      <div className="relative mx-8 mt-5 flex min-h-0 flex-1 gap-1 overflow-hidden rounded-2xl">
        <div className="relative flex-1 overflow-hidden">
          {beforeImg ? (
            <img src={beforeImg} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-700">
              <span className="text-white/30" style={t.label}>Upload Before</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
            <span className="font-bold uppercase tracking-wider text-white/80" style={t.label}>{beforeLabel}</span>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-400 font-bold text-slate-900 shadow-lg" style={t.label}>
          VS
        </div>

        <div className="relative flex-1 overflow-hidden">
          {afterImg ? (
            <img src={afterImg} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-600">
              <span className="text-white/30" style={t.label}>Upload After</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
            <span className="font-bold uppercase tracking-wider text-amber-300" style={t.label}>{afterLabel}</span>
          </div>
        </div>
      </div>

      <div className="px-8 py-5">
        <p className="text-white/70" style={t.body}><HighlightText text={data.description} data={data} /></p>
        {data.ctaText && (
          <span className="mt-4 inline-block rounded-xl bg-amber-400 px-6 py-3 font-bold text-slate-900" style={t.subtitle}>
            <HighlightText text={data.ctaText} data={data} />
          </span>
        )}
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

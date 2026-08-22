import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function JustListedCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />
      <div className="absolute left-0 right-0 top-0 z-20 bg-emerald-600 px-8 py-3 text-center font-bold uppercase tracking-widest text-white" style={t.label}>
        Just Listed
      </div>
      <div className="flex min-h-0 flex-1 flex-col pt-14">
        <TemplateLayout
          data={data}
          header={
            <div className="flex shrink-0 items-center justify-between px-8 pt-4">
              <CreativeLogo data={data} placement="header" fallback={
                <div className="flex items-center justify-center rounded-lg bg-emerald-600 font-bold text-white" style={{ width: data.headerLogoSize, height: data.headerLogoSize }}>
                  {(data.companyName || 'M')[0]}
                </div>
              } />
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700" style={t.label}>{data.propertyPrice}</span>
            </div>
          }
        >
          <div className="flex min-h-0 flex-1 flex-col px-8 pb-4">
            <h2 className="font-bold leading-tight" style={t.title}><HighlightText text={data.propertyTitle || data.title} data={data} /></h2>
            <p className="mt-2 text-slate-500" style={t.subtitle}>{data.propertyAddress}</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Beds', value: data.propertyBeds },
                { label: 'Baths', value: data.propertyBaths },
                { label: 'Sqft', value: data.propertySqft },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-emerald-50 p-3 text-center">
                  <p className="font-bold text-emerald-700" style={t.metric}>{m.value}</p>
                  <p className="text-slate-400" style={t.label}>{m.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-slate-500" style={t.body}><HighlightText text={data.description} data={data} /></p>
            {data.reraNumber && (
              <p className="mt-3 text-slate-400" style={t.label}>RERA: {data.reraNumber}</p>
            )}
            {data.ctaText && (
              <div className="mt-6">
                <span className="inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white" style={t.subtitle}><HighlightText text={data.ctaText} data={data} /></span>
              </div>
            )}
          </div>
        </TemplateLayout>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

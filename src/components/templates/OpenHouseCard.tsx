import { Calendar, MapPin } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'

export default function OpenHouseCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />
      <div className="flex min-h-0 flex-1 flex-col">
        <TemplateLayout
          data={{ ...data, imagePosition: data.showCreativeImage ? data.imagePosition : 'cover', imageCoverHeight: data.imageCoverHeight || 200 }}
        >
          <div className="flex min-h-0 flex-1 flex-col p-8">
            <div className="mb-4 flex items-center justify-between">
              <CreativeLogo data={data} placement="badge" fallback={
                <div className="flex items-center justify-center rounded-full bg-violet-600 font-bold text-white" style={{ width: data.badgeLogoSize, height: data.badgeLogoSize }}>
                  {(data.companyName || 'M')[0]}
                </div>
              } />
              <span className="rounded-full bg-violet-100 px-4 py-1.5 font-bold text-violet-700" style={t.label}>OPEN HOUSE</span>
            </div>
            <h2 className="font-bold leading-tight" style={t.title}>{data.propertyTitle || data.title}</h2>
            <div className="mt-3 flex items-center gap-2 text-slate-500" style={t.subtitle}>
              <MapPin className="h-4 w-4 shrink-0" /> {data.propertyAddress}
            </div>
            <div className="mt-2 flex items-center gap-2 text-violet-600" style={t.subtitle}>
              <Calendar className="h-4 w-4 shrink-0" /> {data.badge || data.publishedDate || 'This Weekend'}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                <p className="font-bold text-violet-700" style={t.metric}>{data.propertyPrice}</p>
                <p className="text-slate-400" style={t.label}>Asking Price</p>
              </div>
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                <p className="font-bold text-violet-700" style={t.metric}>{data.propertyBeds} BHK</p>
                <p className="text-slate-400" style={t.label}>{data.propertySqft} sqft</p>
              </div>
            </div>
            <p className="mt-4 flex-1 text-slate-500" style={t.body}>{data.description}</p>
            {data.ctaText && (
              <span className="mt-4 inline-block self-start rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white" style={t.subtitle}>{data.ctaText}</span>
            )}
          </div>
        </TemplateLayout>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

import { Calendar, Clock, MapPin, Navigation } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function SiteVisitCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const visitDate = data.publishedDate || data.badge || 'Saturday, 28 Dec 2025'
  const visitTime = data.status || '10:00 AM – 6:00 PM'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />

      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-5 text-white">
        <div className="flex items-center justify-between">
          <CreativeLogo
            data={data}
            placement="header"
            fallback={
              <div
                className="flex items-center justify-center rounded-lg bg-white/20 font-bold text-white"
                style={{ width: data.headerLogoSize, height: data.headerLogoSize }}
              >
                {(data.companyName || 'M')[0]}
              </div>
            }
          />
          <span className="rounded-full bg-white/20 px-3 py-1 font-bold backdrop-blur-sm" style={t.label}>
            SITE VISIT
          </span>
        </div>
        <h2 className="mt-4 font-bold leading-tight" style={t.title}>
          <HighlightText text={data.title || "You're Invited!"} data={data} />
        </h2>
        <p className="mt-1 text-teal-100" style={t.subtitle}>
          <HighlightText text={data.subtitle || 'Experience the property in person'} data={data} />
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <TemplateLayout data={data}>
          <div className="flex min-h-0 flex-1 flex-col px-8 py-5">
            <h3 className="font-bold text-slate-800" style={{ ...t.subtitle, fontSize: (t.subtitle.fontSize as number) * 1.1 }}>
              <HighlightText text={data.propertyTitle || data.title} data={data} />
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50 p-4">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="font-semibold text-slate-800" style={t.body}>{visitDate}</p>
                  <p className="text-slate-500" style={t.label}>Visit Date</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50 p-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="font-semibold text-slate-800" style={t.body}>{visitTime}</p>
                  <p className="text-slate-500" style={t.label}>Timing</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="font-semibold text-slate-800" style={t.body}>{data.propertyAddress}</p>
                  <p className="text-slate-500" style={t.label}>Location</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: 'Price', value: data.propertyPrice },
                { label: 'Beds', value: data.propertyBeds },
                { label: 'Sqft', value: data.propertySqft },
              ].filter((m) => m.value).map((m) => (
                <div key={m.label} className="rounded-lg bg-slate-50 p-2 text-center">
                  <p className="font-bold text-teal-700" style={t.metric}>{m.value}</p>
                  <p className="text-slate-400" style={t.label}>{m.label}</p>
                </div>
              ))}
            </div>

            {data.description && (
              <p className="mt-4 text-slate-500" style={t.body}><HighlightText text={data.description} data={data} /></p>
            )}

            {data.ctaText && (
              <div className="mt-auto pt-5">
                <span className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3.5 font-semibold text-white shadow-lg shadow-teal-500/25" style={t.subtitle}>
                  <Navigation className="h-4 w-4" />
                  <HighlightText text={data.ctaText} data={data} />
                </span>
              </div>
            )}
          </div>
        </TemplateLayout>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

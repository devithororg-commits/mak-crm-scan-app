import { Calendar, MapPin, Rocket } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function ProjectLaunchCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const countdown = data.badge || '7'
  const launchDate = data.publishedDate || 'January 2026'
  const progress = data.progressPercent || 75

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />

      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 px-8 py-6 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 right-12 h-20 w-20 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between">
          <CreativeLogo
            data={data}
            placement="header"
            fallback={
              <div className="flex items-center justify-center rounded-lg bg-white/20 font-bold" style={{ width: data.headerLogoSize, height: data.headerLogoSize }}>
                {(data.companyName || 'M')[0]}
              </div>
            }
          />
          <Rocket className="h-6 w-6 text-amber-200" />
        </div>

        <p className="relative mt-4 font-medium uppercase tracking-widest text-orange-100" style={t.label}>
          <HighlightText text={data.eyebrow || 'Coming Soon'} data={data} />
        </p>
        <h2 className="relative mt-1 font-bold leading-tight" style={t.title}>
          <HighlightText text={data.propertyTitle || data.title || 'MAK Heights'} data={data} />
        </h2>
      </div>

      <div className="flex items-center justify-center gap-4 bg-slate-900 py-6 text-white">
        <div className="text-center">
          <p className="font-extrabold leading-none text-orange-400" style={{ fontSize: 48 }}>{countdown}</p>
          <p className="mt-1 uppercase tracking-widest text-white/50" style={t.label}>Days Left</p>
        </div>
        <div className="h-12 w-px bg-white/20" />
        <div>
          <div className="flex items-center gap-2 text-white/80" style={t.body}>
            <Calendar className="h-4 w-4 text-orange-400" />
            {launchDate}
          </div>
          <div className="mt-1 flex items-center gap-2 text-white/60" style={t.body}>
            <MapPin className="h-4 w-4 text-orange-400" />
            {data.propertyAddress || data.location}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <TemplateLayout data={{ ...data, imageCoverHeight: data.imageCoverHeight || 160 }}>
          <div className="flex min-h-0 flex-1 flex-col px-8 py-5">
            <div className="mb-4">
              <div className="mb-1 flex justify-between">
                <span className="text-slate-500" style={t.label}>Construction Progress</span>
                <span className="font-bold text-orange-600" style={t.label}>{progress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Starting', value: data.propertyPrice || '₹65 Lakh*' },
                { label: 'Type', value: data.propertyType || '2 & 3 BHK' },
                { label: 'Area', value: data.propertySqft ? `${data.propertySqft} sqft` : 'Premium' },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-orange-50 p-2.5 text-center">
                  <p className="font-bold text-orange-700" style={t.metric}>{m.value}</p>
                  <p className="text-slate-400" style={t.label}>{m.label}</p>
                </div>
              ))}
            </div>

            {data.highlights.filter(Boolean).length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {data.highlights.filter(Boolean).slice(0, 4).map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-600" style={t.body}>
                    <span className="text-orange-500">★</span> {h}
                  </li>
                ))}
              </ul>
            )}

            {data.ctaText && (
              <div className="mt-auto pt-5">
                <span className="block rounded-xl bg-gradient-to-r from-orange-500 to-red-500 py-3.5 text-center font-bold text-white shadow-lg shadow-orange-500/30" style={t.subtitle}>
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

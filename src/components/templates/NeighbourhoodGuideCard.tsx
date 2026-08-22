import { GraduationCap, Hospital, ShoppingBag, Train } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'

const AMENITY_ICONS = [GraduationCap, Hospital, Train, ShoppingBag]

export default function NeighbourhoodGuideCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const amenities = data.highlights.filter(Boolean).slice(0, 4)
  const metrics = [
    { label: data.metric1Label || 'Schools', value: data.metric1Value || '5 nearby' },
    { label: data.metric2Label || 'Hospitals', value: data.metric2Value || '3 within 2km' },
    { label: data.metric3Label || 'Metro', value: data.metric3Value || '800m away' },
    { label: data.metric4Label || 'Malls', value: data.metric4Value || '2 nearby' },
  ]

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />

      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-5 text-white">
        <div className="flex items-center justify-between">
          <CreativeLogo
            data={data}
            placement="header"
            fallback={
              <div className="flex items-center justify-center rounded-lg bg-white/20 font-bold" style={{ width: data.headerLogoSize, height: data.headerLogoSize }}>
                {(data.companyName || 'M')[0]}
              </div>
            }
          />
          <span className="rounded-full bg-white/20 px-3 py-1 font-semibold backdrop-blur-sm" style={t.label}>
            Area Guide
          </span>
        </div>
        <h2 className="mt-3 font-bold leading-tight" style={t.title}>
          {data.title || data.location || 'Gachibowli'}
        </h2>
        <p className="mt-1 text-emerald-100" style={t.subtitle}>
          {data.subtitle || data.propertyAddress || 'Neighbourhood Highlights'}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <TemplateLayout data={{ ...data, imagePosition: data.showCreativeImage ? 'cover' : 'cover', imageCoverHeight: 140 }}>
          <div className="flex min-h-0 flex-1 flex-col px-8 py-5">
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((m, i) => {
                const Icon = AMENITY_ICONS[i] ?? ShoppingBag
                return (
                  <div key={m.label} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800" style={t.body}>{m.value}</p>
                      <p className="text-slate-400" style={t.label}>{m.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {amenities.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 font-semibold uppercase tracking-wider text-slate-400" style={t.label}>Nearby</p>
                <ul className="space-y-2">
                  {amenities.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600" style={t.body}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.description && (
              <p className="mt-4 text-slate-500" style={t.body}>{data.description}</p>
            )}

            {data.ctaText && (
              <div className="mt-auto pt-5">
                <span className="inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white" style={t.subtitle}>
                  {data.ctaText}
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

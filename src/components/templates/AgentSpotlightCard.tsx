import { Mail, Phone, Star } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function AgentSpotlightCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const stats = [
    { label: data.metric1Label || 'Deals Closed', value: data.metric1Value || '120+' },
    { label: data.metric2Label || 'Experience', value: data.metric2Value || '12 Yrs' },
    { label: data.metric3Label || 'Rating', value: data.metric3Value || '4.9★' },
  ]

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />
      <div className="absolute left-0 right-0 top-0 z-10 h-32 bg-gradient-to-br from-indigo-600 to-violet-600" />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col items-center px-8 pt-8">
          <div className="relative z-10">
            {data.showCreativeImage && data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt=""
                className="rounded-full border-4 border-white object-cover shadow-xl"
                style={{ width: data.avatarLogoSize + 20, height: data.avatarLogoSize + 20 }}
              />
            ) : (
              <CreativeLogo
                data={{ ...data, avatarLogoSize: data.avatarLogoSize + 20, avatarLogoRadius: 999 }}
                placement="avatar"
                fallback={
                  <div
                    className="flex items-center justify-center rounded-full border-4 border-white bg-indigo-100 font-bold text-indigo-600 shadow-xl"
                    style={{ width: data.avatarLogoSize + 20, height: data.avatarLogoSize + 20, fontSize: 28 }}
                  >
                    {(data.personName || data.companyName || 'A')[0]}
                  </div>
                }
              />
            )}
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 shadow-md">
              <Star className="h-4 w-4 fill-white text-white" />
            </div>
          </div>

          <h2 className="mt-4 text-center font-bold" style={t.title}>
            <HighlightText text={data.personName || data.title || 'Your Name'} data={data} />
          </h2>
          <p className="mt-1 text-center font-medium text-indigo-600" style={t.subtitle}>
            {data.personRole || data.subtitle || 'Senior Property Consultant'}
          </p>
          <p className="mt-1 text-center text-slate-400" style={t.label}>
            {data.companyName} · {data.location || 'Your City'}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 px-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center shadow-sm">
              <p className="font-bold text-indigo-600" style={t.metric}>{s.value}</p>
              <p className="text-slate-400" style={t.label}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex-1 px-8 py-5">
          <p className="text-center leading-relaxed text-slate-600" style={t.body}>
            <HighlightText text={data.description || 'Helping families find their perfect home with trust, transparency, and local expertise.'} data={data} />
          </p>

          {data.highlights.filter(Boolean).length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {data.highlights.filter(Boolean).slice(0, 4).map((tag, i) => (
                <span key={i} className="rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-700" style={t.label}>
                  <HighlightText text={tag} data={data} />
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mx-8 mb-4 flex flex-col gap-2 rounded-2xl bg-slate-50 p-4">
          {data.phone && (
            <div className="flex items-center gap-2 text-slate-600" style={t.body}>
              <Phone className="h-4 w-4 text-indigo-500" /> {data.phone}
            </div>
          )}
          {data.email && (
            <div className="flex items-center gap-2 text-slate-600" style={t.body}>
              <Mail className="h-4 w-4 text-indigo-500" /> {data.email}
            </div>
          )}
        </div>

        {data.ctaText && (
          <div className="px-8 pb-4">
            <span className="block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-center font-semibold text-white shadow-lg shadow-indigo-500/25" style={t.subtitle}>
              <HighlightText text={data.ctaText} data={data} />
            </span>
          </div>
        )}
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

import { Users, MapPin, Award } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function TeamShowcaseCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const stats = [
    { icon: Users, label: 'Team Members', value: data.metric1Value || '50+' },
    { icon: Award, label: 'Years Experience', value: data.metric2Value || '15+' },
    { icon: null, label: 'Projects Delivered', value: data.metric3Value || '200+' },
  ]

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-xl">
      <Watermark data={data} />

      <TemplateLayout data={data}>
        <div className="flex min-h-0 flex-1 flex-col p-10">
          <CreativeLogo data={data} placement="header" />

          <p className="font-semibold uppercase tracking-widest text-indigo-600" style={t.label}>
            <HighlightText text={data.eyebrow || data.companyName || 'Our Team'} data={data} />
          </p>
          <h2 className="mt-2 font-bold leading-tight" style={t.title}>
            <HighlightText text={data.title || 'Meet Our Expert Team'} data={data} />
          </h2>

          {data.description && (
            <p className="mt-3 text-slate-600" style={t.body}>
              <HighlightText text={data.description} data={data} />
            </p>
          )}

          <div className="mt-8 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                {s.icon && <s.icon className="mx-auto mb-2 h-5 w-5 text-indigo-500" />}
                <p className="font-bold text-slate-900" style={t.metric}>{s.value}</p>
                <p className="mt-1 text-slate-400" style={t.label}>{s.label}</p>
              </div>
            ))}
          </div>

          {data.location && (
            <p className="mt-6 flex items-center gap-2 text-slate-500" style={t.body}>
              <MapPin className="h-4 w-4 shrink-0 text-indigo-400" />
              <HighlightText text={data.location} data={data} />
            </p>
          )}

          {data.ctaText && (
            <span className="mt-8 inline-block self-start rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white" style={t.subtitle}>
              <HighlightText text={data.ctaText} data={data} />
            </span>
          )}
        </div>
      </TemplateLayout>

      <CreativeFooter data={data} />
    </div>
  )
}

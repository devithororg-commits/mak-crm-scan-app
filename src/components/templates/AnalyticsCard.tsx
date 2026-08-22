import { TrendingUp } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import DynamicChart from '../charts/DynamicChart'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'
import HighlightsList from './HighlightsList'

export default function AnalyticsCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const metrics = [
    { label: data.metric1Label, value: data.metric1Value },
    { label: data.metric2Label, value: data.metric2Value },
    { label: data.metric3Label, value: data.metric3Value },
    { label: data.metric4Label, value: data.metric4Value },
    { label: data.metric5Label, value: data.metric5Value },
  ].filter((m) => m.value)

  const header = (
    <div className="mb-1 flex shrink-0 items-center justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <CreativeLogo
          data={data}
          placement="header"
          fallback={
            <div
              className="flex h-full w-full items-center justify-center rounded-lg text-white"
              style={{ background: data.accentColor }}
            >
              <TrendingUp style={{ width: '50%', height: '50%' }} />
            </div>
          }
        />
        <div className="min-w-0">
          <p className="font-semibold uppercase tracking-wider text-slate-400" style={t.label}>
            {data.eyebrow || data.industry || 'Analytics'}
          </p>
          <h2 className="font-bold leading-tight" style={t.title}>{data.title}</h2>
        </div>
      </div>
      {data.badge && (
        <span
          className="shrink-0 rounded-full px-3 py-1 font-semibold text-white"
          style={{ ...t.label, background: data.accentColor }}
        >
          {data.badge}
        </span>
      )}
    </div>
  )

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />
      <div className="flex min-h-0 flex-1 flex-col p-8 pb-4">
        <TemplateLayout data={data} header={header}>
          <p className="mt-2 shrink-0 text-slate-500" style={t.subtitle}>{data.subtitle}</p>

          {data.changePercent && (
            <div className="mt-3 inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
              <span className="font-bold text-emerald-600" style={t.subtitle}>{data.changePercent}</span>
              <span className="text-emerald-500" style={t.label}>{data.comparisonLabel || 'vs previous'}</span>
              {data.previousValue && (
                <span className="text-slate-400" style={t.label}>from {data.previousValue}</span>
              )}
            </div>
          )}

          {data.chartType !== 'none' && (
            <div className="my-5 shrink-0 rounded-2xl bg-slate-50 p-3">
              <DynamicChart type={data.chartType} data={data.chartData} accent={data.accentColor} height={170} />
            </div>
          )}

          <div className="grid shrink-0 grid-cols-3 gap-3">
            {metrics.slice(0, 3).map((m) => (
              <div key={m.label} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="font-bold" style={{ ...t.metric, color: data.accentColor }}>{m.value}</p>
                <p className="text-slate-400" style={t.label}>{m.label}</p>
              </div>
            ))}
          </div>

          {metrics.length > 3 && (
            <div className="mt-3 grid shrink-0 grid-cols-2 gap-3">
              {metrics.slice(3).map((m) => (
                <div key={m.label} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                  <span className="text-slate-400" style={t.label}>{m.label}</span>
                  <span className="font-bold" style={t.subtitle}>{m.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 min-h-0 flex-1">
            <HighlightsList data={data} />
          </div>
        </TemplateLayout>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

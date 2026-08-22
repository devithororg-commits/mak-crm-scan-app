import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function ProgressCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const pct = Math.min(100, Math.max(0, data.progressPercent))

  const header = (
    <div className="flex shrink-0 items-start gap-4">
      <CreativeLogo
        data={data}
        placement="hero"
        fallback={
          <div
            className="flex items-center justify-center bg-rose-100"
            style={{
              width: data.heroLogoSize,
              height: data.heroLogoSize,
              borderRadius: data.heroLogoRadius >= 999 ? '50%' : data.heroLogoRadius,
              fontSize: data.heroLogoSize * 0.4,
            }}
          >
            🎯
          </div>
        }
      />
      <div className="min-w-0 flex-1">
        <p className="text-slate-400" style={t.label}>goal</p>
        <h2 className="font-bold" style={t.title}><HighlightText text={data.title} data={data} /></h2>
        <p className="font-semibold text-rose-500" style={t.metric}>{data.targetValue}</p>
      </div>
      {data.badge && (
        <span className="shrink-0 rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-500" style={t.label}><HighlightText text={data.badge} data={data} /></span>
      )}
    </div>
  )

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-xl">
      <Watermark data={data} />
      <div className="min-h-0 p-8 pb-4">
        <TemplateLayout data={data} header={header}>
          <div />
        </TemplateLayout>
      </div>

      <div className="flex flex-1 flex-col bg-gradient-to-br from-rose-500 to-rose-900 px-8 py-8 text-white">
        <p className="mb-6 text-center font-semibold uppercase tracking-widest text-rose-200" style={t.label}>Progress</p>

        <div className="relative mb-2">
          <div className="h-2 rounded-full bg-rose-800/50">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-rose-300 to-orange-300 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pct}%` }}
          >
            <div className="flex flex-col items-center">
              <span className="mb-1 font-bold" style={t.subtitle}>{pct}%</span>
              <div className="h-4 w-4 rounded-full border-2 border-white bg-rose-300" />
            </div>
          </div>
        </div>

        <div className="mb-8 flex justify-between" style={t.subtitle}>
          <span className="font-semibold">{data.currentValue}</span>
          <span className="text-rose-200">remaining</span>
        </div>

        <p className="text-center text-rose-100" style={t.body}><HighlightText text={data.subtitle} data={data} /></p>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

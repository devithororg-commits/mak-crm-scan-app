import { Heart } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import DynamicChart from '../charts/DynamicChart'
import CreativeFooter from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function StatsDashboard({ data }: { data: CreativeData }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-slate-50 text-slate-900">
      <div className="flex-1 p-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {data.headerShowLogo ? (
              <CreativeLogo
                data={data}
                placement="header"
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <Heart className="text-rose-500" style={{ width: '60%', height: '60%' }} fill="#f43f5e" />
                  </div>
                }
              />
            ) : (
              <Heart className="h-5 w-5 text-rose-500" fill="#f43f5e" />
            )}
            <div>
              <h2 className="font-bold"><HighlightText text={data.title} data={data} /></h2>
              <p className="text-xs text-slate-400"><HighlightText text={data.subtitle} data={data} /></p>
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs shadow-sm"><HighlightText text={data.badge || 'Daily'} data={data} /></span>
        </div>

        <div className="mb-4 flex gap-8">
          <div>
            <p className="text-3xl font-bold">{data.metric1Value}</p>
            <p className="text-xs text-slate-400">{data.metric1Label}</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-600">{data.metric2Value}</p>
            <p className="text-xs text-slate-400">{data.metric2Label}</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <DynamicChart type={data.chartType} data={data.chartData} accent="#F43F5E" height={160} />
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm text-slate-600"><HighlightText text={data.description} data={data} /></p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: data.metric1Label, value: data.metric1Value },
              { label: data.metric2Label, value: data.metric2Value },
              { label: data.metric3Label, value: data.metric3Value },
              { label: 'Change', value: data.badge },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-bold">{m.value}</p>
                <p className="text-xs text-slate-400">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

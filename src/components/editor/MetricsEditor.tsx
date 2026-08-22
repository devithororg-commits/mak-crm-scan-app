import { Plus, Trash2 } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { CHART_TYPES } from '../../data/config'
import type { ChartType } from '../../types/creative'
import { AppIcon } from '../icons'
import { Field, Section, inputClass } from './FormUI'

const METRICS = [
  { labelKey: 'metric1Label' as const, valueKey: 'metric1Value' as const },
  { labelKey: 'metric2Label' as const, valueKey: 'metric2Value' as const },
  { labelKey: 'metric3Label' as const, valueKey: 'metric3Value' as const },
  { labelKey: 'metric4Label' as const, valueKey: 'metric4Value' as const },
  { labelKey: 'metric5Label' as const, valueKey: 'metric5Value' as const },
]

export default function MetricsEditor() {
  const { data, update } = useCreative()

  const updateChartPoint = (index: number, field: 'label' | 'value', val: string) => {
    const next = [...data.chartData]
    if (field === 'value') {
      next[index] = { ...next[index], value: Number(val) || 0 }
    } else {
      next[index] = { ...next[index], label: val }
    }
    update('chartData', next)
  }

  return (
    <>
      <Section title="KPI Metrics" desc="5 key numbers displayed on your creative">
        <div className="grid grid-cols-2 gap-2">
          {METRICS.map((m, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <input
                type="text"
                value={data[m.valueKey]}
                onChange={(e) => update(m.valueKey, e.target.value)}
                placeholder="Value"
                className="w-full border-0 bg-transparent text-sm font-bold text-slate-900 outline-none"
              />
              <input
                type="text"
                value={data[m.labelKey]}
                onChange={(e) => update(m.labelKey, e.target.value)}
                placeholder="Label"
                className="w-full border-0 bg-transparent text-[10px] text-slate-400 outline-none"
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Comparison">
        <div className="grid grid-cols-3 gap-2">
          <Field label="Change %">
            <input type="text" value={data.changePercent} onChange={(e) => update('changePercent', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Previous">
            <input type="text" value={data.previousValue} onChange={(e) => update('previousValue', e.target.value)} className={inputClass} />
          </Field>
          <Field label="vs Label">
            <input type="text" value={data.comparisonLabel} onChange={(e) => update('comparisonLabel', e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Progress Tracker">
        <div className="grid grid-cols-3 gap-2">
          <Field label="Progress %">
            <input
              type="number"
              min={0}
              max={100}
              value={data.progressPercent}
              onChange={(e) => update('progressPercent', Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Current">
            <input type="text" value={data.currentValue} onChange={(e) => update('currentValue', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Target">
            <input type="text" value={data.targetValue} onChange={(e) => update('targetValue', e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Chart Visualization">
        <div className="flex flex-wrap gap-1.5">
          {CHART_TYPES.map((ct) => (
            <button
              key={ct.id}
              type="button"
              onClick={() => update('chartType', ct.id as ChartType)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
                data.chartType === ct.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <AppIcon name={ct.icon} size={14} className={data.chartType === ct.id ? 'text-white' : 'text-slate-500'} />
              {ct.label}
            </button>
          ))}
        </div>
      </Section>

      {data.chartType !== 'none' && (
        <Section title="Chart Data Points">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={() => update('chartData', [...data.chartData, { label: 'New', value: 100 }])}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-3 w-3" /> Add point
            </button>
          </div>
          <div className="max-h-52 space-y-1.5 overflow-y-auto">
            {data.chartData.map((point, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={point.label}
                  onChange={(e) => updateChartPoint(i, 'label', e.target.value)}
                  className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-900 outline-none"
                />
                <input
                  type="number"
                  value={point.value}
                  onChange={(e) => updateChartPoint(i, 'value', e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-900 outline-none"
                />
                <button
                  type="button"
                  onClick={() => update('chartData', data.chartData.filter((_, j) => j !== i))}
                  className="rounded p-1 text-slate-500 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  )
}

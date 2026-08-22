import type { ChartDataPoint, CreativeData } from '../types/creative'

export interface CsvImportResult {
  chartData: ChartDataPoint[]
  metrics: Partial<Pick<CreativeData, 'metric1Label' | 'metric1Value' | 'metric2Label' | 'metric2Value' | 'metric3Label' | 'metric3Value' | 'metric4Label' | 'metric4Value' | 'metric5Label' | 'metric5Value'>>
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

export function parseCsv(text: string): CsvImportResult {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one data row')

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase())
  const labelIdx = headers.findIndex((h) => ['label', 'month', 'name', 'period', 'date'].includes(h))
  const valueIdx = headers.findIndex((h) => ['value', 'amount', 'count', 'revenue', 'sales', 'total'].includes(h))

  const chartData: ChartDataPoint[] = []
  const metricKeys = ['metric1', 'metric2', 'metric3', 'metric4', 'metric5'] as const
  const metrics: CsvImportResult['metrics'] = {}

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    if (labelIdx >= 0 && valueIdx >= 0) {
      const val = Number(cols[valueIdx]?.replace(/[^0-9.-]/g, ''))
      if (!Number.isNaN(val)) {
        chartData.push({ label: cols[labelIdx] || `Item ${i}`, value: val })
      }
    }

    headers.forEach((h, idx) => {
      const mk = metricKeys.find((k) => h.includes(k.replace('metric', 'metric ')) || h === k)
      if (mk && cols[idx]) {
        const num = mk.replace('metric', '')
        const labelKey = `metric${num}Label` as keyof typeof metrics
        const valueKey = `metric${num}Value` as keyof typeof metrics
        if (!metrics[labelKey]) metrics[labelKey] = h
        metrics[valueKey] = cols[idx]
      }
    })

    if (i <= 5 && labelIdx < 0) {
      const mk = metricKeys[i - 1]
      if (mk && cols[0] && cols[1]) {
        metrics[`${mk}Label` as keyof typeof metrics] = cols[0]
        metrics[`${mk}Value` as keyof typeof metrics] = cols[1]
      }
    }
  }

  return { chartData, metrics }
}

import { useRef, useState } from 'react'
import { FileSpreadsheet, Upload } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { parseCsv } from '../../utils/csvImport'
import { Section } from './FormUI'

const SAMPLE = `label,value
Jan,420
Feb,380
Mar,510
Apr,470
May,620`

export default function CsvImporter() {
  const { setData } = useCreative()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const applyCsv = (text: string) => {
    try {
      const result = parseCsv(text)
      setData((prev) => ({
        ...prev,
        chartData: result.chartData.length > 0 ? result.chartData : prev.chartData,
        ...result.metrics,
      }))
      setSuccess(`Imported ${result.chartData.length} chart points`)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse failed')
      setSuccess('')
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => applyCsv(reader.result as string)
    reader.readAsText(file)
  }

  return (
    <Section title="CSV Data Import" desc="Upload spreadsheet to auto-fill charts & metrics">
      <input ref={inputRef} type="file" accept=".csv,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-6 transition hover:border-indigo-500/40"
      >
        <Upload className="h-6 w-6 text-slate-500" />
        <span className="text-xs text-slate-700">Upload CSV file</span>
        <span className="text-[10px] text-slate-500">Columns: label, value (or month, revenue)</span>
      </button>

      <button
        type="button"
        onClick={() => applyCsv(SAMPLE)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-[10px] text-slate-400 hover:text-slate-900"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" /> Load sample data
      </button>

      {error && <p className="mt-2 text-[10px] text-red-600">{error}</p>}
      {success && <p className="mt-2 text-[10px] text-emerald-600">{success}</p>}
    </Section>
  )
}

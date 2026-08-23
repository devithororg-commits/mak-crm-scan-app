import { useRef, useState } from 'react'
import { FileSpreadsheet, Loader2, Package, Upload } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { useExportBridge } from '../../context/ExportBridge'
import { listingRowToCreativePatch, parseListingCsv, type ListingRow } from '../../utils/listingBulkImport'
import { exportBulkListingCampaign } from '../../utils/campaignExport'
import { Section } from './FormUI'
import { useToast } from '../ux/ToastProvider'

const SAMPLE = `title,price,beds,baths,sqft,address,type,rera
Luxury 3BHK Gachibowli,₹1.25 Cr,3,3,1850,Gachibowli Hyderabad,Apartment,P02400001288
Premium Villa Jubilee Hills,₹2.80 Cr,4,4,3200,Jubilee Hills, Villa,P02400001999`

export default function ListingBulkImporter() {
  const { data } = useCreative()
  const { toast } = useToast()
  const { setExportProgress } = useExportBridge()
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ListingRow[]>([])
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  const parseFile = (text: string) => {
    try {
      const parsed = parseListingCsv(text)
      setRows(parsed)
      setError('')
      toast(`Parsed ${parsed.length} listings`, 'success')
    } catch (e) {
      setRows([])
      setError(e instanceof Error ? e.message : 'Parse failed')
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => parseFile(reader.result as string)
    reader.readAsText(file)
  }

  const exportBulk = async () => {
    if (rows.length === 0) return
    setExporting(true)
    setExportProgress({ message: 'Starting bulk export…', percent: 0 })
    try {
      await exportBulkListingCampaign(
        rows.map((r) => listingRowToCreativePatch(r)),
        data,
        'png',
        (msg, percent) => setExportProgress({ message: msg, percent }),
      )
      toast(`Bulk campaign ZIP ready — ${rows.length} listings`, 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Bulk export failed', 'error')
    } finally {
      setExporting(false)
      setTimeout(() => setExportProgress(null), 1500)
    }
  }

  return (
    <Section title="Bulk Listing CSV" desc={`Import up to 20 listings → ${rows.length || 'N'}× campaign packs in one ZIP`}>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          e.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 py-5 transition hover:border-emerald-400"
      >
        <Upload className="h-6 w-6 text-emerald-600" />
        <span className="text-xs font-semibold text-slate-800">Upload listings CSV</span>
        <span className="px-4 text-center text-[10px] text-slate-500">
          Columns: title, price, beds, baths, sqft, address, type, rera
        </span>
      </button>

      <button
        type="button"
        onClick={() => parseFile(SAMPLE)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-[10px] text-slate-500 hover:text-slate-900"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" /> Load sample (2 listings)
      </button>

      {rows.length > 0 && (
        <div className="mt-3 max-h-32 overflow-y-auto rounded-xl border border-slate-100 bg-white">
          {rows.slice(0, 8).map((r, i) => (
            <div key={i} className="border-b border-slate-50 px-3 py-2 text-[10px] last:border-0">
              <span className="font-bold text-slate-800">{r.propertyTitle}</span>
              <span className="text-slate-400"> · {r.propertyPrice}</span>
            </div>
          ))}
          {rows.length > 8 && (
            <p className="px-3 py-1 text-[9px] text-slate-400">+{rows.length - 8} more…</p>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-[10px] text-red-600">{error}</p>}

      <button
        type="button"
        disabled={rows.length === 0 || exporting}
        onClick={exportBulk}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-[11px] font-bold text-white shadow-md disabled:opacity-50"
      >
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
        Export Bulk Campaign ZIP ({rows.length || 0} listings)
      </button>

      {rows.length > 0 && (
        <p className="mt-2 text-center text-[9px] text-slate-500">
          Each listing → 3 posters × 4 sizes + captions · may take several minutes
        </p>
      )}
    </Section>
  )
}

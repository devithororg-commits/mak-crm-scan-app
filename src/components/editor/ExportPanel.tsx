import { useState } from 'react'
import {
  AlertCircle, Archive, Download, FileText, Film, Image, Layers, Loader2, Package, MessageSquare, FlaskConical, X,
} from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { useExportBridge } from '../../context/ExportBridge'
import { TEMPLATES } from '../../data/config'
import ExportSettings from './ExportSettings'
import CaptionGenerator from './CaptionGenerator'
import ContentLibrary from './ContentLibrary'
import MultiFormatPreview from './MultiFormatPreview'
import DesignScorePanel from './DesignScorePanel'

interface Props {
  onClose: () => void
}

function loadExportFormat(): 'png' | 'jpeg' {
  try {
    const saved = sessionStorage.getItem('exportFormat')
    return saved === 'jpeg' ? 'jpeg' : 'png'
  } catch {
    return 'png'
  }
}

export default function ExportPanel({ onClose }: Props) {
  const { data } = useCreative()
  const { handlers, exporting, exportError, savedMsg } = useExportBridge()
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>(loadExportFormat)

  const setFormat = (format: 'png' | 'jpeg') => {
    setExportFormat(format)
    try { sessionStorage.setItem('exportFormat', format) } catch { /* ignore */ }
  }
  const templateName = TEMPLATES.find((t) => t.id === data.templateId)?.name ?? 'Creative'
  const hasListing = Boolean(data.propertyTitle.trim() || data.propertyPrice.trim())

  const busy = !!exporting

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">Export Studio</p>
          <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900">Download Creative</h2>
          <p className="text-[12px] text-slate-500">{templateName} · Smart naming + multi-format sync enabled</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-[12px] border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          title="Back to Edit"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-5 py-3 text-[11px] text-slate-600">
        <span className="font-semibold text-indigo-700">1. Configure</span>
        <span className="mx-2 text-slate-300">→</span>
        <span className="font-semibold text-indigo-700">2. Preview</span> (live on the right)
        <span className="mx-2 text-slate-300">→</span>
        <span className={`font-semibold ${savedMsg ? 'text-emerald-600' : 'text-slate-500'}`}>3. Download</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <MultiFormatPreview />
          <DesignScorePanel />

          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4">
            <p className="text-[11px] font-bold text-emerald-900">Campaign Export</p>
            <p className="mt-1 text-[10px] leading-relaxed text-emerald-800/90">
              Full listing campaign: 3 posters × 4 sizes + IG/LinkedIn/WhatsApp captions in one ZIP.
            </p>
            <button
              type="button"
              onClick={() => handlers?.exportCampaignPack(exportFormat)}
              disabled={busy || !handlers || !hasListing}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-[11px] font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
            >
              {exporting === 'campaign' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
              Download Listing Campaign Pack
            </button>
            {!hasListing && (
              <p className="mt-2 text-center text-[10px] text-amber-700">Add property title or price in Text panel first</p>
            )}
          </div>

          <div className="rounded-2xl border border-violet-200/80 bg-violet-50/40 p-4">
            <p className="text-[11px] font-bold text-violet-900">A/B Visual Test</p>
            <p className="mt-1 text-[10px] text-violet-800/90">Export variants A, B, C — each with all 4 aspect ratios.</p>
            <button
              type="button"
              onClick={() => handlers?.exportAbVariants(exportFormat)}
              disabled={busy || !handlers}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-300 bg-white py-2.5 text-[11px] font-bold text-violet-800 transition hover:bg-violet-50 disabled:opacity-50"
            >
              {exporting === 'ab' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
              Download A/B/C Variant ZIP
            </button>
          </div>

          <ExportSettings />
          <CaptionGenerator />
          <ContentLibrary />
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        {exportError && (
          <div className="mb-3 flex items-center gap-2 rounded-[12px] border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] font-medium text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />{exportError}
          </div>
        )}
        {savedMsg && (
          <div className="mb-3 flex items-center gap-2 rounded-[12px] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12px] font-medium text-emerald-700">
            <Archive className="h-4 w-4 shrink-0" />{savedMsg}
          </div>
        )}

        {exporting === 'campaign' && (
          <div className="mb-3 rounded-[12px] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] text-emerald-800">
            Building campaign pack… 12 posters + captions. This may take 30–60 seconds.
          </div>
        )}

        <div className="mb-3 rounded-[12px] border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 text-[11px] text-indigo-800">
          Files use smart names: <strong>brand-template-aspect-date.png</strong>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-0.5">
            <button
              type="button"
              onClick={() => setFormat('png')}
              className={`rounded-[10px] px-3.5 py-1.5 text-[12px] font-bold transition ${exportFormat === 'png' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
            >
              PNG
            </button>
            <button
              type="button"
              onClick={() => setFormat('jpeg')}
              className={`rounded-[10px] px-3.5 py-1.5 text-[12px] font-bold transition ${exportFormat === 'jpeg' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
            >
              JPEG
            </button>
          </div>

          <button
            type="button"
            onClick={() => handlers?.download(exportFormat)}
            disabled={busy || !handlers}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-105 disabled:opacity-50"
          >
            {exporting === 'single' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handlers?.magicResize(exportFormat)}
            disabled={busy || !handlers}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-indigo-200 bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700 disabled:opacity-50"
          >
            {exporting === 'resize' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Layers className="h-3.5 w-3.5" />}
            All Sizes
          </button>
          <button
            type="button"
            onClick={() => handlers?.exportCaptionPack()}
            disabled={busy || !handlers}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-teal-200 bg-teal-50 px-3 py-2 text-[11px] font-bold text-teal-800 disabled:opacity-50"
          >
            {exporting === 'captions' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
            Captions ZIP
          </button>
          <button
            type="button"
            onClick={() => handlers?.saveLibrary()}
            disabled={busy || !handlers}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 disabled:opacity-50"
          >
            <Archive className="h-3.5 w-3.5" /> Save
          </button>
          <button
            type="button"
            onClick={() => handlers?.exportVideo()}
            disabled={busy || !handlers}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-violet-200 bg-violet-50 px-3 py-2 text-[11px] font-bold text-violet-700 disabled:opacity-50"
          >
            {exporting === 'video' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
            Reel
          </button>
          {data.carouselEnabled && (
            <>
              <button
                type="button"
                onClick={() => handlers?.exportCarousel('pdf')}
                disabled={busy || !handlers}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 disabled:opacity-50"
              >
                <FileText className="h-3.5 w-3.5" /> PDF
              </button>
              <button
                type="button"
                onClick={() => handlers?.exportCarousel('zip')}
                disabled={busy || !handlers}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 disabled:opacity-50"
              >
                <Image className="h-3.5 w-3.5" /> ZIP
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

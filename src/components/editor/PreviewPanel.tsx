import { useCallback, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Download, Grid3X3, Image, Loader2, Minus, Plus, AlertCircle,
  Archive, Layers, FileText, Film,
} from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { ASPECT_RATIOS } from '../../data/config'
import type { AspectRatio } from '../../types/creative'
import { exportAllSizes, exportCarouselPdf, exportCarouselZip, renderElement } from '../../utils/batchExport'
import { saveToLibrary } from '../../utils/contentLibrary'
import { aspectDimensions, exportCreative, fontFamilyCss, previewScale } from '../../utils/exportImage'
import { prepareElementForExport } from '../../utils/imageEmbed'
import { overlayQrOnImage } from '../../utils/qrCode'
import { downloadBlob, exportSlideshowVideo } from '../../utils/videoExport'
import TemplateRenderer from '../templates/TemplateRenderer'

function HiddenCanvas({
  data,
  aspectRatio,
  slideIndex,
  containerRef,
}: {
  data: ReturnType<typeof useCreative>['data']
  aspectRatio: AspectRatio
  slideIndex?: number
  containerRef: (el: HTMLDivElement | null) => void
}) {
  const { width, height } = aspectDimensions(aspectRatio)
  return (
    <div
      ref={containerRef}
      style={{ width, height, fontFamily: fontFamilyCss(data.fontFamily) }}
    >
      <TemplateRenderer data={{ ...data, aspectRatio }} slideIndex={slideIndex} />
    </div>
  )
}

export default function PreviewPanel() {
  const { data } = useCreative()
  const exportRef = useRef<HTMLDivElement>(null)
  const batchRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [exporting, setExporting] = useState('')
  const [exportError, setExportError] = useState('')
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png')
  const [savedMsg, setSavedMsg] = useState('')

  const { width, height } = aspectDimensions(data.aspectRatio)
  const baseScale = previewScale(data.aspectRatio, 500)
  const scale = baseScale * zoom
  const platform = ASPECT_RATIOS.find((r) => r.id === data.aspectRatio)
  const previewSlide = data.carouselEnabled ? data.activeCarouselSlide : undefined

  const setBatchRef = useCallback((ratio: AspectRatio) => (el: HTMLDivElement | null) => {
    batchRefs.current[ratio] = el
  }, [])

  const applyQrIfNeeded = async (dataUrl: string) => {
    const qrUrl = data.qrCodeUrl || data.website || data.footerWebsite
    if (data.showQrCode && qrUrl) {
      try {
        return await overlayQrOnImage(dataUrl, qrUrl)
      } catch {
        return dataUrl
      }
    }
    return dataUrl
  }

  const renderSlideToUrl = async (slideIndex: number, aspect: AspectRatio = '4:5') => {
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;left:-9999px;top:0'
    document.body.appendChild(container)
    const root = createRoot(container)
    const inner = document.createElement('div')
    const dims = aspectDimensions(aspect)
    inner.style.width = `${dims.width}px`
    inner.style.height = `${dims.height}px`
    container.appendChild(inner)
    await new Promise<void>((resolve) => {
      root.render(
        <div style={{ width: dims.width, height: dims.height, fontFamily: fontFamilyCss(data.fontFamily) }}>
          <TemplateRenderer
            data={{ ...data, aspectRatio: aspect, carouselEnabled: data.carouselEnabled }}
            slideIndex={slideIndex}
          />
        </div>,
      )
      setTimeout(resolve, 400)
    })
    await prepareElementForExport(inner)
    let url = await renderElement(inner, { ...data, aspectRatio: aspect }, aspect, 'png')
    url = await applyQrIfNeeded(url)
    root.unmount()
    container.remove()
    return url
  }

  const handleDownload = async () => {
    if (!exportRef.current) return
    setExporting('single')
    setExportError('')
    try {
      await exportCreative(exportRef.current, data, exportFormat)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting('')
    }
  }

  const handleMagicResize = async () => {
    setExporting('resize')
    setExportError('')
    try {
      await exportAllSizes(
        (ratio) => {
          const existing = batchRefs.current[ratio]
          if (existing) return existing
          const container = document.createElement('div')
          container.style.cssText = 'position:fixed;left:-9999px;top:0'
          document.body.appendChild(container)
          const root = createRoot(container)
          const ratioDims = aspectDimensions(ratio)
          const inner = document.createElement('div')
          inner.style.width = `${ratioDims.width}px`
          inner.style.height = `${ratioDims.height}px`
          container.appendChild(inner)
          root.render(
            <div style={{ width: ratioDims.width, height: ratioDims.height, fontFamily: fontFamilyCss(data.fontFamily) }}>
              <TemplateRenderer data={{ ...data, aspectRatio: ratio }} />
            </div>,
          )
          batchRefs.current[ratio] = inner
          return inner
        },
        data,
        exportFormat,
      )
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Magic resize failed')
    } finally {
      setExporting('')
    }
  }

  const handleCarouselExport = async (type: 'pdf' | 'zip') => {
    setExporting(type)
    setExportError('')
    try {
      const urls: string[] = []
      for (let i = 0; i < data.carouselSlides.length; i++) {
        urls.push(await renderSlideToUrl(i, '4:5'))
      }
      if (type === 'pdf') await exportCarouselPdf(urls)
      else await exportCarouselZip(urls)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Carousel export failed')
    } finally {
      setExporting('')
    }
  }

  const handleVideoExport = async () => {
    setExporting('video')
    setExportError('')
    try {
      const slideCount = data.carouselEnabled ? data.carouselSlides.length : 1
      const urls: string[] = []
      for (let i = 0; i < slideCount; i++) {
        urls.push(await renderSlideToUrl(i, data.aspectRatio))
      }
      const dims = aspectDimensions(data.aspectRatio)
      const blob = await exportSlideshowVideo(urls, {
        width: dims.width,
        height: dims.height,
        slideDurationMs: 2500,
        transitionMs: 500,
      })
      const slug = (data.title || 'creative').slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
      downloadBlob(blob, `${slug}-reel.webm`)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'Video export failed')
    } finally {
      setExporting('')
    }
  }

  const handleSaveLibrary = async () => {
    if (!exportRef.current) return
    setExporting('save')
    try {
      const thumb = await renderElement(exportRef.current, data, data.aspectRatio, 'png')
      saveToLibrary(data, thumb)
      setSavedMsg('Saved to library!')
      setTimeout(() => setSavedMsg(''), 2000)
    } catch {
      saveToLibrary(data)
      setSavedMsg('Saved to library!')
      setTimeout(() => setSavedMsg(''), 2000)
    } finally {
      setExporting('')
    }
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 checkerboard" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.07)_0%,transparent_55%)]" />

      <div
        aria-hidden
        className="pointer-events-none fixed overflow-hidden"
        style={{ left: 0, top: 0, width, height, opacity: 0, zIndex: -1 }}
      >
        <div ref={exportRef} style={{ width, height, fontFamily: fontFamilyCss(data.fontFamily) }}>
          <TemplateRenderer data={data} slideIndex={previewSlide} />
        </div>
      </div>

      {ASPECT_RATIOS.map((r) => (
        <div
          key={r.id}
          aria-hidden
          className="pointer-events-none fixed overflow-hidden"
          style={{ left: 0, top: 0, opacity: 0, zIndex: -2 }}
        >
          <HiddenCanvas data={data} aspectRatio={r.id} containerRef={setBatchRef(r.id)} />
        </div>
      ))}

      {/* Floating toolbar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3">
        <div className="glass flex items-center gap-3 rounded-[16px] border border-slate-200/60 px-4 py-2.5 shadow-[var(--shadow-md)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-600">
            <Grid3X3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-slate-900">Live Preview</h2>
            <p className="text-[11px] text-slate-500">
              {platform?.w}×{platform?.h}px · {data.exportQuality}× · {data.fontFamily}
              {data.carouselEnabled && ` · ${data.activeCarouselSlide + 1}/${data.carouselSlides.length}`}
            </p>
          </div>
        </div>

        <div className="glass flex items-center gap-1 rounded-[16px] border border-slate-200/60 p-1 shadow-[var(--shadow-md)]">
          <button type="button" onClick={() => setShowGrid(!showGrid)} className={`rounded-[10px] p-2 transition ${showGrid ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>
            <Grid3X3 className="h-4 w-4" />
          </button>
          <div className="mx-0.5 h-5 w-px bg-slate-200" />
          <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="rounded-[10px] p-2 text-slate-500 hover:bg-slate-100"><Minus className="h-4 w-4" /></button>
          <span className="min-w-[48px] text-center text-[12px] font-bold text-slate-700">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="rounded-[10px] p-2 text-slate-500 hover:bg-slate-100"><Plus className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-auto p-6 pb-4">
        <div className="relative animate-fade-in" style={{ width: width * scale, height: height * scale }}>
          {showGrid && (
            <div className="pointer-events-none absolute inset-0 z-10 opacity-40" style={{
              backgroundImage: 'linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }} />
          )}
          <div
            className="overflow-hidden rounded-[20px] shadow-[var(--shadow-lg)] ring-1 ring-slate-200/80"
            style={{ width: width * scale, height: height * scale }}
          >
            <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', fontFamily: fontFamilyCss(data.fontFamily) }}>
              <TemplateRenderer data={data} slideIndex={previewSlide} />
            </div>
          </div>
        </div>
      </div>

      {/* Export dock */}
      <div className="relative z-10 px-6 pb-5">
        <div className="glass rounded-[20px] border border-slate-200/60 p-4 shadow-[var(--shadow-lg)]">
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

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-0.5">
              <button type="button" onClick={() => setExportFormat('png')} className={`rounded-[10px] px-3.5 py-1.5 text-[12px] font-bold transition ${exportFormat === 'png' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>PNG</button>
              <button type="button" onClick={() => setExportFormat('jpeg')} className={`rounded-[10px] px-3.5 py-1.5 text-[12px] font-bold transition ${exportFormat === 'jpeg' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>JPEG</button>
            </div>

            <button type="button" onClick={handleDownload} disabled={!!exporting} className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-105 disabled:opacity-50">
              {exporting === 'single' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download
            </button>
            <button type="button" onClick={handleMagicResize} disabled={!!exporting} className="inline-flex items-center gap-2 rounded-[12px] border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-[12px] font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50">
              {exporting === 'resize' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
              Magic Resize
            </button>
            <button type="button" onClick={handleSaveLibrary} disabled={!!exporting} className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200/80 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50">
              <Archive className="h-4 w-4" /> Save
            </button>
            <button type="button" onClick={handleVideoExport} disabled={!!exporting} className="inline-flex items-center gap-2 rounded-[12px] border border-violet-200 bg-violet-50 px-4 py-2.5 text-[12px] font-bold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50">
              {exporting === 'video' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
              Video Reel
            </button>
            {data.carouselEnabled && (
              <>
                <button type="button" onClick={() => handleCarouselExport('pdf')} disabled={!!exporting} className="inline-flex items-center gap-1.5 rounded-[12px] border border-slate-200/80 bg-white px-3.5 py-2.5 text-[12px] font-semibold text-slate-600 shadow-sm disabled:opacity-50">
                  <FileText className="h-4 w-4" /> PDF
                </button>
                <button type="button" onClick={() => handleCarouselExport('zip')} disabled={!!exporting} className="inline-flex items-center gap-1.5 rounded-[12px] border border-slate-200/80 bg-white px-3.5 py-2.5 text-[12px] font-semibold text-slate-600 shadow-sm disabled:opacity-50">
                  <Image className="h-4 w-4" /> ZIP
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

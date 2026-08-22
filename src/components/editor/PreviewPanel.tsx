import { useCallback, useEffect, useRef, useState } from 'react'

import { createRoot } from 'react-dom/client'

import { Grid3X3, Minus, Plus } from 'lucide-react'

import { useCreative } from '../../store/CreativeContext'

import { useExportBridge } from '../../context/ExportBridge'

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

  containerRef,

}: {

  data: ReturnType<typeof useCreative>['data']

  aspectRatio: AspectRatio

  containerRef: (el: HTMLDivElement | null) => void

}) {

  const { width, height } = aspectDimensions(aspectRatio)

  return (

    <div

      ref={containerRef}

      style={{ width, height, fontFamily: fontFamilyCss(data.fontFamily) }}

    >

      <TemplateRenderer data={{ ...data, aspectRatio }} />

    </div>

  )

}



export default function PreviewPanel() {

  const { data, activeTab } = useCreative()

  const { exportRef, registerHandlers, setExporting, setExportError, setSavedMsg } = useExportBridge()

  const batchRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [zoom, setZoom] = useState(1)

  const [showGrid, setShowGrid] = useState(false)



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



  useEffect(() => {

    registerHandlers({

      download: async (format) => {

        if (!exportRef.current) return

        setExporting('single')

        setExportError('')

        try {

          await exportCreative(exportRef.current, data, format)

        } catch (e) {

          setExportError(e instanceof Error ? e.message : 'Export failed')

        } finally {

          setExporting('')

        }

      },

      magicResize: async (format) => {

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

            format,

          )

        } catch (e) {

          setExportError(e instanceof Error ? e.message : 'Magic resize failed')

        } finally {

          setExporting('')

        }

      },

      saveLibrary: async () => {

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

      },

      exportVideo: async () => {

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

      },

      exportCarousel: async (type) => {

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

      },

    })

  }, [data, exportRef, registerHandlers, setExportError, setExporting, setSavedMsg])



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



      {/* Preview toolbar */}

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

      <div className="relative z-10 flex flex-1 items-center justify-center overflow-auto p-6">

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



      <div className="relative z-10 px-6 pb-4 text-center">

        <p className="text-[11px] font-medium text-slate-400">

          {activeTab === 'templates'

            ? 'Click templates to preview · When ready, press Start Editing'

            : <>Edit on the left · Open <span className="text-indigo-600">Export</span> to download</>}

        </p>

      </div>

    </main>

  )

}



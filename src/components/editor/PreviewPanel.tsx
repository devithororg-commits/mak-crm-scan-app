import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
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
import { exportAbVariantPack, exportCaptionPack as downloadCaptionPack, exportListingCampaignPack } from '../../utils/campaignExport'
import TemplateRenderer from '../templates/TemplateRenderer'
import CanvasToolbar from './CanvasToolbar'
import CompositionGuides from './CompositionGuides'
import FeedThumbnailPreview from './FeedThumbnailPreview'



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
  const { data, activeTab, update, setActiveCarouselSlide } = useCreative()

  const { exportRef, registerHandlers, setExporting, setExportError, setSavedMsg } = useExportBridge()

  const batchRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const dataRef = useRef(data)

  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [showSafeZone, setShowSafeZone] = useState(false)
  const [showThirds, setShowThirds] = useState(false)
  const [showGolden, setShowGolden] = useState(false)
  const [showFeedThumb, setShowFeedThumb] = useState(false)
  const [showGrayscale, setShowGrayscale] = useState(false)



  const { width, height } = aspectDimensions(data.aspectRatio)

  const baseScale = previewScale(data.aspectRatio, 500)

  const scale = baseScale * zoom

  const previewSlide = data.carouselEnabled ? data.activeCarouselSlide : undefined

  useEffect(() => { dataRef.current = data }, [data])

  const setBatchRef = useCallback((ratio: AspectRatio) => (el: HTMLDivElement | null) => {

    batchRefs.current[ratio] = el

  }, [])



  const applyQrIfNeeded = async (dataUrl: string, snapshot = dataRef.current) => {

    const qrUrl = snapshot.qrCodeUrl || snapshot.website || snapshot.footerWebsite

    if (snapshot.showQrCode && qrUrl) {

      try {

        return await overlayQrOnImage(dataUrl, qrUrl)

      } catch {

        return dataUrl

      }

    }

    return dataUrl

  }



  const renderSlideToUrl = async (slideIndex: number, aspect: AspectRatio = '4:5') => {

    const snapshot = dataRef.current

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

        <div style={{ width: dims.width, height: dims.height, fontFamily: fontFamilyCss(snapshot.fontFamily) }}>

          <TemplateRenderer

            data={{ ...snapshot, aspectRatio: aspect, carouselEnabled: snapshot.carouselEnabled }}

            slideIndex={slideIndex}

          />

        </div>,

      )

      setTimeout(resolve, 400)

    })

    await prepareElementForExport(inner)

    let url = await renderElement(inner, { ...snapshot, aspectRatio: aspect }, aspect, 'png')

    url = await applyQrIfNeeded(url, snapshot)

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

          await exportCreative(exportRef.current, dataRef.current, format)

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

                <div style={{ width: ratioDims.width, height: ratioDims.height, fontFamily: fontFamilyCss(dataRef.current.fontFamily) }}>

                  <TemplateRenderer data={{ ...dataRef.current, aspectRatio: ratio }} />

                </div>,

              )

              batchRefs.current[ratio] = inner

              return inner

            },

            dataRef.current,

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

          const snap = dataRef.current
          const thumb = await renderElement(exportRef.current, snap, snap.aspectRatio, 'png')

          saveToLibrary(snap, thumb)

          setSavedMsg('Saved to library!')

          setTimeout(() => setSavedMsg(''), 2000)

        } catch {

          saveToLibrary(dataRef.current)

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

          const snap = dataRef.current
          const slideCount = snap.carouselEnabled ? snap.carouselSlides.length : 1

          const urls: string[] = []

          for (let i = 0; i < slideCount; i++) {

            urls.push(await renderSlideToUrl(i, snap.aspectRatio))

          }

          const dims = aspectDimensions(snap.aspectRatio)

          const blob = await exportSlideshowVideo(urls, {

            width: dims.width,

            height: dims.height,

            slideDurationMs: 2500,

            transitionMs: 500,

          })

          const slug = (snap.title || 'creative').slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

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

          const snap = dataRef.current
          for (let i = 0; i < snap.carouselSlides.length; i++) {

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

      exportCampaignPack: async (format) => {
        setExporting('campaign')
        setExportError('')
        try {
          await exportListingCampaignPack(dataRef.current, format, (msg) => {
            setSavedMsg(msg)
          })
          setSavedMsg('Campaign pack downloaded!')
          setTimeout(() => setSavedMsg(''), 2500)
        } catch (e) {
          setExportError(e instanceof Error ? e.message : 'Campaign export failed')
        } finally {
          setExporting('')
        }
      },

      exportAbVariants: async (format) => {
        setExporting('ab')
        setExportError('')
        try {
          await exportAbVariantPack(dataRef.current, format)
          setSavedMsg('A/B variants downloaded!')
          setTimeout(() => setSavedMsg(''), 2500)
        } catch (e) {
          setExportError(e instanceof Error ? e.message : 'A/B export failed')
        } finally {
          setExporting('')
        }
      },

      exportCaptionPack: async () => {
        setExporting('captions')
        setExportError('')
        try {
          await downloadCaptionPack(dataRef.current)
          setSavedMsg('Caption pack downloaded!')
          setTimeout(() => setSavedMsg(''), 2500)
        } catch (e) {
          setExportError(e instanceof Error ? e.message : 'Caption export failed')
        } finally {
          setExporting('')
        }
      },

    })

  }, [exportRef, registerHandlers, setExportError, setExporting, setSavedMsg])



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



      {/* Canvas area */}
        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 items-center justify-center gap-4 overflow-auto p-3 sm:p-6">
          <div className="relative animate-fade-in" style={{ width: width * scale, height: height * scale }}>
            {showGrid && (
              <div className="pointer-events-none absolute inset-0 z-10 opacity-40" style={{
                backgroundImage: 'linear-gradient(rgba(139,61,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(139,61,255,0.12) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }} />
            )}
            <CompositionGuides
              aspectRatio={data.aspectRatio}
              showSafeZone={showSafeZone}
              showThirds={showThirds}
              showGolden={showGolden}
            />
            <div
              className="overflow-hidden rounded-[20px] shadow-[var(--shadow-lg)] ring-1 ring-slate-200/80"
              style={{ width: width * scale, height: height * scale, filter: showGrayscale ? 'grayscale(1)' : undefined }}
            >
              <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', fontFamily: fontFamilyCss(data.fontFamily) }}>
                <TemplateRenderer data={data} slideIndex={previewSlide} />
              </div>
            </div>
          </div>

          {showFeedThumb && (
            <div className="hidden shrink-0 lg:block">
              <FeedThumbnailPreview />
            </div>
          )}
        </div>

        <CanvasToolbar
          zoom={zoom}
          onZoomChange={setZoom}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showSafeZone={showSafeZone}
          onToggleSafeZone={() => setShowSafeZone(!showSafeZone)}
          showThirds={showThirds}
          onToggleThirds={() => setShowThirds(!showThirds)}
          showGolden={showGolden}
          onToggleGolden={() => setShowGolden(!showGolden)}
          showFeedThumb={showFeedThumb}
          onToggleFeedThumb={() => setShowFeedThumb(!showFeedThumb)}
          showGrayscale={showGrayscale}
          onToggleGrayscale={() => setShowGrayscale(!showGrayscale)}
          aspectRatio={data.aspectRatio}
          onAspectChange={(ar) => update('aspectRatio', ar)}
          carouselEnabled={data.carouselEnabled}
          activeSlide={data.activeCarouselSlide}
          slideCount={data.carouselSlides.length}
          onPrevSlide={() => setActiveCarouselSlide(Math.max(0, data.activeCarouselSlide - 1))}
          onNextSlide={() => setActiveCarouselSlide(Math.min(data.carouselSlides.length - 1, data.activeCarouselSlide + 1))}
          snapToGrid={data.snapToGrid}
          onToggleSnap={() => update('snapToGrid', !data.snapToGrid)}
        />
      </div>

      <div className="relative z-10 px-3 pb-2 text-center sm:px-6">
        <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
          {activeTab === 'templates'
            ? 'Tap a template to preview · Start Editing when ready'
            : <>Left tools: <span className="text-violet-600">Text</span> · <span className="text-violet-600">Uploads</span> · <span className="text-violet-600">Design</span> · Press <kbd className="rounded border border-slate-200 bg-white px-1 text-[9px]">?</kbd> for help</>}
        </p>
      </div>

    </main>

  )

}



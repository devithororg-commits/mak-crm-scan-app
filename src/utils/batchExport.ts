import JSZip from 'jszip'
import { jsPDF } from 'jspdf'
import { toJpeg, toPng } from 'html-to-image'
import { ASPECT_RATIOS } from '../data/config'
import type { AspectRatio, CreativeData } from '../types/creative'
import { getFormatAdaptedData } from './formatSync'
import { fontFamilyCss } from './exportImage'
import { prepareElementForExport } from './imageEmbed'
import { buildExportFilename } from './exportNaming'

async function renderElement(
  element: HTMLElement,
  data: CreativeData,
  aspectRatio: AspectRatio,
  format: 'png' | 'jpeg',
) {
  const adapted = getFormatAdaptedData(data, aspectRatio)
  const ratio = ASPECT_RATIOS.find((r) => r.id === aspectRatio) ?? ASPECT_RATIOS[0]
  const options = {
    pixelRatio: data.exportQuality,
    cacheBust: true,
    width: ratio.w,
    height: ratio.h,
    style: {
      width: `${ratio.w}px`,
      height: `${ratio.h}px`,
      transform: 'none',
      fontFamily: fontFamilyCss(adapted.fontFamily),
    },
  }
  await prepareElementForExport(element)
  return format === 'jpeg'
    ? toJpeg(element, { ...options, quality: 0.95, backgroundColor: '#ffffff' })
    : toPng(element, options)
}

function slug(data: CreativeData) {
  return (data.title || 'creative').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
}

export async function exportAllSizes(
  renderFn: (aspectRatio: AspectRatio) => HTMLElement,
  data: CreativeData,
  format: 'png' | 'jpeg' = 'png',
) {
  const zip = new JSZip()

  for (const ratio of ASPECT_RATIOS) {
    const el = renderFn(ratio.id)
    const adapted = getFormatAdaptedData(data, ratio.id)
    const dataUrl = await renderElement(el, adapted, ratio.id, format)
    const base64 = dataUrl.split(',')[1]
    zip.file(buildExportFilename(data, ratio.id, undefined, format), base64, { base64: true })
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${slug(data)}-all-sizes.zip`
  link.click()
  URL.revokeObjectURL(link.href)
}

export async function exportCarouselPdf(
  slideDataUrls: string[],
  filename = 'carousel.pdf',
) {
  if (slideDataUrls.length === 0) return
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [1080, 1350] })

  slideDataUrls.forEach((url, i) => {
    if (i > 0) pdf.addPage([1080, 1350])
    pdf.addImage(url, 'PNG', 0, 0, 1080, 1350)
  })

  pdf.save(filename)
}

export async function exportCarouselZip(
  slideDataUrls: string[],
  filename = 'carousel-slides.zip',
) {
  const zip = new JSZip()
  slideDataUrls.forEach((url, i) => {
    const base64 = url.split(',')[1]
    zip.file(`slide-${String(i + 1).padStart(2, '0')}.png`, base64, { base64: true })
  })
  const blob = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export { renderElement }

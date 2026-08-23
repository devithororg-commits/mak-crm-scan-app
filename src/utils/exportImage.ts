import { toJpeg, toPng } from 'html-to-image'
import { ASPECT_RATIOS } from '../data/config'
import type { CreativeData } from '../types/creative'
import { prepareElementForExport } from './imageEmbed'
import { overlayQrOnImage } from './qrCode'
import { buildExportFilename } from './exportNaming'

export function aspectDimensions(aspectRatio: CreativeData['aspectRatio']) {
  const ratio = ASPECT_RATIOS.find((r) => r.id === aspectRatio) ?? ASPECT_RATIOS[0]
  return { width: ratio.w, height: ratio.h }
}

export function previewScale(aspectRatio: CreativeData['aspectRatio'], maxWidth = 480) {
  const { width } = aspectDimensions(aspectRatio)
  return Math.min(1, maxWidth / width)
}

export async function exportCreative(
  element: HTMLElement,
  data: CreativeData,
  format: 'png' | 'jpeg' = 'png',
) {
  const ratio = ASPECT_RATIOS.find((r) => r.id === data.aspectRatio) ?? ASPECT_RATIOS[0]
  const filename = buildExportFilename(data, data.aspectRatio, undefined, format)

  const options = {
    pixelRatio: data.exportQuality,
    cacheBust: true,
    width: ratio.w,
    height: ratio.h,
    style: {
      width: `${ratio.w}px`,
      height: `${ratio.h}px`,
      transform: 'none',
      fontFamily: fontFamilyCss(data.fontFamily),
    },
    skipFonts: false,
  }

  await prepareElementForExport(element)

  let dataUrl: string
  try {
    dataUrl =
      format === 'jpeg'
        ? await toJpeg(element, { ...options, quality: 0.95, backgroundColor: '#ffffff' })
        : await toPng(element, options)
  } catch (err) {
    console.error('Export failed:', err)
    throw new Error('Image export failed. Try refreshing the page or re-uploading images.')
  }

  const qrUrl = data.qrCodeUrl || data.website || data.footerWebsite
  if (data.showQrCode && qrUrl) {
    try {
      dataUrl = await overlayQrOnImage(dataUrl, qrUrl)
    } catch {
      // QR overlay failed — export without QR
    }
  }

  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function fontFamilyCss(font: CreativeData['fontFamily'], customName?: string) {
  if (font === 'Custom' && customName) {
    return `"${customName}", sans-serif`
  }
  const map: Record<Exclude<CreativeData['fontFamily'], 'Custom'>, string> = {
    Poppins: '"Poppins", sans-serif',
    Inter: '"Inter", sans-serif',
    'DM Sans': '"DM Sans", sans-serif',
    'Playfair Display': '"Playfair Display", serif',
  }
  if (font === 'Custom') {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('creative-studio-custom-font') : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { name: string }
        if (parsed.name) return `"${parsed.name}", sans-serif`
      } catch { /* ignore */ }
    }
    return '"Poppins", sans-serif'
  }
  return map[font]
}

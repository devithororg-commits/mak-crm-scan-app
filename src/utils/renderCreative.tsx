import { createRoot } from 'react-dom/client'
import TemplateRenderer from '../components/templates/TemplateRenderer'
import type { AspectRatio, CreativeData } from '../types/creative'
import { renderElement } from './batchExport'
import { getFormatAdaptedData } from './formatSync'
import { aspectDimensions, fontFamilyCss } from './exportImage'
import { prepareElementForExport } from './imageEmbed'
import { overlayQrOnImage } from './qrCode'

const RENDER_WAIT_MS = 480

export async function renderCreativeToDataUrl(
  data: CreativeData,
  aspectRatio: AspectRatio,
  format: 'png' | 'jpeg' = 'png',
): Promise<string> {
  const adapted = getFormatAdaptedData(data, aspectRatio)
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;z-index:-9999'
  document.body.appendChild(container)

  const root = createRoot(container)
  const dims = aspectDimensions(aspectRatio)
  const inner = document.createElement('div')
  inner.style.width = `${dims.width}px`
  inner.style.height = `${dims.height}px`
  inner.style.fontFamily = fontFamilyCss(adapted.fontFamily)
  container.appendChild(inner)

  await new Promise<void>((resolve) => {
    root.render(<TemplateRenderer data={adapted} />)
    setTimeout(resolve, RENDER_WAIT_MS)
  })

  await prepareElementForExport(inner)
  let url = await renderElement(inner, adapted, aspectRatio, format)

  const qrUrl = adapted.qrCodeUrl || adapted.website || adapted.footerWebsite
  if (adapted.showQrCode && qrUrl) {
    try {
      url = await overlayQrOnImage(url, qrUrl)
    } catch {
      // export without QR
    }
  }

  root.unmount()
  container.remove()
  return url
}

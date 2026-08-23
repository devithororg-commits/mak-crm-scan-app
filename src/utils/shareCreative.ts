import type { CreativeData, Platform } from '../types/creative'
import { generateCaptions } from './captionGenerator'
import { renderCreativeToDataUrl } from './renderCreative'

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export function buildShareCaption(data: CreativeData, platform: Platform = 'whatsapp'): string {
  const caps = generateCaptions(data, 'professional')
  const c = caps[platform]
  return [c.caption, c.hashtags].filter(Boolean).join('\n\n')
}

export function buildCaptionBundle(data: CreativeData): string {
  const caps = generateCaptions(data, 'professional')
  const platforms: Platform[] = ['instagram', 'linkedin', 'whatsapp', 'facebook', 'twitter']
  return platforms
    .map((p) => `=== ${p.toUpperCase()} ===\n${caps[p].caption}\n\n${caps[p].hashtags}`)
    .join('\n\n')
}

export async function renderPosterBlob(data: CreativeData, format: 'png' | 'jpeg' = 'png'): Promise<Blob> {
  const url = await renderCreativeToDataUrl(data, data.aspectRatio, format)
  return dataUrlToBlob(url)
}

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}

export async function sharePosterNative(data: CreativeData, caption?: string): Promise<'shared' | 'copied'> {
  const text = caption ?? buildShareCaption(data, 'whatsapp')
  const blob = await renderPosterBlob(data, 'png')
  const file = new File([blob], `poster-${data.aspectRatio.replace(':', 'x')}.png`, { type: 'image/png' })

  if (navigator.share) {
    const payload: ShareData = { title: data.title, text, files: [file] }
    if (navigator.canShare?.(payload)) {
      await navigator.share(payload)
      return 'shared'
    }
    await navigator.share({ title: data.title, text })
    return 'shared'
  }

  await copyText(`${text}\n\n(Image saved — attach from your downloads if needed)`)
  return 'copied'
}

export function openWhatsAppShare(caption: string) {
  const url = `https://wa.me/?text=${encodeURIComponent(caption)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export async function shareToWhatsApp(data: CreativeData): Promise<'native' | 'wa-link' | 'copied'> {
  const caption = buildShareCaption(data, 'whatsapp')

  try {
    const blob = await renderPosterBlob(data, 'png')
    const file = new File([blob], 'poster.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file], text: caption })) {
      await navigator.share({ files: [file], text: caption, title: data.title })
      return 'native'
    }
  } catch {
    // fall through
  }

  try {
    await copyText(caption)
  } catch {
    // ignore
  }

  openWhatsAppShare(caption)
  return 'wa-link'
}

export function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

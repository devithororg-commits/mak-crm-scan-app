import type { UploadQuality } from '../types/creative'

export const UPLOAD_QUALITY_CONFIG: Record<UploadQuality, { maxWidth: number; quality: number; label: string }> = {
  standard: { maxWidth: 1600, quality: 0.9, label: 'Standard (1600px)' },
  high: { maxWidth: 2400, quality: 0.95, label: 'High (2400px)' },
  ultra: { maxWidth: 4096, quality: 0.98, label: 'Ultra (4K original)' },
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function sharpen(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  if (amount <= 0) return
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  const copy = new Uint8ClampedArray(data)
  const strength = amount / 100
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let val = 0
        let ki = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c
            val += copy[idx] * kernel[ki++]
          }
        }
        const idx = (y * w + x) * 4 + c
        data[idx] = Math.min(255, Math.max(0, copy[idx] + (val - copy[idx]) * strength))
      }
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

export interface EnhanceOptions {
  brightness?: number
  contrast?: number
  saturation?: number
  sharpness?: number
  autoEnhance?: boolean
}

export async function enhanceImage(
  src: string,
  options: EnhanceOptions = {},
): Promise<string> {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  let brightness = options.brightness ?? 100
  let contrast = options.contrast ?? 100
  let saturation = options.saturation ?? 100
  const sharpness = options.sharpness ?? 0

  if (options.autoEnhance) {
    brightness = Math.min(115, brightness + 5)
    contrast = Math.min(120, contrast + 8)
    saturation = Math.min(115, saturation + 5)
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const bMult = brightness / 100
  const cMult = contrast / 100
  const sMult = saturation / 100

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] * bMult
    let g = data[i + 1] * bMult
    let b = data[i + 2] * bMult

    r = ((r / 255 - 0.5) * cMult + 0.5) * 255
    g = ((g / 255 - 0.5) * cMult + 0.5) * 255
    b = ((b / 255 - 0.5) * cMult + 0.5) * 255

    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    r = gray + (r - gray) * sMult
    g = gray + (g - gray) * sMult
    b = gray + (b - gray) * sMult

    data[i] = Math.min(255, Math.max(0, r))
    data[i + 1] = Math.min(255, Math.max(0, g))
    data[i + 2] = Math.min(255, Math.max(0, b))
  }
  ctx.putImageData(imageData, 0, 0)

  if (sharpness > 0) sharpen(ctx, canvas.width, canvas.height, sharpness)

  return canvas.toDataURL('image/jpeg', 0.95)
}

export async function processImageWithQuality(
  file: File,
  uploadQuality: UploadQuality,
  enhance: EnhanceOptions = {},
): Promise<string> {
  const config = UPLOAD_QUALITY_CONFIG[uploadQuality]
  const { processImageFile } = await import('./imageUpload')
  let dataUrl = await processImageFile(file, config.maxWidth, config.quality)

  if (enhance.autoEnhance || enhance.brightness !== 100 || enhance.contrast !== 100 || enhance.saturation !== 100 || (enhance.sharpness ?? 0) > 0) {
    dataUrl = await enhanceImage(dataUrl, enhance)
  }

  return dataUrl
}

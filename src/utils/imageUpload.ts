const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/heic', 'image/heif']
const MAX_FILE_MB = 15

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
    return 'Only PNG, JPG, WebP, HEIC, or SVG files allowed'
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `File must be under ${MAX_FILE_MB}MB`
  return null
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function processImageFile(file: File, maxWidth = 2400, quality = 0.95): Promise<string> {
  const err = validateImageFile(file)
  if (err) throw new Error(err)

  if (file.type === 'image/svg+xml') {
    return readAsDataUrl(file)
  }

  const dataUrl = await readAsDataUrl(file)
  const img = await loadImage(dataUrl)

  const scale = img.width > maxWidth ? maxWidth / img.width : 1
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)

  return canvas.toDataURL('image/jpeg', quality)
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

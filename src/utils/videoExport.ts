function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export interface SlideshowOptions {
  width: number
  height: number
  fps?: number
  slideDurationMs?: number
  transitionMs?: number
}

export async function exportSlideshowVideo(
  frameDataUrls: string[],
  options: SlideshowOptions,
): Promise<Blob> {
  if (frameDataUrls.length === 0) throw new Error('No frames to export')

  const fps = options.fps ?? 30
  const slideDuration = options.slideDurationMs ?? 2500
  const transition = options.transitionMs ?? 400
  const images = await Promise.all(frameDataUrls.map(loadImage))

  const canvas = document.createElement('canvas')
  canvas.width = options.width
  canvas.height = options.height
  const ctx = canvas.getContext('2d')!

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'

  const stream = canvas.captureStream(fps)
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 })
  const chunks: Blob[] = []

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
    recorder.onerror = () => reject(new Error('Video recording failed'))
    recorder.start()

    let frame = 0
    const totalFrames = images.length * slideDuration + (images.length - 1) * transition
    let elapsed = 0

    const drawFrame = () => {
      const slideIndex = Math.min(
        Math.floor(elapsed / (slideDuration + transition)),
        images.length - 1,
      )
      const slideElapsed = elapsed - slideIndex * (slideDuration + transition)
      const current = images[slideIndex]
      const next = images[Math.min(slideIndex + 1, images.length - 1)]

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (slideElapsed < slideDuration || slideIndex === images.length - 1) {
        drawCover(ctx, current, canvas.width, canvas.height)
      } else {
        const t = Math.min(1, (slideElapsed - slideDuration) / transition)
        drawCover(ctx, current, canvas.width, canvas.height)
        ctx.globalAlpha = t
        drawCover(ctx, next, canvas.width, canvas.height)
        ctx.globalAlpha = 1
      }

      elapsed += 1000 / fps
      frame++

      if (frame < totalFrames / (1000 / fps)) {
        requestAnimationFrame(drawFrame)
      } else {
        setTimeout(() => recorder.stop(), 200)
      }
    }

    drawFrame()
  })
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height)
  const sw = img.width * scale
  const sh = img.height * scale
  const x = (w - sw) / 2
  const y = (h - sh) / 2
  ctx.drawImage(img, x, y, sw, sh)
}

export function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

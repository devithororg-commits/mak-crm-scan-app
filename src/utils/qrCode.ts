import QRCode from 'qrcode'

export async function generateQrDataUrl(url: string, size = 200): Promise<string> {
  if (!url.trim()) throw new Error('Enter a URL for the QR code')
  const normalized = url.startsWith('http') ? url : `https://${url}`
  return QRCode.toDataURL(normalized, {
    width: size,
    margin: 1,
    color: { dark: '#1e293b', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  })
}

export async function overlayQrOnImage(
  baseDataUrl: string,
  qrUrl: string,
  position: 'bottom-right' | 'bottom-left' = 'bottom-right',
  qrSize = 160,
): Promise<string> {
  const qrDataUrl = await generateQrDataUrl(qrUrl, qrSize)

  const load = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

  const [base, qr] = await Promise.all([load(baseDataUrl), load(qrDataUrl)])
  const canvas = document.createElement('canvas')
  canvas.width = base.width
  canvas.height = base.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(base, 0, 0)

  const padding = Math.round(base.width * 0.03)
  const size = Math.round(base.width * 0.12)
  const x = position === 'bottom-right' ? base.width - size - padding : padding
  const y = base.height - size - padding

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.roundRect(x - 8, y - 8, size + 16, size + 16, 12)
  ctx.fill()
  ctx.drawImage(qr, x, y, size, size)

  return canvas.toDataURL('image/png')
}

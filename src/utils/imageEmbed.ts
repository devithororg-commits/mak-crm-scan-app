/** Convert remote image URLs to data URLs so export/preview work without CORS failures. */

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function fetchViaProxy(url: string): Promise<Blob> {
  const targets = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ]

  for (const proxy of targets) {
    try {
      const res = await fetch(proxy)
      if (!res.ok) continue
      const blob = await res.blob()
      if (blob.size > 0) return blob
    } catch {
      // try next proxy
    }
  }

  throw new Error('Could not load image')
}

export async function urlToDataUrl(url: string): Promise<string> {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('data:')) return trimmed

  try {
    const res = await fetch(trimmed, { mode: 'cors', cache: 'no-cache' })
    if (res.ok) {
      const blob = await res.blob()
      if (blob.size > 0) return blobToDataUrl(blob)
    }
  } catch {
    // fall through to proxy
  }

  const blob = await fetchViaProxy(trimmed)
  return blobToDataUrl(blob)
}

export async function embedImagesInElement(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.getAttribute('src') || ''
      if (!src || src.startsWith('data:')) return
      try {
        const dataUrl = await urlToDataUrl(src)
        img.setAttribute('src', dataUrl)
        img.crossOrigin = 'anonymous'
      } catch {
        // keep original src
      }
    }),
  )
}

export async function prepareElementForExport(root: HTMLElement): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined)
  }

  await embedImagesInElement(root)

  const imgs = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          const done = () => resolve()
          img.onload = done
          img.onerror = done
          setTimeout(done, 4000)
        }),
    ),
  )

  // Allow Recharts / layout to settle
  await new Promise((r) => setTimeout(r, 150))
}

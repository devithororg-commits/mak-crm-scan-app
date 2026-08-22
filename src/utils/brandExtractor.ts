import { urlToDataUrl } from './imageEmbed'

export interface ExtractedBrand {
  title: string
  description: string
  logoUrl: string
  accentColor: string
  website: string
}

function normalizeUrl(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http')) return trimmed
  return `https://${trimmed}`
}

function extractMeta(html: string, property: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m?.[1]) return m[1]
  }
  return ''
}

function extractTitle(html: string) {
  const og = extractMeta(html, 'og:title')
  if (og) return og
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return m?.[1]?.trim() || ''
}

function extractThemeColor(html: string) {
  const theme = extractMeta(html, 'theme-color')
  if (theme && theme.startsWith('#')) return theme
  const ms = extractMeta(html, 'msapplication-TileColor')
  if (ms && ms.startsWith('#')) return ms
  return '#4F46E5'
}

function resolveUrl(base: string, path: string) {
  try {
    return new URL(path, base).href
  } catch {
    return path
  }
}

export async function extractBrandFromUrl(input: string): Promise<ExtractedBrand> {
  const url = normalizeUrl(input)
  if (!url) throw new Error('Enter a valid website URL')

  const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&palette=true&logo=true`)
  if (!res.ok) throw new Error('Could not fetch website. Check the URL and try again.')

  const json = await res.json()
  if (json.status === 'error') {
    throw new Error(json.message || 'Could not fetch website. Check the URL and try again.')
  }
  const d = json.data

  if (d) {
    let logoUrl = d.logo?.url || d.image?.url || ''
    if (logoUrl && !logoUrl.startsWith('data:')) {
      try {
        logoUrl = await urlToDataUrl(logoUrl)
      } catch {
        // keep remote URL
      }
    }
    return {
      title: d.title || '',
      description: d.description || '',
      logoUrl,
      accentColor: d.palette?.[0] || '#4F46E5',
      website: url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    }
  }

  const htmlRes = await fetch(url, { mode: 'cors' }).catch(() => null)
  if (!htmlRes?.ok) throw new Error('Website blocked cross-origin fetch. Try uploading logo manually.')

  const html = await htmlRes.text()
  const ogImage = extractMeta(html, 'og:image')

  return {
    title: extractTitle(html),
    description: extractMeta(html, 'og:description') || extractMeta(html, 'description'),
    logoUrl: ogImage ? resolveUrl(url, ogImage) : '',
    accentColor: extractThemeColor(html),
    website: url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  }
}

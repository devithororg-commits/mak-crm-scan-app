const FONT_STORAGE_KEY = 'creative-studio-custom-font'
const ACCEPTED = ['.ttf', '.otf', '.woff', '.woff2']
const MAX_MB = 4

export interface CustomFontRecord {
  name: string
  dataUrl: string
  format: 'truetype' | 'opentype' | 'woff' | 'woff2'
}

function formatFromFile(file: File): CustomFontRecord['format'] {
  const n = file.name.toLowerCase()
  if (n.endsWith('.woff2')) return 'woff2'
  if (n.endsWith('.woff')) return 'woff'
  if (n.endsWith('.otf')) return 'opentype'
  return 'truetype'
}

export function validateFontFile(file: File): string | null {
  const ok = ACCEPTED.some((ext) => file.name.toLowerCase().endsWith(ext))
  if (!ok) return 'Upload TTF, OTF, WOFF, or WOFF2 only'
  if (file.size > MAX_MB * 1024 * 1024) return `Font must be under ${MAX_MB}MB`
  return null
}

export function loadStoredCustomFont(): CustomFontRecord | null {
  try {
    const raw = localStorage.getItem(FONT_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CustomFontRecord) : null
  } catch {
    return null
  }
}

export function saveStoredCustomFont(record: CustomFontRecord | null) {
  if (!record) {
    localStorage.removeItem(FONT_STORAGE_KEY)
    removeFontFace()
    return
  }
  localStorage.setItem(FONT_STORAGE_KEY, JSON.stringify(record))
  injectFontFace(record)
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const STYLE_ID = 'creative-studio-custom-font-face'

export function injectFontFace(record: CustomFontRecord) {
  removeFontFace()
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `@font-face{font-family:"${record.name}";src:url("${record.dataUrl}") format("${record.format}");font-display:swap;}`
  document.head.appendChild(style)
}

export function removeFontFace() {
  document.getElementById(STYLE_ID)?.remove()
}

export function initCustomFontFromStorage() {
  const stored = loadStoredCustomFont()
  if (stored) injectFontFace(stored)
}

export async function processFontFile(file: File): Promise<CustomFontRecord> {
  const err = validateFontFile(file)
  if (err) throw new Error(err)
  const dataUrl = await readFile(file)
  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim()
  const name = baseName.slice(0, 40) || 'Custom Brand Font'
  return { name, dataUrl, format: formatFromFile(file) }
}

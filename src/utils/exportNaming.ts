import type { AspectRatio, CreativeData } from '../types/creative'

function slugPart(value: string, max = 24): string {
  return value
    .slice(0, max)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'creative'
}

export function buildCampaignSlug(data: CreativeData): string {
  const brand = data.companyName || data.personName || 'brand'
  const title = data.propertyTitle || data.title || 'poster'
  return slugPart(`${brand}-${title}`, 40)
}

export function buildExportFilename(
  data: CreativeData,
  aspectRatio: AspectRatio,
  suffix?: string,
  format: 'png' | 'jpeg' = 'png',
): string {
  const brand = slugPart(data.companyName || data.personName || 'brand', 16)
  const template = slugPart(data.templateId, 20)
  const date = new Date().toISOString().slice(0, 10)
  const aspect = aspectRatio.replace(':', 'x')
  const parts = [brand, template, aspect, date]
  if (suffix) parts.push(suffix)
  const ext = format === 'jpeg' ? 'jpg' : 'png'
  return `${parts.filter(Boolean).join('-')}.${ext}`
}

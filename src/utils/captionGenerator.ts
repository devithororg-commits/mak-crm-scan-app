import type { CaptionTone, CreativeData, CaptionVariant, GeneratedCaption, Platform } from '../types/creative'
import { studioCaptionForPlatform } from './studioCaptions'

const HOOKS = [
  'Did you know?',
  'Breaking:',
  "Here's what changed:",
  'The numbers speak:',
  'Big update from',
  'You need to see this:',
  'Mark your calendar:',
  'Just in:',
  'Stop scrolling —',
  'This changes everything:',
  'Hot take:',
  'Real talk:',
]

const HOOKS_SALES = [
  'Limited opportunity:',
  'Don\'t miss out —',
  'Exclusive offer:',
  'Act fast:',
  'Only a few left:',
]

const HOOKS_CASUAL = [
  'Hey! Check this out —',
  'So excited to share:',
  'Quick update:',
  'You\'ll love this:',
]

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length]
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function tonePrefix(tone: CaptionTone) {
  const map: Record<CaptionTone, string> = {
    professional: '',
    casual: 'Hey! ',
    sales: '',
    educational: 'Learn how ',
  }
  return map[tone]
}

function hooksForTone(tone: CaptionTone) {
  if (tone === 'sales') return HOOKS_SALES
  if (tone === 'casual') return HOOKS_CASUAL
  return HOOKS
}

function buildBody(data: CreativeData, tone: CaptionTone) {
  const parts = [data.title, data.subtitle].filter(Boolean)
  if (data.description && tone !== 'sales') parts.push(data.description.slice(0, 120))
  return parts.join(' — ')
}

function platformHashtags(data: CreativeData, platform: Platform): string {
  const tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean)
  const base = [
    data.industry || 'Business',
    data.location || data.state || 'India',
    data.companyName?.replace(/\s+/g, '') || 'Brand',
    data.propertyType?.replace(/\s+/g, '') || '',
    'RealEstate',
  ].filter(Boolean)

  const all = [...new Set([...tags, ...base])].map((t) =>
    t.startsWith('#') ? t : `#${t.replace(/[^a-zA-Z0-9]/g, '')}`,
  ).filter((t) => t.length > 2)

  const limits: Record<Platform, number> = {
    instagram: 20,
    linkedin: 5,
    twitter: 4,
    whatsapp: 0,
    facebook: 8,
    custom: 10,
  }

  return all.slice(0, limits[platform]).join(' ')
}

function platformCaption(data: CreativeData, platform: Platform, tone: CaptionTone, hook: string): string {
  const prefix = tonePrefix(tone)
  const body = buildBody(data, tone)
  const cta = data.ctaText || 'Learn more'
  const contact = [data.phone, data.website].filter(Boolean).join(' · ')

  switch (platform) {
    case 'instagram':
      return `${prefix}${hook} ${body}\n\n${data.highlights.slice(0, 3).map((h) => `✓ ${h}`).join('\n')}\n\n${cta}${contact ? `\n📞 ${contact}` : ''}`
    case 'linkedin':
      return `${prefix}${hook}\n\n${body}\n\n${data.highlights.slice(0, 3).map((h) => `→ ${h}`).join('\n')}\n\n${cta}${data.companyName ? ` | ${data.companyName}` : ''}`
    case 'twitter':
      return `${hook} ${data.title}. ${data.subtitle}`.slice(0, 270)
    case 'whatsapp':
      return `${prefix}*${data.title}*\n${data.subtitle}\n\n${data.description.slice(0, 200)}\n\n${cta}${contact ? `\n${contact}` : ''}`
    case 'facebook':
      return `${prefix}${body}\n\n${data.highlights.slice(0, 3).join('\n')}\n\n${cta}`
    default:
      return `${prefix}${body}\n\n${cta}`
  }
}

export function predictEngagementScore(
  caption: string,
  hashtags: string,
  platform: Platform,
): number {
  let score = 50
  const len = caption.length

  const limits: Record<Platform, [number, number]> = {
    instagram: [100, 2200],
    linkedin: [150, 3000],
    twitter: [50, 280],
    whatsapp: [50, 1000],
    facebook: [80, 500],
    custom: [50, 2000],
  }

  const [min, max] = limits[platform]
  if (len >= min && len <= max) score += 15
  if (caption.includes('?')) score += 5
  if (caption.includes('!')) score += 3
  if (/✓|→|📞|🏠|✨/.test(caption)) score += 8
  if (hashtags.split(' ').filter(Boolean).length >= 3) score += 7
  if (caption.split('\n').length >= 3) score += 5
  if (len > max) score -= 10

  return Math.min(99, Math.max(20, score))
}

export function generateCaptions(
  data: CreativeData,
  tone: CaptionTone = 'professional',
): Record<Platform, GeneratedCaption> {
  const platforms: Platform[] = ['instagram', 'linkedin', 'twitter', 'whatsapp', 'facebook', 'custom']
  const result = {} as Record<Platform, GeneratedCaption>

  for (const p of platforms) {
    const studio = studioCaptionForPlatform(p)
    if (studio) {
      result[p] = studio
      continue
    }
    const hook = pick(hooksForTone(tone), hash(data.title + p + tone))
    const caption = platformCaption(data, p, tone, hook)
    const hashtags = platformHashtags(data, p)
    result[p] = {
      hook,
      caption,
      hashtags,
      charCount: caption.length + (hashtags ? hashtags.length + 2 : 0),
      engagementScore: predictEngagementScore(caption, hashtags, p),
    }
  }
  return result
}

export function generateCaptionVariants(
  data: CreativeData,
  platform: Platform,
  tone: CaptionTone = 'professional',
  count = 3,
): CaptionVariant[] {
  const hooks = hooksForTone(tone)
  const variants: CaptionVariant[] = []

  for (let i = 0; i < count; i++) {
    const studio = i === 0 ? studioCaptionForPlatform(platform) : null
    if (studio && i === 0) {
      variants.push({
        id: 'v1',
        hook: studio.hook,
        caption: studio.caption,
        hashtags: studio.hashtags,
        engagementScore: studio.engagementScore,
      })
      continue
    }
    const hook = pick(hooks, hash(data.title + platform + tone + String(i)))
    const caption = platformCaption(data, platform, tone, hook)
    const hashtags = platformHashtags(data, platform)
    variants.push({
      id: `v${i + 1}`,
      hook,
      caption,
      hashtags,
      engagementScore: predictEngagementScore(caption, hashtags, platform),
    })
  }

  return variants.sort((a, b) => b.engagementScore - a.engagementScore)
}


import type { Platform, GeneratedCaption } from '../types/creative'
import type { StudioCaptionPack } from '../types/studio'

const CAPTIONS_KEY = 'studio-captions-v1'

export function saveStudioCaptions(pack: StudioCaptionPack) {
  localStorage.setItem(CAPTIONS_KEY, JSON.stringify(pack))
}

export function loadStudioCaptions(): StudioCaptionPack | null {
  try {
    const raw = localStorage.getItem(CAPTIONS_KEY)
    return raw ? JSON.parse(raw) as StudioCaptionPack : null
  } catch {
    return null
  }
}

export function clearStudioCaptions() {
  localStorage.removeItem(CAPTIONS_KEY)
}

const PLATFORM_MAP: Record<Platform, keyof StudioCaptionPack | null> = {
  instagram: 'instagram',
  linkedin: 'linkedin',
  whatsapp: 'whatsapp',
  facebook: 'facebook',
  twitter: 'twitter',
  custom: null,
}

export function studioCaptionForPlatform(platform: Platform): GeneratedCaption | null {
  const pack = loadStudioCaptions()
  if (!pack) return null
  const key = PLATFORM_MAP[platform]
  if (!key) return null
  const c = pack[key]
  return {
    hook: '',
    caption: c.caption,
    hashtags: c.hashtags,
    charCount: c.caption.length + c.hashtags.length,
    engagementScore: 75,
  }
}

export function hasStudioCaptions(): boolean {
  return loadStudioCaptions() !== null
}

import { defaultCreativeData, type CreativeData, type ImageAlign, type ImagePosition, type TemplateId } from '../types/creative'
import { resolveHighlightStyle } from './textHighlight'

const IMAGE_STORAGE_KEY = 'creative-studio-images'
const STORAGE_KEYS = ['creative-studio-v4', 'creative-studio-v3', 'creative-studio-v2', 'creative-studio']

const VALID_TEMPLATES: TemplateId[] = [
  'feature-card', 'analytics', 'progress', 'stats-dashboard', 'report-story',
  'job-card', 'kanban-task', 'profile-card', 'pastel-job', 'community-post',
  'just-listed', 'just-sold', 'open-house',
  'profile-glass', 'buyer-match', 'luxury-frame',
  'testimonial', 'market-update', 'photo-gallery',
  'price-drop', 'emi-calculator', 'agent-spotlight', 'festival-wishes', 'site-visit',
  'before-after', 'neighbourhood-guide', 'investment-roi', 'project-launch', 'quote-card',
  'rera-trust', 'rental-yield', 'property-compare',   'home-tips', 'team-showcase', 'grid-cheatsheet', 'glass-card',
  'gradient-radar', 'serif-authority', 'growth-curve', 'minimal-pill',
  'carousel-tip', 'design-pills', 'hook-post', 'studio-statement',
]

export function migrateCreativeData(raw: Partial<CreativeData>): CreativeData {
  const defaults = defaultCreativeData()
  const merged = { ...defaults, ...raw }

  if (!VALID_TEMPLATES.includes(merged.templateId)) {
    merged.templateId = defaults.templateId
  }

  if (!Array.isArray(merged.highlights) || merged.highlights.length === 0) {
    merged.highlights = defaults.highlights
  }

  if (!Array.isArray(merged.chartData) || merged.chartData.length === 0) {
    merged.chartData = defaults.chartData
  } else {
    merged.chartData = merged.chartData.map((pt, i) => ({
      label: pt?.label || defaults.chartData[i]?.label || `Item ${i + 1}`,
      value: Number(pt?.value) || 0,
    }))
  }

  merged.progressPercent = Number(merged.progressPercent) || 0
  merged.titleFontSize = Number(merged.titleFontSize) || defaults.titleFontSize
  merged.subtitleFontSize = Number(merged.subtitleFontSize) || defaults.subtitleFontSize
  merged.bodyFontSize = Number(merged.bodyFontSize) || defaults.bodyFontSize
  merged.metricFontSize = Number(merged.metricFontSize) || defaults.metricFontSize
  merged.labelFontSize = Number(merged.labelFontSize) || defaults.labelFontSize
  merged.textScale = Number(merged.textScale) || defaults.textScale
  merged.textAlign = (['left', 'center', 'right'] as const).includes(merged.textAlign as 'left' | 'center' | 'right')
    ? merged.textAlign
    : defaults.textAlign
  merged.lineHeightScale = Number(merged.lineHeightScale) || defaults.lineHeightScale
  merged.letterSpacing = Number(merged.letterSpacing) ?? defaults.letterSpacing
  merged.highlightStyle = resolveHighlightStyle(merged.highlightStyle)
  merged.highlightColor = merged.highlightColor ?? defaults.highlightColor
  merged.footerFontSize = Number(merged.footerFontSize) || defaults.footerFontSize
  merged.footerLogoSize = Number(merged.footerLogoSize) || defaults.footerLogoSize
  merged.footerLogoRadius = Number(merged.footerLogoRadius) ?? defaults.footerLogoRadius
  merged.footerLogoFit = merged.footerLogoFit === 'cover' ? 'cover' : 'contain'

  merged.headerShowLogo = merged.headerShowLogo ?? defaults.headerShowLogo
  merged.headerLogoSize = Number(merged.headerLogoSize) || defaults.headerLogoSize
  merged.headerLogoRadius = Number(merged.headerLogoRadius) ?? defaults.headerLogoRadius
  merged.headerLogoFit = merged.headerLogoFit === 'cover' ? 'cover' : 'contain'
  merged.headerLogoContainerSize = Number(merged.headerLogoContainerSize) || defaults.headerLogoContainerSize

  merged.heroShowLogo = merged.heroShowLogo ?? defaults.heroShowLogo
  merged.heroLogoSize = Number(merged.heroLogoSize) || defaults.heroLogoSize
  merged.heroLogoRadius = Number(merged.heroLogoRadius) ?? defaults.heroLogoRadius
  merged.heroLogoFit = merged.heroLogoFit === 'cover' ? 'cover' : 'contain'

  merged.avatarShowLogo = merged.avatarShowLogo ?? defaults.avatarShowLogo
  merged.avatarLogoSize = Number(merged.avatarLogoSize) || defaults.avatarLogoSize
  merged.avatarLogoRadius = Number(merged.avatarLogoRadius) ?? defaults.avatarLogoRadius
  merged.avatarLogoFit = merged.avatarLogoFit === 'contain' ? 'contain' : 'cover'
  merged.avatarLogoBorder = Number(merged.avatarLogoBorder) ?? defaults.avatarLogoBorder

  merged.badgeShowLogo = merged.badgeShowLogo ?? defaults.badgeShowLogo
  merged.badgeLogoSize = Number(merged.badgeLogoSize) || defaults.badgeLogoSize
  merged.badgeLogoRadius = Number(merged.badgeLogoRadius) ?? defaults.badgeLogoRadius
  merged.badgeLogoFit = merged.badgeLogoFit === 'contain' ? 'contain' : 'cover'

  merged.footerBgOpacity = Number(merged.footerBgOpacity) ?? defaults.footerBgOpacity
  merged.footerPadding = Number(merged.footerPadding) || defaults.footerPadding
  merged.imageHeight = Number(merged.imageHeight) || defaults.imageHeight
  merged.imageWidth = Number(merged.imageWidth) || defaults.imageWidth
  merged.imageBorderRadius = Number(merged.imageBorderRadius) ?? defaults.imageBorderRadius
  merged.imageOpacity = Number(merged.imageOpacity) || defaults.imageOpacity
  merged.imageMargin = Number(merged.imageMargin) ?? defaults.imageMargin
  merged.imageCoverHeight = Number(merged.imageCoverHeight) || defaults.imageCoverHeight
  merged.imageAlign = (['left', 'center', 'right', 'stretch'] as const).includes(merged.imageAlign as ImageAlign)
    ? merged.imageAlign
    : defaults.imageAlign
  merged.imageHeaderOrder = merged.imageHeaderOrder === 'logo-first' ? 'logo-first' : 'image-first'
  merged.imagePosition = (['top', 'bottom', 'left', 'right', 'background', 'cover'] as const).includes(merged.imagePosition as ImagePosition)
    ? merged.imagePosition
    : defaults.imagePosition
  merged.exportQuality = ([2, 3, 4, 5, 6] as const).includes(merged.exportQuality as 2 | 3 | 4 | 5 | 6)
    ? merged.exportQuality
    : defaults.exportQuality

  merged.imageFilter = merged.imageFilter || defaults.imageFilter
  merged.imageBrightness = Number(merged.imageBrightness) || defaults.imageBrightness
  merged.imageContrast = Number(merged.imageContrast) || defaults.imageContrast
  merged.imageSaturation = Number(merged.imageSaturation) || defaults.imageSaturation
  merged.imageSharpness = Number(merged.imageSharpness) ?? defaults.imageSharpness
  merged.imageAutoEnhance = merged.imageAutoEnhance ?? defaults.imageAutoEnhance
  merged.imageGradientOverlay = merged.imageGradientOverlay ?? defaults.imageGradientOverlay
  merged.imageGradientStrength = Number(merged.imageGradientStrength) || defaults.imageGradientStrength
  merged.uploadQuality = merged.uploadQuality || defaults.uploadQuality
  merged.imageGallery = Array.isArray(merged.imageGallery) ? merged.imageGallery : defaults.imageGallery

  merged.footerShowLogo = merged.footerShowLogo ?? defaults.footerShowLogo
  merged.footerShowPhone = merged.footerShowPhone ?? defaults.footerShowPhone
  merged.footerShowEmail = merged.footerShowEmail ?? defaults.footerShowEmail
  merged.footerShowWebsite = merged.footerShowWebsite ?? defaults.footerShowWebsite
  merged.footerShowLocation = merged.footerShowLocation ?? defaults.footerShowLocation
  merged.showFooter = merged.showFooter ?? defaults.showFooter
  merged.showCreativeImage = merged.showCreativeImage ?? defaults.showCreativeImage

  merged.carouselEnabled = merged.carouselEnabled ?? defaults.carouselEnabled
  merged.activeCarouselSlide = Number(merged.activeCarouselSlide) || 0
  if (!Array.isArray(merged.carouselSlides) || merged.carouselSlides.length < 2) {
    merged.carouselSlides = defaults.carouselSlides
  }

  merged.propertyTitle = merged.propertyTitle || defaults.propertyTitle
  merged.propertyPrice = merged.propertyPrice || defaults.propertyPrice
  merged.propertyBeds = merged.propertyBeds || defaults.propertyBeds
  merged.propertyBaths = merged.propertyBaths || defaults.propertyBaths
  merged.propertySqft = merged.propertySqft || defaults.propertySqft
  merged.propertyAddress = merged.propertyAddress || defaults.propertyAddress
  merged.propertyType = merged.propertyType || defaults.propertyType
  merged.reraNumber = merged.reraNumber ?? defaults.reraNumber
  merged.listingStatus = merged.listingStatus || defaults.listingStatus

  merged.reviewRating = merged.reviewRating || defaults.reviewRating
  merged.reviewText = merged.reviewText || defaults.reviewText
  merged.reviewerName = merged.reviewerName || defaults.reviewerName
  merged.reviewerRole = merged.reviewerRole || defaults.reviewerRole
  merged.showQrCode = merged.showQrCode ?? defaults.showQrCode
  merged.qrCodeUrl = merged.qrCodeUrl ?? defaults.qrCodeUrl
  merged.themeId = merged.themeId || defaults.themeId
  merged.listingUrl = merged.listingUrl ?? defaults.listingUrl

  return merged
}

function loadRawData(): Partial<CreativeData> {
  for (const key of STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch {
      localStorage.removeItem(key)
    }
  }
  return {}
}

export function loadPersistedData(): CreativeData {
  try {
    const parsed = loadRawData()
    const images = sessionStorage.getItem(IMAGE_STORAGE_KEY)
    const imgs = images ? JSON.parse(images) : {}

    return migrateCreativeData({
      ...parsed,
      imageUrl: imgs.imageUrl || parsed.imageUrl || '',
      logoUrl: imgs.logoUrl || parsed.logoUrl || '',
      imageGallery: imgs.imageGallery || parsed.imageGallery || [],
    })
  } catch {
    return defaultCreativeData()
  }
}

export function savePersistedData(data: CreativeData) {
  const { imageUrl, logoUrl, imageGallery, ...rest } = data

  try {
    localStorage.setItem('creative-studio-v4', JSON.stringify({ ...rest, imageGallery: [] }))
  } catch {
    localStorage.removeItem('creative-studio-v4')
  }

  try {
    sessionStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify({ imageUrl, logoUrl, imageGallery }))
  } catch {
    try {
      sessionStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify({ imageUrl, logoUrl, imageGallery: imageGallery.slice(0, 4) }))
    } catch {
      // images too large — skip gallery
    }
  }
}

export function clearPersistedData() {
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
  sessionStorage.removeItem(IMAGE_STORAGE_KEY)
}

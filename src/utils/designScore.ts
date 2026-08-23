import type { CreativeData } from '../types/creative'

export type CheckStatus = 'pass' | 'warn' | 'fail'

export interface DesignCheck {
  id: string
  label: string
  status: CheckStatus
  detail: string
  fixKey?: keyof CreativeData
  fixValue?: CreativeData[keyof CreativeData]
  fixLabel?: string
}

export interface DesignScoreResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  checks: DesignCheck[]
  passed: number
  total: number
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*/g, '').trim()
}

function wordCount(text: string): number {
  const clean = stripMarkdown(text)
  if (!clean) return 0
  return clean.split(/\s+/).filter(Boolean).length
}

function parseHex(hex: string): [number, number, number] | null {
  const h = hex.replace('#', '')
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ]
  }
  if (h.length === 6) {
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  return null
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const c1 = parseHex(hex1)
  const c2 = parseHex(hex2)
  if (!c1 || !c2) return null
  const l1 = luminance(...c1)
  const l2 = luminance(...c2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function statusPoints(status: CheckStatus): number {
  if (status === 'pass') return 1
  if (status === 'warn') return 0.5
  return 0
}

function gradeFromScore(score: number): DesignScoreResult['grade'] {
  if (score >= 90) return 'A'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  if (score >= 45) return 'D'
  return 'F'
}

export function computeDesignScore(data: CreativeData): DesignScoreResult {
  const scale = data.textScale / 100
  const effectiveTitle = Math.round(data.titleFontSize * scale)
  const effectiveBody = Math.round(data.bodyFontSize * scale)
  const titleWords = wordCount(data.title)
  const hasPhotoBg =
    data.showCreativeImage &&
    (data.imagePosition === 'background' || data.imagePosition === 'cover')
  const contrastWhite = contrastRatio(data.accentColor, '#ffffff')
  const contrastDark = contrastRatio(data.accentColor, '#1e293b')
  const bestContrast = Math.max(contrastWhite ?? 0, contrastDark ?? 0)

  const checks: DesignCheck[] = [
    {
      id: 'headline-size',
      label: 'Headline readability',
      status: effectiveTitle >= 48 ? 'pass' : effectiveTitle >= 36 ? 'warn' : 'fail',
      detail:
        effectiveTitle >= 48
          ? `Headline ${effectiveTitle}px — strong for mobile feeds`
          : `Headline ${effectiveTitle}px — aim for 48px+ on 1080px canvas`,
      fixKey: 'titleFontSize',
      fixValue: 48,
      fixLabel: 'Boost to 48px',
    },
    {
      id: 'headline-length',
      label: 'Headline length',
      status: titleWords === 0 ? 'fail' : titleWords <= 7 ? 'pass' : titleWords <= 10 ? 'warn' : 'fail',
      detail:
        titleWords === 0
          ? 'Add a headline — posts need a clear hook'
          : titleWords <= 7
            ? `${titleWords} words — concise hook`
            : `${titleWords} words — shorten to 7 or fewer for scroll-stopping impact`,
    },
    {
      id: 'cta',
      label: 'Call to action',
      status: data.ctaText.trim().length >= 2 ? 'pass' : 'fail',
      detail: data.ctaText.trim() ? `CTA: "${data.ctaText}"` : 'Missing CTA — add an action (Call, Visit, DM)',
      fixKey: 'ctaText',
      fixValue: 'Learn More',
      fixLabel: 'Add CTA',
    },
    {
      id: 'photo-scrim',
      label: 'Text over photo',
      status: !hasPhotoBg
        ? 'pass'
        : data.imageGradientOverlay || data.textShadowEnabled
          ? 'pass'
          : 'fail',
      detail: !hasPhotoBg
        ? 'No full-bleed photo — text contrast OK'
        : data.imageGradientOverlay || data.textShadowEnabled
          ? 'Scrim or text shadow protects readability'
          : 'Photo background needs gradient overlay or text shadow',
      fixKey: 'imageGradientOverlay',
      fixValue: true,
      fixLabel: 'Add photo scrim',
    },
    {
      id: 'contrast',
      label: 'Accent contrast',
      status: bestContrast >= 4.5 ? 'pass' : bestContrast >= 3 ? 'warn' : 'fail',
      detail:
        bestContrast >= 4.5
          ? `Contrast ratio ${bestContrast.toFixed(1)}:1 — WCAG friendly`
          : bestContrast >= 3
            ? `Contrast ${bestContrast.toFixed(1)}:1 — acceptable for large text only`
            : `Low contrast (${bestContrast.toFixed(1)}:1) — text may disappear in feed`,
    },
    {
      id: 'body-size',
      label: 'Body text size',
      status: effectiveBody >= 16 ? 'pass' : effectiveBody >= 14 ? 'warn' : 'fail',
      detail:
        effectiveBody >= 16
          ? `Body ${effectiveBody}px — readable on mobile`
          : `Body ${effectiveBody}px — increase to 16px+ for small screens`,
      fixKey: 'bodyFontSize',
      fixValue: 16,
      fixLabel: 'Boost body to 16px',
    },
    {
      id: 'brand',
      label: 'Brand presence',
      status: data.logoUrl || data.footerShowLogo ? 'pass' : 'warn',
      detail: data.logoUrl || data.footerShowLogo
        ? 'Logo visible — good for reshares'
        : 'No logo — add brand mark for recognition',
    },
    {
      id: 'hierarchy',
      label: 'Type hierarchy',
      status: effectiveTitle >= effectiveBody * 2 ? 'pass' : effectiveTitle >= effectiveBody * 1.5 ? 'warn' : 'fail',
      detail:
        effectiveTitle >= effectiveBody * 2
          ? `Headline ${effectiveTitle}px vs body ${effectiveBody}px — clear hierarchy`
          : 'Headline should be at least 2× body size for visual order',
    },
  ]

  const points = checks.reduce((sum, c) => sum + statusPoints(c.status), 0)
  const score = Math.round((points / checks.length) * 100)

  return {
    score,
    grade: gradeFromScore(score),
    checks,
    passed: checks.filter((c) => c.status === 'pass').length,
    total: checks.length,
  }
}

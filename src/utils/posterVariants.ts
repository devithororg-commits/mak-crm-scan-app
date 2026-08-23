import type { CreativeData } from '../types/creative'

export interface PosterVariant {
  id: 'a' | 'b' | 'c'
  label: string
  desc: string
  score: number
  patch: Partial<CreativeData>
}

/** Three visual A/B/C poster variants for ad testing */
export function generatePosterVariants(data: CreativeData): PosterVariant[] {
  const ctaAlt = data.ctaText?.trim() ? data.ctaText : 'Call Now'

  return [
    {
      id: 'a',
      label: 'Variant A — Baseline',
      desc: 'Current colors & highlight style',
      score: 72,
      patch: {},
    },
    {
      id: 'b',
      label: 'Variant B — Bold CTA',
      desc: 'Background highlight · stronger CTA contrast',
      score: 81,
      patch: {
        highlightStyle: 'background',
        highlightColor: data.accentColor,
        textShadowEnabled: true,
        textShadowBlur: 6,
        textShadowOffsetY: 1,
        ctaText: ctaAlt,
      },
    },
    {
      id: 'c',
      label: 'Variant C — Palette Shift',
      desc: 'Swapped accent + gradient highlight',
      score: 76,
      patch: {
        accentColor: data.secondaryColor,
        highlightStyle: 'gradient',
        highlightColor: data.accentColor,
        secondaryColor: data.accentColor,
        imageGradientOverlay: true,
        imageGradientStrength: 50,
      },
    },
  ]
}

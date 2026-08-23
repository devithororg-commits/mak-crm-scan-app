import type { CreativeData, FontFamily } from '../types/creative'

export interface TypographyPreset {
  id: string
  name: string
  desc: string
  emoji: string
  apply: () => Partial<CreativeData>
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'poster-bold',
    name: 'Poster Bold',
    desc: 'Large headline · feed-stopping',
    emoji: '📢',
    apply: () => ({
      fontFamily: 'Poppins' as FontFamily,
      titleFontSize: 52,
      subtitleFontSize: 22,
      bodyFontSize: 16,
      metricFontSize: 28,
      labelFontSize: 12,
      textScale: 105,
      lineHeightScale: 105,
      letterSpacing: 0,
      textTransform: 'none',
    }),
  },
  {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    desc: 'Balanced · professional reports',
    emoji: '🏢',
    apply: () => ({
      fontFamily: 'Inter' as FontFamily,
      titleFontSize: 36,
      subtitleFontSize: 18,
      bodyFontSize: 14,
      metricFontSize: 22,
      labelFontSize: 11,
      textScale: 100,
      lineHeightScale: 110,
      letterSpacing: 0,
      textTransform: 'none',
    }),
  },
  {
    id: 'luxury-serif',
    name: 'Luxury Serif',
    desc: 'Editorial · premium estates',
    emoji: '🏛️',
    apply: () => ({
      fontFamily: 'Playfair Display' as FontFamily,
      titleFontSize: 48,
      subtitleFontSize: 20,
      bodyFontSize: 15,
      metricFontSize: 26,
      labelFontSize: 11,
      textScale: 102,
      lineHeightScale: 115,
      letterSpacing: 0.5,
      textTransform: 'none',
    }),
  },
  {
    id: 'social-hook',
    name: 'Social Hook',
    desc: 'Extra bold · engagement posts',
    emoji: '🔥',
    apply: () => ({
      fontFamily: 'DM Sans' as FontFamily,
      titleFontSize: 56,
      subtitleFontSize: 20,
      bodyFontSize: 16,
      metricFontSize: 30,
      labelFontSize: 12,
      textScale: 110,
      lineHeightScale: 100,
      letterSpacing: -0.5,
      textTransform: 'uppercase',
    }),
  },
]

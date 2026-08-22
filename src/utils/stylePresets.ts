import type { CreativeData } from '../types/creative'
import { applyTheme } from './themePresets'

export interface StylePreset {
  id: string
  name: string
  desc: string
  emoji: string
  apply: (prev: CreativeData) => Partial<CreativeData>
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    desc: 'Large text, gradient highlights',
    emoji: '💥',
    apply: () => ({
      textScale: 115,
      highlightStyle: 'gradient',
      titleFontSize: 36,
      imageShadow: true,
      imageGradientOverlay: true,
      imageGradientStrength: 60,
    }),
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    desc: 'Subtle, understated look',
    emoji: '✨',
    apply: () => ({
      textScale: 95,
      highlightStyle: 'underline',
      lineHeightScale: 110,
      showWatermark: false,
      imageGradientOverlay: false,
      imageShadow: false,
      imageBorder: false,
    }),
  },
  {
    id: 'luxury-estate',
    name: 'Luxury Estate',
    desc: 'Premium gold & serif',
    emoji: '🏛️',
    apply: (_prev) => ({
      ...applyTheme('luxury-gold'),
      highlightStyle: 'background',
      imageFilter: 'luxury',
      imageGradientOverlay: true,
      imageGradientStrength: 55,
      footerStyle: 'full',
      showFooter: true,
    }),
  },
  {
    id: 'social-pop',
    name: 'Social Pop',
    desc: 'Vibrant & eye-catching',
    emoji: '🔥',
    apply: (_prev) => ({
      ...applyTheme('rose'),
      textScale: 110,
      highlightStyle: 'gradient',
      imageShadow: true,
      imageBorderRadius: 20,
    }),
  },
  {
    id: 'data-dense',
    name: 'Data Dense',
    desc: 'Compact metrics layout',
    emoji: '📊',
    apply: () => ({
      textScale: 90,
      titleFontSize: 28,
      bodyFontSize: 12,
      metricFontSize: 18,
      lineHeightScale: 95,
      highlightStyle: 'accent',
    }),
  },
  {
    id: 'trust-pro',
    name: 'Trust Pro',
    desc: 'Corporate & credible',
    emoji: '🤝',
    apply: (_prev) => ({
      ...applyTheme('emerald'),
      highlightStyle: 'accent',
      showFooter: true,
      footerStyle: 'branded',
      footerShowPhone: true,
      footerShowEmail: true,
      footerShowWebsite: true,
      lineHeightScale: 105,
    }),
  },
]

export const DENSITY_PRESETS = [
  { id: 'compact', label: 'Compact', textScale: 88, lineHeightScale: 95 },
  { id: 'normal', label: 'Normal', textScale: 100, lineHeightScale: 100 },
  { id: 'spacious', label: 'Spacious', textScale: 112, lineHeightScale: 115 },
] as const

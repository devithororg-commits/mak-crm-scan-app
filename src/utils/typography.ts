import type { CSSProperties } from 'react'
import type { CreativeData } from '../types/creative'

export interface TypographyStyles {
  title: CSSProperties
  subtitle: CSSProperties
  body: CSSProperties
  metric: CSSProperties
  label: CSSProperties
  small: CSSProperties
}

export function getTypography(data: CreativeData): TypographyStyles {
  const scale = data.textScale / 100
  const lh = data.lineHeightScale / 100
  const ls = data.letterSpacing
  const titleBase = { letterSpacing: ls ? `${ls}px` : undefined }
  return {
    title: { fontSize: Math.round(data.titleFontSize * scale), lineHeight: 1.2 * lh, ...titleBase },
    subtitle: { fontSize: Math.round(data.subtitleFontSize * scale), lineHeight: 1.4 * lh, letterSpacing: ls ? `${ls * 0.5}px` : undefined },
    body: { fontSize: Math.round(data.bodyFontSize * scale), lineHeight: 1.55 * lh },
    metric: { fontSize: Math.round(data.metricFontSize * scale), lineHeight: 1.2 * lh },
    label: { fontSize: Math.round(data.labelFontSize * scale), lineHeight: 1.3 * lh },
    small: { fontSize: Math.round(data.labelFontSize * scale * 0.9), lineHeight: 1.3 * lh },
  }
}

export const FONT_SIZE_DEFAULTS = {
  titleFontSize: 32,
  subtitleFontSize: 16,
  bodyFontSize: 14,
  metricFontSize: 20,
  labelFontSize: 11,
  textScale: 100,
  textAlign: 'left' as const,
  lineHeightScale: 100,
  letterSpacing: 0,
}

export const FONT_SIZE_LIMITS = {
  titleFontSize: { min: 18, max: 72 },
  subtitleFontSize: { min: 12, max: 36 },
  bodyFontSize: { min: 10, max: 28 },
  metricFontSize: { min: 14, max: 48 },
  labelFontSize: { min: 8, max: 18 },
  textScale: { min: 75, max: 160 },
  lineHeightScale: { min: 80, max: 150 },
  letterSpacing: { min: -1, max: 8 },
}

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
  return {
    title: { fontSize: Math.round(data.titleFontSize * scale), lineHeight: 1.2 },
    subtitle: { fontSize: Math.round(data.subtitleFontSize * scale), lineHeight: 1.4 },
    body: { fontSize: Math.round(data.bodyFontSize * scale), lineHeight: 1.55 },
    metric: { fontSize: Math.round(data.metricFontSize * scale), lineHeight: 1.2 },
    label: { fontSize: Math.round(data.labelFontSize * scale), lineHeight: 1.3 },
    small: { fontSize: Math.round(data.labelFontSize * scale * 0.9), lineHeight: 1.3 },
  }
}

export const FONT_SIZE_DEFAULTS = {
  titleFontSize: 32,
  subtitleFontSize: 16,
  bodyFontSize: 14,
  metricFontSize: 20,
  labelFontSize: 11,
  textScale: 100,
}

export const FONT_SIZE_LIMITS = {
  titleFontSize: { min: 18, max: 72 },
  subtitleFontSize: { min: 12, max: 36 },
  bodyFontSize: { min: 10, max: 28 },
  metricFontSize: { min: 14, max: 48 },
  labelFontSize: { min: 8, max: 18 },
  textScale: { min: 75, max: 160 },
}

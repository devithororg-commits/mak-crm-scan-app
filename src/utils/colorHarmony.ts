import type { CreativeData } from '../types/creative'

export interface HarmonyPalette {
  dominant: string
  secondary: string
  accent: string
  labels: { dominant: string; secondary: string; accent: string }
}

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace('#', '')
  if (h.length === 3) {
    return [
      parseInt(h[0] + h[0], 16),
      parseInt(h[1] + h[1], 16),
      parseInt(h[2] + h[2], 16),
    ]
  }
  if (h.length === 6) return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  return null
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')}`
}

function mix(hex1: string, hex2: string, weight: number): string {
  const a = hexToRgb(hex1)
  const b = hexToRgb(hex2)
  if (!a || !b) return hex1
  const w = Math.max(0, Math.min(1, weight))
  return rgbToHex(a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w)
}

/** 60-30-10 rule derived from brand primary + secondary */
export function compute603010(accentColor: string, secondaryColor: string): HarmonyPalette {
  const dominant = mix(accentColor, '#F8FAFC', 0.92)
  const secondary = mix(secondaryColor, '#ffffff', 0.15)
  const accent = accentColor

  return {
    dominant,
    secondary,
    accent,
    labels: {
      dominant: '60% — Background / neutral field',
      secondary: '30% — Brand secondary blocks',
      accent: '10% — CTA & highlights',
    },
  }
}

export function apply603010(data: CreativeData): Partial<CreativeData> {
  const palette = compute603010(data.accentColor, data.secondaryColor)
  return {
    accentColor: palette.accent,
    secondaryColor: palette.secondary,
    highlightColor: palette.accent,
    highlightStyle: 'accent',
  }
}

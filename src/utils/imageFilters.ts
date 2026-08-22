import type { ImageFilter } from '../types/creative'

export interface FilterPreset {
  id: ImageFilter
  name: string
  desc: string
  brightness: number
  contrast: number
  saturation: number
  cssFilter: string
}

export const IMAGE_FILTER_PRESETS: FilterPreset[] = [
  { id: 'none', name: 'Original', desc: 'No filter', brightness: 100, contrast: 100, saturation: 100, cssFilter: 'none' },
  { id: 'luxury', name: 'Luxury', desc: 'Warm gold tones', brightness: 105, contrast: 110, saturation: 115, cssFilter: 'sepia(0.12) saturate(1.2) brightness(1.05) contrast(1.08)' },
  { id: 'modern', name: 'Modern', desc: 'Cool & crisp', brightness: 102, contrast: 115, saturation: 90, cssFilter: 'saturate(0.9) contrast(1.12) brightness(1.02) hue-rotate(-5deg)' },
  { id: 'natural', name: 'Natural', desc: 'Soft & bright', brightness: 108, contrast: 95, saturation: 105, cssFilter: 'brightness(1.06) contrast(0.96) saturate(1.05)' },
  { id: 'dramatic', name: 'Dramatic', desc: 'Bold shadows', brightness: 95, contrast: 130, saturation: 110, cssFilter: 'contrast(1.25) brightness(0.95) saturate(1.1)' },
  { id: 'vintage', name: 'Vintage', desc: 'Film grain look', brightness: 100, contrast: 105, saturation: 80, cssFilter: 'sepia(0.25) contrast(1.05) saturate(0.8) brightness(1.02)' },
  { id: 'bw', name: 'B&W Pro', desc: 'High-contrast mono', brightness: 100, contrast: 125, saturation: 0, cssFilter: 'grayscale(1) contrast(1.2) brightness(1.02)' },
]

export function getFilterCss(filter: ImageFilter): string {
  const preset = IMAGE_FILTER_PRESETS.find((f) => f.id === filter)
  return preset?.cssFilter ?? 'none'
}

export function buildImageCssFilter(
  filter: ImageFilter,
  brightness: number,
  contrast: number,
  saturation: number,
): string {
  const base = getFilterCss(filter)
  const adjust = `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100})`
  return base === 'none' ? adjust : `${base} ${adjust}`
}

export function applyFilterPreset(filter: ImageFilter) {
  const preset = IMAGE_FILTER_PRESETS.find((f) => f.id === filter) ?? IMAGE_FILTER_PRESETS[0]
  return {
    imageFilter: preset.id,
    imageBrightness: preset.brightness,
    imageContrast: preset.contrast,
    imageSaturation: preset.saturation,
  }
}

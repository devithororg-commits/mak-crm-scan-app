import type { ImagePosition, ImageSizePreset } from '../types/creative'

export const IMAGE_SIZE_PRESETS: Record<
  ImageSizePreset,
  { label: string; height: number; width: number; coverHeight: number; desc: string }
> = {
  small: { label: 'Small', height: 120, width: 60, coverHeight: 100, desc: 'Compact thumbnail' },
  medium: { label: 'Medium', height: 200, width: 80, coverHeight: 144, desc: 'Balanced default' },
  large: { label: 'Large', height: 300, width: 100, coverHeight: 200, desc: 'Prominent feature' },
  full: { label: 'Full', height: 400, width: 100, coverHeight: 260, desc: 'Maximum impact' },
  custom: { label: 'Custom', height: 200, width: 80, coverHeight: 144, desc: 'Manual control' },
}

export function getImageDimensions(
  position: ImagePosition,
  preset: ImageSizePreset,
  customHeight: number,
  customWidth: number,
  coverHeight: number,
) {
  const base = IMAGE_SIZE_PRESETS[preset]
  const height = preset === 'custom' ? customHeight : base.height
  const widthPct = preset === 'custom' ? customWidth : base.width
  const cover = preset === 'custom' ? coverHeight : base.coverHeight

  const isSide = position === 'left' || position === 'right'
  const isBg = position === 'background'
  const isCover = position === 'cover'

  return {
    height: isBg ? '100%' : isCover ? cover : height,
    width: isSide ? `${widthPct}%` : isBg || isCover ? '100%' : `${widthPct}%`,
    widthPct,
    coverHeight: cover,
  }
}

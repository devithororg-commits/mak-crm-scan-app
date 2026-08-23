import type { CSSProperties } from 'react'
import type { CreativeData } from '../types/creative'

export function getTextEffectStyle(data: CreativeData): CSSProperties {
  const styles: CSSProperties = {
    textTransform: data.textTransform === 'none' ? undefined : data.textTransform,
    opacity: data.contentOpacity / 100,
  }

  const shadows: string[] = []
  if (data.textShadowEnabled) {
    shadows.push(
      `${data.textShadowOffsetX}px ${data.textShadowOffsetY}px ${data.textShadowBlur}px ${data.textShadowColor}`,
    )
  }
  if (data.textOutlineEnabled && data.textOutlineWidth > 0) {
    const w = data.textOutlineWidth
    const c = data.textOutlineColor
    shadows.push(
      `${w}px 0 0 ${c}`, `-${w}px 0 0 ${c}`, `0 ${w}px 0 ${c}`, `0 -${w}px 0 ${c}`,
      `${w}px ${w}px 0 ${c}`, `-${w}px ${w}px 0 ${c}`, `${w}px -${w}px 0 ${c}`, `-${w}px -${w}px 0 ${c}`,
    )
  }
  if (shadows.length) styles.textShadow = shadows.join(', ')

  return styles
}

export function getImageTransformStyle(data: CreativeData): CSSProperties {
  const transforms: string[] = []
  if (data.imageFlipX) transforms.push('scaleX(-1)')
  if (data.imageFlipY) transforms.push('scaleY(-1)')
  if (data.imageRotate) transforms.push(`rotate(${data.imageRotate}deg)`)
  if (data.imageOffsetX || data.imageOffsetY) transforms.push(`translate(${data.imageOffsetX}px, ${data.imageOffsetY}px)`)

  return transforms.length ? { transform: transforms.join(' ') } : {}
}

export function getContentOffsetStyle(data: CreativeData): CSSProperties {
  if (!data.contentOffsetX && !data.contentOffsetY) return {}
  return { transform: `translate(${data.contentOffsetX}px, ${data.contentOffsetY}px)` }
}

export function snapValue(value: number, grid = 8): number {
  return Math.round(value / grid) * grid
}

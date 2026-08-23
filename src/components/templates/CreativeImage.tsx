import type { CSSProperties, ReactNode } from 'react'
import type { CreativeData } from '../../types/creative'
import { buildImageCssFilter } from '../../utils/imageFilters'
import { getImageDimensions } from '../../utils/imageLayout'
import { getImageTransformStyle } from '../../utils/designEffects'

const OBJECT_POS_MAP: Record<CreativeData['imageObjectPosition'], string> = {
  center: 'center center',
  top: 'center top',
  bottom: 'center bottom',
  left: 'left center',
  right: 'right center',
}

function safeNum(val: number | undefined, fallback: number) {
  return typeof val === 'number' && !Number.isNaN(val) ? val : fallback
}

function alignSelf(align: CreativeData['imageAlign']): CSSProperties['alignSelf'] {
  if (align === 'left') return 'flex-start'
  if (align === 'right') return 'flex-end'
  if (align === 'center') return 'center'
  return 'stretch'
}

function ImageWithEffects({ data, style }: { data: CreativeData; style: CSSProperties }) {
  const cssFilter = buildImageCssFilter(
    data.imageFilter || 'none',
    data.imageBrightness ?? 100,
    data.imageContrast ?? 100,
    data.imageSaturation ?? 100,
  )
  const gradientStrength = safeNum(data.imageGradientStrength, 50)

  return (
    <div className="relative h-full w-full" style={getImageTransformStyle(data)}>
      <img
        src={data.imageUrl}
        alt=""
        crossOrigin="anonymous"
        style={{ ...style, filter: cssFilter }}
      />
      {data.imageGradientOverlay && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,${gradientStrength / 100}) 0%, transparent 60%)`,
          }}
        />
      )}
    </div>
  )
}

export default function CreativeImage({ data, className = '' }: { data: CreativeData; className?: string }) {
  if (!data.showCreativeImage || !data.imageUrl) return null

  const height = safeNum(data.imageHeight, 200)
  const widthPct = safeNum(data.imageWidth, 100)
  const coverHeight = safeNum(data.imageCoverHeight, 144)
  const borderRadius = safeNum(data.imageBorderRadius, 16)
  const margin = safeNum(data.imageMargin, 0)
  const opacity = safeNum(data.imageOpacity, 30)
  const align = data.imageAlign || 'stretch'

  const dims = getImageDimensions(
    data.imagePosition,
    data.imageSizePreset || 'medium',
    height,
    widthPct,
    coverHeight,
  )

  const isSide = data.imagePosition === 'left' || data.imagePosition === 'right'
  const isBg = data.imagePosition === 'background'
  const isCover = data.imagePosition === 'cover'
  const isStretch = align === 'stretch' || isBg || isCover

  const imgStyle: CSSProperties = {
    objectFit: data.imageFit || 'cover',
    objectPosition: OBJECT_POS_MAP[data.imageObjectPosition || 'center'],
    width: '100%',
    height: '100%',
    display: 'block',
  }

  const containerStyle: CSSProperties = {
    borderRadius: isCover ? 0 : borderRadius,
    overflow: 'hidden',
    border: data.imageBorder ? '2px solid rgba(128,128,128,0.2)' : undefined,
    boxShadow: data.imageShadow ? '0 8px 32px rgba(0,0,0,0.15)' : undefined,
    flexShrink: 0,
    width: isStretch ? '100%' : dims.width,
    height: typeof dims.height === 'number' ? dims.height : undefined,
    alignSelf: isSide ? undefined : alignSelf(align),
    marginTop: !isSide && margin ? margin : undefined,
    marginBottom: !isSide && margin ? margin : undefined,
  }

  if (isBg) {
    return (
      <div className={`absolute inset-0 overflow-hidden ${className}`} style={{ borderRadius: 0 }}>
        <ImageWithEffects data={data} style={{ ...imgStyle, opacity: opacity / 100 }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/65" />
      </div>
    )
  }

  if (isCover) {
    return (
      <div className={`w-full shrink-0 ${className}`} style={containerStyle}>
        <ImageWithEffects data={data} style={imgStyle} />
      </div>
    )
  }

  if (isSide) {
    return (
      <div
        className={className}
        style={{
          ...containerStyle,
          width: dims.width,
          height: typeof dims.height === 'number' ? dims.height : height,
          alignSelf: 'stretch',
        }}
      >
        <ImageWithEffects data={data} style={imgStyle} />
      </div>
    )
  }

  return (
    <div className={`shrink-0 ${className}`} style={containerStyle}>
      <ImageWithEffects data={data} style={imgStyle} />
    </div>
  )
}

interface TemplateLayoutProps {
  data: CreativeData
  header?: ReactNode
  children: ReactNode
}

/** Lays out main image + logo header + body with proper alignment */
export function TemplateLayout({ data, header, children }: TemplateLayoutProps) {
  const gap = safeNum(data.imageMargin, 16) || 16
  const hasImage = data.showCreativeImage && !!data.imageUrl
  const pos = data.imagePosition || 'top'

  if (!hasImage) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {header}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    )
  }

  if (pos === 'cover') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <CreativeImage data={data} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {header}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    )
  }

  if (pos === 'background') {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <CreativeImage data={data} />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col text-white">
          {header}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    )
  }

  if (pos === 'left' || pos === 'right') {
    return (
      <div
        className={`flex min-h-0 flex-1 items-stretch ${pos === 'right' ? 'flex-row-reverse' : 'flex-row'}`}
        style={{ gap }}
      >
        <CreativeImage data={data} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {header}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
        </div>
      </div>
    )
  }

  const imageEl =
    (data.imageAlign || 'stretch') === 'stretch' ? (
      <CreativeImage data={data} />
    ) : (
      <div
        className="flex w-full shrink-0"
        style={{
          justifyContent:
            data.imageAlign === 'right' ? 'flex-end' : data.imageAlign === 'center' ? 'center' : 'flex-start',
        }}
      >
        <CreativeImage data={data} />
      </div>
    )

  if (pos === 'top') {
    if (data.imageHeaderOrder === 'logo-first') {
      return (
        <div className="flex min-h-0 flex-1 flex-col" style={{ gap }}>
          {header}
          {imageEl}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
        </div>
      )
    }
    return (
      <div className="flex min-h-0 flex-1 flex-col" style={{ gap }}>
        {imageEl}
        {header}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ gap }}>
      {header}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      {imageEl}
    </div>
  )
}

/** @deprecated Use TemplateLayout with header slot */
export function CreativeImageLayout({ data, children }: { data: CreativeData; children: ReactNode }) {
  return <TemplateLayout data={data}>{children}</TemplateLayout>
}

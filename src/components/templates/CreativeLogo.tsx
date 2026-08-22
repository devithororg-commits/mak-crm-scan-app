import type { CSSProperties, ReactNode } from 'react'
import type { CreativeData } from '../../types/creative'

export type LogoPlacement = 'header' | 'hero' | 'avatar' | 'badge' | 'footer'

export interface LogoPlacementConfig {
  show: boolean
  size: number
  radius: number
  fit: 'contain' | 'cover'
  containerSize?: number
  border?: number
}

export const LOGO_PLACEMENT_LABELS: Record<LogoPlacement, { label: string; desc: string }> = {
  header: { label: 'Header Logo', desc: 'Analytics, Feature, Report templates' },
  hero: { label: 'Hero Logo', desc: 'Progress card side logo' },
  avatar: { label: 'Avatar Logo', desc: 'Profile card circular photo' },
  badge: { label: 'Badge Logo', desc: 'Job, Kanban, Community small logos' },
  footer: { label: 'Footer Logo', desc: 'Bottom footer branding' },
}

export function getLogoConfig(data: CreativeData, placement: LogoPlacement): LogoPlacementConfig {
  switch (placement) {
    case 'header':
      return {
        show: data.headerShowLogo,
        size: data.headerLogoSize,
        radius: data.headerLogoRadius,
        fit: data.headerLogoFit,
        containerSize: data.headerLogoContainerSize,
      }
    case 'hero':
      return {
        show: data.heroShowLogo,
        size: data.heroLogoSize,
        radius: data.heroLogoRadius,
        fit: data.heroLogoFit,
      }
    case 'avatar':
      return {
        show: data.avatarShowLogo,
        size: data.avatarLogoSize,
        radius: data.avatarLogoRadius,
        fit: data.avatarLogoFit,
        border: data.avatarLogoBorder,
      }
    case 'badge':
      return {
        show: data.badgeShowLogo,
        size: data.badgeLogoSize,
        radius: data.badgeLogoRadius,
        fit: data.badgeLogoFit,
      }
    case 'footer':
      return {
        show: data.footerShowLogo,
        size: data.footerLogoSize,
        radius: data.footerLogoRadius,
        fit: data.footerLogoFit,
      }
  }
}

function logoStyle(config: LogoPlacementConfig): CSSProperties {
  return {
    width: config.size,
    height: config.size,
    borderRadius: config.radius >= 999 ? '50%' : config.radius,
    objectFit: config.fit,
    display: 'block',
    flexShrink: 0,
  }
}

interface CreativeLogoProps {
  data: CreativeData
  placement: LogoPlacement
  fallback?: ReactNode
  className?: string
  withContainer?: boolean
}

export default function CreativeLogo({
  data,
  placement,
  fallback,
  className = '',
  withContainer = false,
}: CreativeLogoProps) {
  const config = getLogoConfig(data, placement)
  if (!config.show) return null

  const imgEl = data.logoUrl ? (
    <img src={data.logoUrl} alt="" className={className} style={logoStyle(config)} />
  ) : fallback ? (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: config.size,
        height: config.size,
        borderRadius: config.radius >= 999 ? '50%' : config.radius,
        flexShrink: 0,
      }}
    >
      {fallback}
    </div>
  ) : null

  if (!imgEl) return null

  if (placement === 'avatar' && config.border) {
    return (
      <div
        className="overflow-hidden shadow"
        style={{
          borderRadius: config.radius >= 999 ? '50%' : config.radius,
          border: `${config.border}px solid white`,
          width: config.size,
          height: config.size,
          flexShrink: 0,
        }}
      >
        {data.logoUrl ? (
          <img src={data.logoUrl} alt="" style={{ ...logoStyle(config), borderRadius: 0 }} />
        ) : (
          fallback
        )}
      </div>
    )
  }

  if (withContainer && config.containerSize) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-white/15 backdrop-blur ${className}`}
        style={{ width: config.containerSize, height: config.containerSize, flexShrink: 0 }}
      >
        {data.logoUrl ? (
          <img
            src={data.logoUrl}
            alt=""
            style={{
              width: config.size,
              height: config.size,
              objectFit: config.fit,
              borderRadius: config.radius >= 999 ? '50%' : config.radius,
            }}
          />
        ) : (
          fallback
        )}
      </div>
    )
  }

  return imgEl
}

export function FooterLogo({ data }: { data: CreativeData }) {
  const config = getLogoConfig(data, 'footer')
  if (!config.show) return null

  const fs = data.footerFontSize

  if (data.logoUrl) {
    return <img src={data.logoUrl} alt="" className="rounded-lg object-contain" style={logoStyle(config)} />
  }

  return (
    <div
      className="flex items-center justify-center rounded-lg font-bold text-white"
      style={{
        width: config.size,
        height: config.size,
        fontSize: fs * 0.9,
        background: data.accentColor,
        borderRadius: config.radius >= 999 ? '50%' : config.radius,
      }}
    >
      {(data.footerLine1 || 'B')[0]}
    </div>
  )
}

import type { CreativeData, LayerId } from '../types/creative'

export interface LayerMeta {
  id: LayerId
  label: string
  description: string
  visible: boolean
  tool: 'media' | 'content' | 'brand' | 'style' | 'position'
}

const DEFAULT_ORDER: LayerId[] = ['background', 'image', 'content', 'logo', 'footer', 'watermark', 'qr']

export function normalizeLayerOrder(order?: LayerId[]): LayerId[] {
  const base = Array.isArray(order) ? [...order] : [...DEFAULT_ORDER]
  for (const id of DEFAULT_ORDER) {
    if (!base.includes(id)) base.push(id)
  }
  return base.filter((id, i) => base.indexOf(id) === i)
}

export function layerZIndex(order: LayerId[], id: LayerId): number {
  return normalizeLayerOrder(order).indexOf(id) + 1
}

export function getLayers(data: CreativeData): LayerMeta[] {
  const order = normalizeLayerOrder(data.layerOrder)
  const map: Record<LayerId, Omit<LayerMeta, 'id' | 'visible'>> = {
    background: { label: 'Background', description: 'Template base & theme colors', tool: 'style' },
    image: { label: 'Photo / Media', description: 'Property photo or hero image', tool: 'media' },
    content: { label: 'Text & Content', description: 'Headlines, body, metrics', tool: 'content' },
    logo: { label: 'Logo', description: 'Brand logo placements', tool: 'brand' },
    footer: { label: 'Footer', description: 'Contact bar & company info', tool: 'style' },
    watermark: { label: 'Watermark', description: 'Draft or brand stamp', tool: 'style' },
    qr: { label: 'QR Code', description: 'Scannable link overlay', tool: 'position' },
  }

  const visibility: Record<LayerId, boolean> = {
    background: true,
    image: data.showCreativeImage && !!data.imageUrl,
    content: true,
    logo: !!(data.logoUrl && (data.headerShowLogo || data.heroShowLogo || data.footerShowLogo)),
    footer: data.showFooter,
    watermark: data.showWatermark,
    qr: data.showQrCode,
  }

  return order.map((id) => ({
    id,
    ...map[id],
    visible: visibility[id],
  }))
}

export function moveLayer(order: LayerId[], id: LayerId, direction: 'up' | 'down'): LayerId[] {
  const next = normalizeLayerOrder(order)
  const idx = next.indexOf(id)
  if (idx < 0) return next
  const swap = direction === 'up' ? idx - 1 : idx + 1
  if (swap < 0 || swap >= next.length) return next
  ;[next[idx], next[swap]] = [next[swap], next[idx]]
  return next
}

export function setLayerVisible(_data: CreativeData, id: LayerId, visible: boolean): Partial<CreativeData> {
  switch (id) {
    case 'image':
      return { showCreativeImage: visible }
    case 'footer':
      return { showFooter: visible }
    case 'watermark':
      return { showWatermark: visible }
    case 'qr':
      return { showQrCode: visible }
    case 'logo':
      return { headerShowLogo: visible, heroShowLogo: visible, footerShowLogo: visible }
    default:
      return {}
  }
}

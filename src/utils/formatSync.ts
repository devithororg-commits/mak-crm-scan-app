import type { AspectRatio, CreativeData } from '../types/creative'

/** Per-aspect layout tweaks so one content edit reflows across all export sizes */
export function getFormatAdaptedData(data: CreativeData, targetAspect: AspectRatio): CreativeData {
  if (data.formatSyncEnabled === false) {
    return { ...data, aspectRatio: targetAspect }
  }

  const patch: Partial<CreativeData> = { aspectRatio: targetAspect }

  switch (targetAspect) {
    case '9:16':
      patch.titleFontSize = Math.min(72, Math.round(data.titleFontSize * 1.08))
      patch.subtitleFontSize = Math.min(36, Math.round(data.subtitleFontSize * 1.05))
      patch.imageCoverHeight = Math.min(320, data.imageCoverHeight + 48)
      patch.contentOffsetY = data.contentOffsetY - 12
      patch.footerPadding = Math.max(8, data.footerPadding - 4)
      patch.textScale = Math.min(160, data.textScale + 3)
      break
    case '16:9':
      patch.titleFontSize = Math.max(18, Math.round(data.titleFontSize * 0.9))
      patch.bodyFontSize = Math.max(12, data.bodyFontSize - 1)
      patch.imageCoverHeight = Math.max(96, data.imageCoverHeight - 36)
      patch.contentOffsetY = data.contentOffsetY + 4
      patch.footerPadding = Math.max(8, data.footerPadding - 2)
      break
    case '4:5':
      patch.titleFontSize = Math.round(data.titleFontSize * 0.98)
      patch.imageCoverHeight = Math.min(280, data.imageCoverHeight + 16)
      break
    case '1:1':
    default:
      break
  }

  return { ...data, ...patch }
}

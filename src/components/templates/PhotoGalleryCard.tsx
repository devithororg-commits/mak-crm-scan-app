import type { CreativeData } from '../../types/creative'
import { buildImageCssFilter } from '../../utils/imageFilters'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

function GalleryImage({ data, src }: { data: CreativeData; src: string }) {
  const cssFilter = buildImageCssFilter(
    data.imageFilter || 'none',
    data.imageBrightness ?? 100,
    data.imageContrast ?? 100,
    data.imageSaturation ?? 100,
  )
  return (
    <div className="relative h-full w-full overflow-hidden">
      <img src={src} alt="" className="h-full w-full object-cover" style={{ filter: cssFilter }} />
      {data.imageGradientOverlay && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(to top, rgba(0,0,0,${(data.imageGradientStrength ?? 50) / 100}) 0%, transparent 50%)`,
          }}
        />
      )}
    </div>
  )
}

export default function PhotoGalleryCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const photos = data.imageGallery.filter(Boolean)
  const display = photos.length > 0 ? photos : data.imageUrl ? [data.imageUrl] : []
  const count = display.length

  const gridClass =
    count === 1 ? 'grid-cols-1' :
    count === 2 ? 'grid-cols-2' :
    count === 3 ? 'grid-cols-3' :
    'grid-cols-2'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900 shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
      <Watermark data={data} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        {display.length > 0 ? (
          <div className={`grid ${gridClass} min-h-0 flex-1 gap-1`} style={{ maxHeight: '65%' }}>
            {display.slice(0, 4).map((src, i) => (
              <div
                key={i}
                className={`relative overflow-hidden ${count === 3 && i === 0 ? 'col-span-2 row-span-2' : ''} ${count >= 4 && i === 0 ? 'col-span-2 row-span-2' : ''}`}
              >
                <GalleryImage data={data} src={src} />
                {count > 4 && i === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-bold text-white">
                    +{count - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <p className="text-sm text-slate-400">Upload photos in Media Editor</p>
          </div>
        )}

        <div className="flex flex-col p-8">
          {data.badge && (
            <span
              className="mb-3 inline-flex w-fit rounded-full px-4 py-1 font-semibold text-white"
              style={{ ...t.label, background: data.accentColor }}
            >
              <HighlightText text={data.badge} data={data} />
            </span>
          )}
          <h2 className="font-bold leading-tight" style={t.title}>
            <HighlightText text={data.propertyTitle || data.title || 'Property Gallery'} data={data} />
          </h2>
          <p className="mt-2 text-slate-500" style={t.subtitle}>
            {data.propertyPrice && <span className="font-semibold text-slate-800">{data.propertyPrice} · </span>}
            {data.propertyAddress || data.subtitle}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { label: 'Beds', value: data.propertyBeds },
              { label: 'Baths', value: data.propertyBaths },
              { label: 'Sqft', value: data.propertySqft },
            ].filter((m) => m.value).map((m) => (
              <div key={m.label} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="font-bold" style={{ ...t.metric, color: data.accentColor }}>{m.value}</p>
                <p className="text-slate-400" style={t.label}>{m.label}</p>
              </div>
            ))}
          </div>

          {data.ctaText && (
            <div className="mt-6">
              <span
                className="inline-block rounded-full px-6 py-3 font-semibold text-white"
                style={{ ...t.subtitle, background: data.accentColor }}
              >
                <HighlightText text={data.ctaText} data={data} />
              </span>
            </div>
          )}
        </div>
      </div>

      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

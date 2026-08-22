import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import { TemplateLayout } from './CreativeImage'
import CreativeLogo from './CreativeLogo'

interface Props {
  data: CreativeData
  slideIndex?: number
}

export default function CarouselSlideCard({ data, slideIndex }: Props) {
  const t = getTypography(data)
  const slide = data.carouselSlides[slideIndex ?? data.activeCarouselSlide] ?? data.carouselSlides[0]
  const total = data.carouselSlides.length
  const current = (slideIndex ?? data.activeCarouselSlide) + 1

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white text-slate-900">
      <Watermark data={data} />
      <div className="flex flex-1 flex-col p-10">
        <TemplateLayout
          data={data}
          header={
            <div className="mb-6 flex shrink-0 items-center justify-between">
              <CreativeLogo
                data={data}
                placement="header"
                fallback={
                  <div
                    className="flex h-full w-full items-center justify-center rounded-lg font-bold text-white"
                    style={{ background: data.accentColor, fontSize: 14 }}
                  >
                    {(data.companyName || 'B')[0]}
                  </div>
                }
              />
              <span
                className="rounded-full px-3 py-1 font-semibold text-white"
                style={{ ...t.label, background: data.accentColor }}
              >
                {slide.badge || `${current}/${total}`}
              </span>
            </div>
          }
        >
          <p className="mb-2 font-medium uppercase tracking-wider text-slate-400" style={t.label}>
            {data.eyebrow || data.companyName}
          </p>
          <h2 className="mb-3 font-bold leading-tight" style={t.title}>{slide.title}</h2>
          {slide.subtitle && <p className="mb-4 text-slate-500" style={t.subtitle}>{slide.subtitle}</p>}
          <p className="leading-relaxed text-slate-600" style={t.body}>{slide.body}</p>

          <div className="mt-auto flex gap-1.5 pt-8">
            {data.carouselSlides.map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: i === (slideIndex ?? data.activeCarouselSlide) ? data.accentColor : '#e2e8f0' }}
              />
            ))}
          </div>
        </TemplateLayout>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

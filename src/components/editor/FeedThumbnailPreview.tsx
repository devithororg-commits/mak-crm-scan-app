import { useCreative } from '../../store/CreativeContext'
import { aspectDimensions, fontFamilyCss } from '../../utils/exportImage'
import TemplateRenderer from '../templates/TemplateRenderer'

/** Simulates ~150px feed thumbnail — how the post looks in a crowded scroll */
export default function FeedThumbnailPreview() {
  const { data } = useCreative()
  const feedWidth = 150
  const { width, height } = aspectDimensions(data.aspectRatio)
  const scale = feedWidth / width
  const previewSlide = data.carouselEnabled ? data.activeCarouselSlide : undefined

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Feed thumbnail (~150px)</p>
      <div
        className="overflow-hidden rounded-lg shadow-md ring-1 ring-slate-200"
        style={{ width: feedWidth, height: height * scale }}
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            fontFamily: fontFamilyCss(data.fontFamily),
          }}
        >
          <TemplateRenderer data={data} slideIndex={previewSlide} />
        </div>
      </div>
      <p className="max-w-[160px] text-center text-[9px] text-slate-400">
        Can you read the headline at this size?
      </p>
    </div>
  )
}

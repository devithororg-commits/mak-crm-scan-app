import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { Headline, PhotoBackground, SectionLabel } from './templateShared'

export default function ReelCoverCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl text-white">
      <Watermark data={data} />
      <PhotoBackground data={data} overlay={`linear-gradient(180deg, transparent 30%, ${hexToRgba('#000', 0.9)})`} />
      <div className="absolute left-4 top-4 rounded-lg bg-gradient-to-r from-pink-500 to-orange-500 px-3 py-1 font-bold" style={t.label}>REEL</div>
      <div className="absolute right-4 top-1/2 flex flex-col gap-3">
        {[data.metric1Value || '12K', data.metric2Value || '890', data.metric3Value || '45'].map((v, i) => (
          <div key={i} className="text-center"><p className="font-bold" style={t.metric}>{v}</p><p className="text-white/50" style={{ fontSize: 8 }}>{['Views', 'Likes', 'Shares'][i]}</p></div>
        ))}
      </div>
      <div className="relative mt-auto p-6">
        <SectionLabel data={data} t={t} text={data.socialHandle || data.eyebrow || '@yourbrand'} />
        <Headline data={data} t={t} scale={1.1} />
        <p className="mt-2 line-clamp-2 text-white/70" style={t.body}><HighlightText text={data.description || data.subtitle || 'Swipe up for the full story →'} data={data} /></p>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

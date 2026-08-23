import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function SplitDiagonalCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const accent = data.accentColor
  const coverUrl = data.showCreativeImage && data.imageUrl ? data.imageUrl : ''

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-slate-900 text-white">
      <Watermark data={data} />

      <div className="relative min-h-0 flex-1">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400" />
        )}

        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 55%, 100% 35%, 100% 100%, 0 100%)',
            background: `linear-gradient(135deg, ${hexToRgba(accent, 0.95)}, ${hexToRgba(data.secondaryColor, 0.9)})`,
          }}
        />

        <div className="absolute inset-0 flex flex-col justify-end p-6" style={{ clipPath: 'polygon(0 55%, 100% 35%, 100% 100%, 0 100%)' }}>
          <CreativeLogo
            data={data}
            placement="header"
            fallback={<span className="font-bold tracking-wider" style={t.label}>{data.companyName || 'BRAND'}</span>}
          />

          <h2 className="mt-3 max-w-[90%] font-extrabold leading-none" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.25 }}>
            <HighlightText text={data.title || '**Split** the Feed'} data={data} />
          </h2>
          <p className="mt-2 max-w-xs text-white/80" style={t.body}>
            <HighlightText text={data.description || data.subtitle || 'Asymmetric layouts that stop the scroll.'} data={data} />
          </p>

          {data.highlights.filter(Boolean).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.highlights.filter(Boolean).slice(0, 3).map((h, i) => (
                <span key={i} className="rounded-full bg-white/15 px-2.5 py-0.5 backdrop-blur-sm" style={t.label}>{h}</span>
              ))}
            </div>
          )}

          {data.ctaText && (
            <span className="mt-4 inline-block w-fit rounded-full bg-white px-5 py-2 font-bold text-slate-900" style={t.label}>
              <HighlightText text={data.ctaText} data={data} />
            </span>
          )}
        </div>

        <div className="absolute left-6 top-6 max-w-[40%]">
          <p className="font-medium uppercase tracking-widest text-white/90 drop-shadow-lg" style={t.label}>
            {data.eyebrow || data.badge || 'NEW DROP'}
          </p>
          {data.metric1Value && (
            <p className="mt-1 font-extrabold drop-shadow-lg" style={{ ...t.metric, color: '#fff' }}>{data.metric1Value}</p>
          )}
        </div>
      </div>

      <CreativeFooter data={data} />
    </div>
  )
}

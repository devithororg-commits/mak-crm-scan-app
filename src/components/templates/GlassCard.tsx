import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'

export default function GlassCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const brand = data.companyName || data.eyebrow || 'Your Brand'
  const headline = data.title || 'Describe your **idea**, we turn it into **startup ideas**.'
  const subtext = data.description || data.subtitle || 'Real startup ideas, revenue data, and profitable patterns to build from.'

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 0% 0%, rgba(253, 186, 116, 0.45) 0%, transparent 55%),
          radial-gradient(ellipse 70% 50% at 100% 100%, rgba(251, 146, 60, 0.35) 0%, transparent 50%),
          linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 40%, #FFFFFF 100%)
        `,
      }}
    >
      <Watermark data={data} />

      <div className="flex min-h-0 flex-1 items-center justify-center p-10">
        <div
          className="w-full max-w-[88%] rounded-[28px] border border-white/70 p-10 shadow-[0_8px_40px_rgba(0,0,0,0.06)]"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <div className="mb-8 flex items-center gap-3">
            {data.logoUrl && data.headerShowLogo ? (
              <CreativeLogo data={data} placement="header" />
            ) : (
              <span className="text-xl font-extrabold tracking-tight text-slate-900" style={t.subtitle}>
                {brand}
              </span>
            )}
          </div>

          <h2
            className="font-bold leading-[1.15] tracking-tight text-slate-900"
            style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.15 }}
          >
            <HighlightText text={headline} data={data} />
          </h2>

          <p className="mt-5 max-w-lg leading-relaxed text-slate-700" style={{ ...t.body, fontSize: (t.body.fontSize as number) * 1.05 }}>
            <HighlightText text={subtext} data={data} />
          </p>

          {data.ctaText && (
            <span
              className="mt-8 inline-block rounded-full px-6 py-3 font-semibold text-white shadow-lg"
              style={{ ...t.subtitle, background: `linear-gradient(135deg, ${data.accentColor}, ${data.secondaryColor})` }}
            >
              <HighlightText text={data.ctaText} data={data} />
            </span>
          )}
        </div>
      </div>

      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

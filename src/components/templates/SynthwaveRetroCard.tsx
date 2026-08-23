import type { CreativeData } from '../../types/creative'
import { hexToRgba } from '../../utils/color'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'
import { CtaButton, Headline, SectionLabel } from './templateShared'

function SunGraphic() {
  return (
    <svg className="absolute bottom-0 left-0 right-0 w-full opacity-40" viewBox="0 0 400 120" preserveAspectRatio="none">
      <path d="M0 120 L0 80 Q200 20 400 80 L400 120 Z" fill="url(#sunGrad)" />
      <defs>
        <linearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6EC7" />
          <stop offset="100%" stopColor="#7873F5" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function SynthwaveRetroCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#1a0a2e] text-white">
      <Watermark data={data} />
      <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b69 50%, #ff6ec7 100%)' }} />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,110,199,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,110,199,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(200px) rotateX(60deg)',
          transformOrigin: 'bottom',
        }}
      />
      <SunGraphic />
      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center">
        <SectionLabel data={data} t={t} text={data.eyebrow || '▸ RETRO WAVE'} />
        <Headline
          data={data}
          t={t}
          scale={1.3}
          className="font-extrabold uppercase"
        />
        <p className="mt-3 max-w-xs text-pink-200/70" style={t.body}><HighlightText text={data.description || 'Neon nights. Infinite vibes. Pure 80s energy.'} data={data} /></p>
        <div className="mt-4"><CtaButton data={data} t={t} style={{ background: `linear-gradient(135deg, #FF6EC7, #7873F5)`, boxShadow: `0 0 20px ${hexToRgba('#FF6EC7', 0.5)}` }} /></div>
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

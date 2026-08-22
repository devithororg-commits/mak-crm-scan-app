import { Heart, MessageCircle, Repeat2, Send } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import HighlightText from './HighlightText'

export default function HookPostCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const headerLeft = data.eyebrow || 'Follow for more'
  const handle = data.socialHandle || '@yourbrand'
  const headline = data.title || 'Why Copy & Paste **Inspiration** is killing Your Design Growth.'
  const sub = data.subtitle || data.description || 'And what real designers do instead'
  const cta = data.ctaText || 'Read Caption'

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl text-slate-900"
      style={{
        background: 'linear-gradient(160deg, #F8FAFC 0%, #EEF2FF 50%, #FDF4FF 100%)',
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px),
          linear-gradient(160deg, #F8FAFC 0%, #EEF2FF 50%, #FDF4FF 100%)`,
        backgroundSize: '32px 32px, 32px 32px, 100% 100%',
      }}
    >
      <Watermark data={data} />

      <div className="relative flex min-h-0 flex-1 flex-col p-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <p className="text-sm text-slate-500" style={t.label}>{headerLeft}</p>
          <p className="text-sm font-medium text-slate-700" style={t.label}>{handle}</p>
        </div>

        {/* Main */}
        <div className="flex flex-1 flex-col justify-center py-8">
          <h2 className="max-w-lg font-bold leading-[1.15] tracking-tight text-slate-900" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.15 }}>
            <HighlightText text={headline} data={data} />
          </h2>
          <p className="mt-5 font-medium text-slate-700" style={{ ...t.subtitle, fontSize: (t.subtitle.fontSize as number) * 1.05 }}>
            <HighlightText text={sub} data={data} />
          </p>
        </div>

        {/* Social footer */}
        <div className="flex items-center justify-between border-t border-slate-200/80 pt-4">
          <div className="flex items-center gap-5 text-slate-500">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
            <Repeat2 className="h-5 w-5" strokeWidth={1.75} />
            <Send className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-medium text-slate-600" style={t.label}>{cta}</span>
        </div>
      </div>
      {data.showFooter && <CreativeFooter data={data} />}
    </div>
  )
}

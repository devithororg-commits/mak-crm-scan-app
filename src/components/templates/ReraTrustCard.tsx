import { ShieldCheck, BadgeCheck } from 'lucide-react'
import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'
import HighlightsList from './HighlightsList'

export default function ReraTrustCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white">
      <Watermark data={data} />

      <div className="relative flex min-h-0 flex-1 flex-col p-10">
        <CreativeLogo
          data={data}
          placement="header"
          fallback={
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
          }
        />

        {data.badge && (
          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/20 px-4 py-1.5 font-bold text-emerald-300" style={t.label}>
            <BadgeCheck className="h-3.5 w-3.5" />
            <HighlightText text={data.badge} data={data} />
          </span>
        )}

        <h2 className="font-bold leading-tight" style={t.title}>
          <HighlightText text={data.title || 'RERA Approved Project'} data={data} />
        </h2>
        <p className="mt-2 text-white/70" style={t.subtitle}>
          <HighlightText text={data.companyName || data.eyebrow || 'Your Company Name'} data={data} />
        </p>

        <div className="my-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400" style={t.label}>RERA Registration</p>
          <p className="mt-1 font-mono font-bold text-emerald-200" style={{ ...t.metric, letterSpacing: '0.05em' }}>
            {data.reraNumber || 'P02400001288'}
          </p>
        </div>

        {data.description && (
          <p className="text-white/75" style={t.body}>
            <HighlightText text={data.description} data={data} />
          </p>
        )}

        <div className="mt-6 min-h-0 flex-1">
          <HighlightsList data={data} light />
        </div>

        {data.ctaText && (
          <span className="mt-6 inline-block self-start rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white" style={t.subtitle}>
            <HighlightText text={data.ctaText} data={data} />
          </span>
        )}
      </div>

      <CreativeFooter data={data} />
    </div>
  )
}

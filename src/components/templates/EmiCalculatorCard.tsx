import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'

export default function EmiCalculatorCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const emi = data.metric1Value || '₹45,200'
  const tenure = data.metric2Value || '20 Years'
  const rate = data.metric3Value || '8.5%'
  const loanAmount = data.propertyPrice || data.currentValue || '₹75 Lakh'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Watermark data={data} />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(99,102,241,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.3) 0%, transparent 50%)',
      }} />

      <div className="relative flex min-h-0 flex-1 flex-col p-8">
        <div className="mb-6 flex items-center justify-between">
          <CreativeLogo
            data={data}
            placement="header"
            fallback={
              <div
                className="flex items-center justify-center rounded-lg bg-indigo-500 font-bold text-white"
                style={{ width: data.headerLogoSize, height: data.headerLogoSize }}
              >
                {(data.companyName || 'M')[0]}
              </div>
            }
          />
          <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-indigo-200 backdrop-blur-sm" style={t.label}>
            EMI Calculator
          </span>
        </div>

        <p className="font-medium uppercase tracking-wider text-indigo-300" style={t.label}>
          {data.eyebrow || data.propertyType || 'Home Loan'}
        </p>
        <h2 className="mt-1 font-bold leading-tight" style={t.title}>
          {data.propertyTitle || data.title || 'Dream Home Financing'}
        </h2>
        <p className="mt-2 text-white/60" style={t.subtitle}>{data.propertyAddress || data.subtitle}</p>

        <div className="my-8 flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <p className="font-medium uppercase tracking-widest text-indigo-300" style={t.label}>
            {data.metric1Label || 'Monthly EMI'}
          </p>
          <p className="mt-2 font-extrabold tracking-tight text-white" style={{ ...t.title, fontSize: (t.title.fontSize as number) * 1.4 }}>
            {emi}
            <span className="text-lg font-medium text-white/50">/mo</span>
          </p>
          <p className="mt-3 text-white/50" style={t.body}>
            Loan amount: <span className="font-semibold text-white/80">{loanAmount}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-white/50" style={t.label}>{data.metric2Label || 'Tenure'}</p>
            <p className="mt-1 font-bold text-white" style={t.metric}>{tenure}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="text-white/50" style={t.label}>{data.metric3Label || 'Interest Rate'}</p>
            <p className="mt-1 font-bold text-white" style={t.metric}>{rate}</p>
          </div>
        </div>

        {data.highlights.filter(Boolean).length > 0 && (
          <ul className="mt-5 space-y-2">
            {data.highlights.filter(Boolean).slice(0, 3).map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-white/70" style={t.body}>
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                {h}
              </li>
            ))}
          </ul>
        )}

        {data.ctaText && (
          <div className="mt-auto pt-6">
            <span className="inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30" style={t.subtitle}>
              {data.ctaText}
            </span>
          </div>
        )}
      </div>
      <CreativeFooter data={data} />
    </div>
  )
}

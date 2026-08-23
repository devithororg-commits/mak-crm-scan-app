import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import CreativeFooter, { Watermark } from './CreativeFooter'
import CreativeLogo from './CreativeLogo'
import HighlightText from './HighlightText'
import { TemplateLayout } from './CreativeImage'

function BlueprintGrid() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="bpGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e40af" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bpGrid)" />
    </svg>
  )
}

export default function BlueprintEstateCard({ data }: { data: CreativeData }) {
  const t = getTypography(data)
  const scale = data.badge || '1:100'
  const drawingNo = data.publishedDate || 'DWG-2026-001'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#0c1a3a] text-blue-100">
      <Watermark data={data} />
      <BlueprintGrid />

      <div className="relative flex items-center justify-between border-b border-dashed border-blue-400/30 px-6 py-3">
        <CreativeLogo
          data={data}
          placement="header"
          fallback={<span className="font-mono font-bold tracking-wider text-blue-200" style={t.label}>ARCH.DESIGN</span>}
        />
        <div className="text-right font-mono text-blue-300/70" style={t.label}>
          <p>SCALE {scale}</p>
          <p>{drawingNo}</p>
        </div>
      </div>

      <TemplateLayout data={{ ...data, imageCoverHeight: data.imageCoverHeight || 150 }}>
        <div className="relative flex min-h-0 flex-1 flex-col px-6 py-4">
          <p className="font-mono uppercase tracking-[0.3em] text-blue-400" style={t.label}>
            <HighlightText text={data.eyebrow || 'FLOOR PLAN · ELEVATION'} data={data} />
          </p>

          <h2 className="mt-1 font-bold leading-tight text-white" style={{ ...t.title, fontFamily: 'monospace' }}>
            <HighlightText text={data.propertyTitle || data.title || '**Skyline** Residences'} data={data} />
          </h2>

          <div className="my-4 grid grid-cols-2 gap-3 border border-dashed border-blue-400/40 p-3">
            {[
              { label: 'BHK', value: data.propertyType || '3 BHK' },
              { label: 'AREA', value: data.propertySqft ? `${data.propertySqft} sqft` : '1,850 sqft' },
              { label: 'PRICE', value: data.propertyPrice || '₹1.25 Cr' },
              { label: 'RERA', value: data.reraNumber || 'P02400001288' },
            ].map((m) => (
              <div key={m.label} className="border-l-2 border-blue-400 pl-2">
                <p className="font-mono text-blue-400/60" style={t.label}>{m.label}</p>
                <p className="font-mono font-bold text-white" style={t.metric}>{m.value}</p>
              </div>
            ))}
          </div>

          {data.highlights.filter(Boolean).length > 0 && (
            <ul className="space-y-1 font-mono text-blue-200/80" style={t.body}>
              {data.highlights.filter(Boolean).slice(0, 4).map((h, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blue-400">▸</span> {h}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 text-blue-300/60" style={t.body}>
            <HighlightText text={data.description || data.propertyAddress || 'Premium gated community · Downtown District'} data={data} />
          </p>

          {data.ctaText && (
            <div className="mt-auto pt-4">
              <span className="inline-block border-2 border-blue-400 px-6 py-2.5 font-mono font-bold uppercase tracking-wider text-blue-100">
                <HighlightText text={data.ctaText} data={data} />
              </span>
            </div>
          )}
        </div>
      </TemplateLayout>

      <CreativeFooter data={data} />
    </div>
  )
}

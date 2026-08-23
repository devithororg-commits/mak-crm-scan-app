import { useCreative } from '../../store/CreativeContext'
import { PLATFORMS } from '../../data/config'
import type { CaptionTone, Platform } from '../../types/creative'
import { generateCaptions, generateCaptionVariants } from '../../utils/captionGenerator'
import { hasStudioCaptions } from '../../utils/studioCaptions'
import { Section, inputClass } from './FormUI'
import { useMemo, useState } from 'react'
import { Copy, Check, RefreshCw, Zap } from 'lucide-react'
import { AppIcon, PLATFORM_COLORS } from '../icons'

const TONES: { id: CaptionTone; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'casual', label: 'Casual' },
  { id: 'sales', label: 'Sales' },
  { id: 'educational', label: 'Educational' },
]

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-emerald-600 bg-emerald-500/15' : score >= 55 ? 'text-amber-600 bg-amber-500/15' : 'text-slate-400 bg-slate-50'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${color}`}>
      <Zap className="h-2.5 w-2.5" />
      {score}%
    </span>
  )
}

export default function CaptionGenerator() {
  const { data } = useCreative()
  const [tone, setTone] = useState<CaptionTone>('professional')
  const [activePlatform, setActivePlatform] = useState<Platform>('instagram')
  const [copied, setCopied] = useState('')
  const captions = useMemo(() => generateCaptions(data, tone), [data, tone])
  const variants = useMemo(
    () => generateCaptionVariants(data, activePlatform, tone, 3),
    [data, activePlatform, tone],
  )

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const cap = captions[activePlatform]

  return (
    <Section title="AI Captions & Hashtags" desc="Platform-optimized copy with A/B variants & engagement scores">
      {hasStudioCaptions() && (
        <p className="mb-3 rounded-lg border border-indigo-100 bg-indigo-50/80 px-3 py-2 text-[10px] text-indigo-800">
          Smart Fill captions active — tone buttons apply to fallback copy only.
        </p>
      )}
      <div className="mb-3 flex gap-1.5">
        {TONES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTone(t.id)}
            className={`flex-1 rounded-lg border py-2 text-[10px] font-medium transition ${
              tone === t.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {PLATFORMS.filter((p) => p.id !== 'custom').map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActivePlatform(p.id as Platform)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition ${
              activePlatform === p.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'
            }`}
          >
            <AppIcon name={p.icon} size={12} className={PLATFORM_COLORS[p.icon] ?? ''} />
            {p.label}
            <span className="ml-1 text-[8px] opacity-60">{captions[p.id as Platform].engagementScore}%</span>
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900">Primary Caption</span>
          <div className="flex items-center gap-2">
            <ScoreBadge score={cap.engagementScore} />
            <span className="text-[9px] text-slate-500">{cap.charCount} chars</span>
            <button
              type="button"
              onClick={() => copy(`${cap.caption}\n\n${cap.hashtags}`, 'primary')}
              className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-700"
            >
              {copied === 'primary' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              Copy
            </button>
          </div>
        </div>
        <p className="mb-1 text-[10px] font-medium text-amber-600/80">Hook: {cap.hook}</p>
        <textarea readOnly rows={4} value={cap.caption} className={`${inputClass} mb-2 text-[11px]`} />
        {cap.hashtags && <input readOnly value={cap.hashtags} className={`${inputClass} text-[10px] text-indigo-700`} />}
      </div>

      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">A/B Variants (ranked by score)</p>
      <div className="space-y-2">
        {variants.map((v, i) => (
          <div key={v.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-900">
                Variant {String.fromCharCode(65 + i)} — {v.hook}
              </span>
              <div className="flex items-center gap-2">
                <ScoreBadge score={v.engagementScore} />
                <button
                  type="button"
                  onClick={() => copy(`${v.caption}\n\n${v.hashtags}`, v.id)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-700"
                >
                  {copied === v.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <p className="line-clamp-3 text-[10px] leading-relaxed text-slate-400">{v.caption}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setTone((t) => TONES[(TONES.findIndex((x) => x.id === t) + 1) % TONES.length].id)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs text-slate-400 hover:text-slate-900"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Rotate tone style
      </button>
    </Section>
  )
}

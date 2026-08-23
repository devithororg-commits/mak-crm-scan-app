import { useCallback, useState } from 'react'
import { CheckCircle2, Loader2, LogIn, Sparkles, Wand2 } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { useStudioAuth } from '../../context/StudioAuthContext'
import { applyTemplateSwitch } from '../../data/presets'
import type { TemplateId } from '../../types/creative'
import { loadCompanyDna } from '../../utils/companyDnaStorage'
import { checkStudioHealth, isStudioApiConfigured, requestSmartFill } from '../../utils/smartFillClient'
import { saveStudioCaptions } from '../../utils/studioCaptions'
import { recordTemplateUse } from '../../utils/themeEngine'
import { Section, inputClass } from './FormUI'
import { useToast } from '../ux/ToastProvider'
import { TEMPLATES } from '../../data/config'

export default function SmartFillPanel() {
  const { setData, setEditSection } = useCreative()
  const { loggedIn, openLogin } = useStudioAuth()
  const { toast } = useToast()
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState<'english' | 'telugu' | 'hinglish'>('english')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<{ template?: string; research?: string } | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const configured = isStudioApiConfigured()

  const applyResult = useCallback(async () => {
    if (!loggedIn) {
      openLogin()
      toast('Login with company email first', 'error')
      return
    }
    if (!topic.trim()) {
      toast('Enter a topic first', 'error')
      return
    }
    if (!confirmed) {
      toast('Confirm facts will be verified before publishing', 'error')
      return
    }

    setLoading(true)
    setPreview(null)
    try {
      const healthy = await checkStudioHealth()
      if (!healthy) throw new Error('Studio API unreachable')

      const dna = loadCompanyDna()
      const result = await requestSmartFill({ topic: topic.trim(), language, companyDna: dna })
      const { brief } = result
      const templateId = brief.templateId as TemplateId

      setData((prev) => {
        const base = applyTemplateSwitch(templateId, prev)
        return {
          ...base,
          ...brief,
          templateId,
          title: brief.title || base.title,
          description: brief.description || base.description,
          highlights: brief.highlights?.length ? brief.highlights : base.highlights,
          accentColor: brief.accentColor || dna.accentColor || base.accentColor,
          secondaryColor: brief.secondaryColor || dna.secondaryColor || base.secondaryColor,
          companyName: dna.companyName || base.companyName,
          phone: dna.phone || base.phone,
          website: dna.website || base.website,
          socialHandle: dna.socialHandle || base.socialHandle,
          showCreativeImage: Boolean(result.imageUrl),
          imageUrl: result.imageUrl || base.imageUrl,
          imagePosition: result.imageUrl ? 'background' : base.imagePosition,
          imageGradientOverlay: Boolean(result.imageUrl),
          imageGradientStrength: 45,
          showFooter: base.showFooter,
        }
      })

      if (brief.captions) saveStudioCaptions(brief.captions)
      recordTemplateUse(templateId)

      const tplName = TEMPLATES.find((t) => t.id === templateId)?.name || templateId
      setPreview({ template: tplName, research: result.researchSummary })
      toast('Creative ready — review price & details, then export', 'success')
      setEditSection('content')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Smart fill failed', 'error')
    } finally {
      setLoading(false)
    }
  }, [topic, language, confirmed, loggedIn, openLogin, setData, setEditSection, toast])

  if (!configured) {
    return (
      <Section title="Smart Fill" desc="Topic → researched poster content (Human Studio)">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-relaxed text-amber-900">
          <p className="font-bold">API loading…</p>
          <p className="mt-1">Refresh the page. If this persists, check server config on apptesting.in.</p>
        </div>
      </Section>
    )
  }

  return (
    <Section title="Smart Fill" desc="Topic → layout, copy & photo — human-quality output">
      <div className="space-y-3">
        {!loggedIn && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-violet-200 bg-violet-50/80 px-3.5 py-3">
            <p className="text-[11px] text-violet-900">Login required for Smart Fill</p>
            <button
              type="button"
              onClick={openLogin}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-violet-700 px-2.5 py-1.5 text-[10px] font-bold text-white"
            >
              <LogIn className="h-3 w-3" />
              Login
            </button>
          </div>
        )}

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Topic</label>
          <textarea
            className={`${inputClass} min-h-[72px] resize-y`}
            placeholder="e.g. Gachibowli 3BHK gated community site visit March 2026"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={!loggedIn}
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Language tone</label>
          <select
            className={inputClass}
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            disabled={!loggedIn}
          >
            <option value="english">English (professional)</option>
            <option value="telugu">Telugu mix</option>
            <option value="hinglish">Hinglish (casual)</option>
          </select>
        </div>

        <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5" disabled={!loggedIn} />
          <span className="text-[11px] leading-relaxed text-slate-600">
            I will verify prices, RERA, and dates before publishing.
          </span>
        </label>

        <button
          type="button"
          disabled={loading || !topic.trim() || !loggedIn}
          onClick={applyResult}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-[12px] font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          {loading ? 'Researching…' : 'Generate Creative'}
        </button>

        {preview && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2.5 text-[11px] text-emerald-900">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Applied: {preview.template}
            </div>
            {preview.research && (
              <p className="mt-1 line-clamp-3 opacity-80">{preview.research}</p>
            )}
          </div>
        )}

        <p className="flex items-center gap-1 text-[10px] text-slate-400">
          <Sparkles className="h-3 w-3" />
          OpenAI + Tavily research — built-in estate photos (no extra API)
        </p>
      </div>
    </Section>
  )
}

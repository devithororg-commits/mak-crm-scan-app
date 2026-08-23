import { useEffect, useState } from 'react'
import { useCreative } from '../../store/CreativeContext'
import type { CompanyDna } from '../../types/studio'
import { DEFAULT_COMPANY_DNA, loadCompanyDna, saveCompanyDna, syncDnaToCreative } from '../../utils/companyDnaStorage'
import { Field, Section, inputClass } from './FormUI'
import { useToast } from '../ux/ToastProvider'

export default function CompanyDnaSection() {
  const { data, setData } = useCreative()
  const { toast } = useToast()
  const [dna, setDna] = useState<CompanyDna>(() => loadCompanyDna())

  useEffect(() => {
    setDna(loadCompanyDna())
  }, [])

  const update = <K extends keyof CompanyDna>(key: K, value: CompanyDna[K]) => {
    setDna((prev) => ({ ...prev, [key]: value }))
  }

  const save = () => {
    saveCompanyDna(dna)
    setData((prev) => ({ ...prev, ...syncDnaToCreative(dna) }))
    toast('Company profile saved for Smart Fill', 'success')
  }

  const reset = () => {
    setDna({ ...DEFAULT_COMPANY_DNA })
    saveCompanyDna(DEFAULT_COMPANY_DNA)
    toast('Company profile reset', 'info')
  }

  return (
    <Section title="Company Profile" desc="Smart Fill always uses your brand voice & contact info">
      <div className="space-y-3">
        <Field label="Company name">
          <input className={inputClass} value={dna.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="Your Company" />
        </Field>
        <Field label="Industry">
          <input className={inputClass} value={dna.industry} onChange={(e) => update('industry', e.target.value)} placeholder="Real Estate" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Phone">
            <input className={inputClass} value={dna.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 …" />
          </Field>
          <Field label="Website">
            <input className={inputClass} value={dna.website} onChange={(e) => update('website', e.target.value)} placeholder="www…" />
          </Field>
        </div>
        <Field label="Social handle">
          <input className={inputClass} value={dna.socialHandle} onChange={(e) => update('socialHandle', e.target.value)} placeholder="@yourbrand" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Brand color">
            <input type="color" className="h-10 w-full cursor-pointer rounded-lg border border-slate-200" value={dna.accentColor} onChange={(e) => update('accentColor', e.target.value)} />
          </Field>
          <Field label="Secondary">
            <input type="color" className="h-10 w-full cursor-pointer rounded-lg border border-slate-200" value={dna.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} />
          </Field>
        </div>
        <Field label="Default platform">
          <select className={inputClass} value={dna.defaultPlatform} onChange={(e) => update('defaultPlatform', e.target.value as CompanyDna['defaultPlatform'])}>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="facebook">Facebook</option>
          </select>
        </Field>
        <Field label="Legal disclaimer (footer)">
          <input className={inputClass} value={dna.disclaimer} onChange={(e) => update('disclaimer', e.target.value)} />
        </Field>
        <div className="flex gap-2">
          <button type="button" onClick={save} className="flex-1 rounded-xl bg-violet-600 py-2.5 text-[12px] font-bold text-white hover:bg-violet-700">
            Save Profile
          </button>
          <button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-3 py-2.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50">
            Reset
          </button>
        </div>
        {data.companyName && (
          <p className="text-[10px] text-slate-400">Canvas brand: {data.companyName}</p>
        )}
      </div>
    </Section>
  )
}

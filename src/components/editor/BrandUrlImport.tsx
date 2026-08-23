import { useState } from 'react'
import { Globe, Loader2, Sparkles } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { extractBrandFromUrl } from '../../utils/brandExtractor'
import { Section, Field, inputClass } from './FormUI'

export default function BrandUrlImport() {
  const { data, setData } = useCreative()
  const [url, setUrl] = useState(data.website ? `https://${data.website}` : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleExtract = async () => {
    setLoading(true)
    setError('')
    try {
      const brand = await extractBrandFromUrl(url)
      setData((prev) => ({
        ...prev,
        companyName: brand.title || prev.companyName,
        description: brand.description || prev.description,
        accentColor: brand.accentColor,
        secondaryColor: prev.secondaryColor,
        logoUrl: brand.logoUrl || prev.logoUrl,
        website: brand.website || prev.website,
        footerLine1: brand.title || prev.footerLine1,
        footerLine2: brand.website || prev.footerLine2,
        eyebrow: brand.title || prev.eyebrow,
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title="URL Brand Import" desc="Paste website URL — auto-extract logo, colors & name">
      <Field label="Website URL">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.yoursite.com"
              className={`${inputClass} pl-9`}
            />
          </div>
          <button
            type="button"
            onClick={handleExtract}
            disabled={loading || !url}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Import
          </button>
        </div>
      </Field>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
      <p className="text-[10px] text-slate-500">Extracts logo, theme color, company name and description from your website.</p>
    </Section>
  )
}

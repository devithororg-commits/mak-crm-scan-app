import { useState } from 'react'
import { Link, Loader2, Sparkles, ChevronDown, Globe } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { applyListingPreset } from '../../data/listingPresets'
import { extractListingFromUrl, embedListingImages, listingToCreativeData } from '../../utils/listingExtractor'
import { Section, inputClass } from './FormUI'

export default function ListingUrlImport() {
  const { data, setData } = useCreative()
  const [url, setUrl] = useState(data.listingUrl || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [open, setOpen] = useState(!!data.listingUrl)

  const handleImport = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const listing = await extractListingFromUrl(url)
      const patch = listingToCreativeData(listing)
      const embedded = await embedListingImages(patch)
      const statusPatch = applyListingPreset('just-listed', { ...data, ...embedded })
      setData((prev) => ({
        ...prev,
        ...embedded,
        ...statusPatch,
        listingUrl: url,
      }))
      setSuccess(`Imported: ${listing.propertyTitle}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Section title="" noPad>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-50">
            <Globe className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-800">Import from URL</p>
            <p className="text-[11px] text-slate-400">99acres · MagicBricks · Zillow</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.99acres.com/property..."
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={loading || !url.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link className="h-3.5 w-3.5" />}
              Import
            </button>
          </div>

          {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
          {success && (
            <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <Sparkles className="h-3 w-3" /> {success}
            </p>
          )}

          <p className="mt-2 text-[10px] text-slate-400">
            Auto-fills title, price, image, beds, baths → Just Listed template
          </p>
        </div>
      )}
    </Section>
  )
}

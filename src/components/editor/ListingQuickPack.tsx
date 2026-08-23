import { useState } from 'react'
import { Layers, Loader2, Sparkles } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { applyListingPreset } from '../../data/listingPresets'
import { applyTemplateSwitch } from '../../data/presets'
import { saveToLibrary } from '../../utils/contentLibrary'
import type { ListingData, TemplateId } from '../../types/creative'
import { Section } from './FormUI'

const PACK: {
  status: ListingData['listingStatus']
  label: string
  templateId: TemplateId
  desc: string
  iconClass: string
}[] = [
  { status: 'just-listed', label: 'Just Listed', templateId: 'just-listed', desc: 'New listing announcement', iconClass: 'bg-emerald-100 text-emerald-700' },
  { status: 'open-house', label: 'Open House', templateId: 'open-house', desc: 'Visit invite poster', iconClass: 'bg-violet-100 text-violet-700' },
  { status: 'price-drop', label: 'Price Drop', templateId: 'price-drop', desc: 'Reduced price alert', iconClass: 'bg-rose-100 text-rose-700' },
]

export default function ListingQuickPack() {
  const { data, setData } = useCreative()
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)

  const hasListing = Boolean(data.propertyTitle.trim() || data.propertyPrice.trim())

  const applyPackItem = (status: ListingData['listingStatus'], templateId: TemplateId) => {
    setData((prev) => {
      const switched = applyTemplateSwitch(templateId, prev)
      const patch = applyListingPreset(status, { ...prev, ...switched })
      return { ...switched, ...patch }
    })
  }

  const saveAllToLibrary = async () => {
    if (!hasListing) return
    setSaving(true)
    setSavedCount(0)
    try {
      for (const item of PACK) {
        const switched = applyTemplateSwitch(item.templateId, data)
        const patch = applyListingPreset(item.status, { ...data, ...switched })
        const snapshot = { ...switched, ...patch }
        saveToLibrary(snapshot, undefined, `${item.label}: ${data.propertyTitle || 'Listing'}`)
        setSavedCount((n) => n + 1)
      }
    } finally {
      setSaving(false)
      setTimeout(() => setSavedCount(0), 2500)
    }
  }

  return (
    <Section title="Listing Quick Pack" desc="One listing → 3 ready posters (Listed, Open House, Price Drop)">
      <div className="mb-3 grid gap-2">
        {PACK.map((item) => (
          <button
            key={item.status}
            type="button"
            onClick={() => applyPackItem(item.status, item.templateId)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition hover:border-violet-300 hover:bg-violet-50/50 ${
              data.listingStatus === item.status && data.templateId === item.templateId
                ? 'border-violet-400 bg-violet-50 ring-1 ring-violet-200'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-slate-900">{item.label}</p>
              <p className="text-[10px] text-slate-500">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!hasListing || saving}
        onClick={saveAllToLibrary}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-[11px] font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Layers className="h-4 w-4" />
        )}
        {savedCount > 0 ? `Saved ${savedCount} posters to library!` : 'Save All 3 to Library'}
      </button>

      {!hasListing && (
        <p className="mt-2 text-center text-[10px] text-amber-700">
          Fill property title or price above to enable bulk save
        </p>
      )}
    </Section>
  )
}

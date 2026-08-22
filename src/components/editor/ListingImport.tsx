import { useCreative } from '../../store/CreativeContext'
import { applyListingPreset } from '../../data/listingPresets'
import type { ListingData } from '../../types/creative'
import { Field, Section, inputClass } from './FormUI'

const STATUSES: { id: ListingData['listingStatus']; label: string; color: string }[] = [
  { id: 'just-listed', label: 'Just Listed', color: 'emerald' },
  { id: 'just-sold', label: 'Just Sold', color: 'amber' },
  { id: 'open-house', label: 'Open House', color: 'violet' },
  { id: 'price-drop', label: 'Price Drop', color: 'rose' },
]

const FIELDS = [
  { key: 'propertyTitle' as const, label: 'Property Title', ph: 'Luxury 3BHK Apartment' },
  { key: 'propertyPrice' as const, label: 'Price', ph: '₹1.25 Cr' },
  { key: 'propertyBeds' as const, label: 'Bedrooms', ph: '3' },
  { key: 'propertyBaths' as const, label: 'Bathrooms', ph: '3' },
  { key: 'propertySqft' as const, label: 'Area (sqft)', ph: '1,850' },
  { key: 'propertyAddress' as const, label: 'Address', ph: 'Gachibowli, Hyderabad' },
  { key: 'propertyType' as const, label: 'Type', ph: 'Apartment' },
  { key: 'reraNumber' as const, label: 'RERA Number', ph: 'P02400001288' },
]

export default function ListingImport() {
  const { data, update, setData } = useCreative()

  const applyStatus = (status: ListingData['listingStatus']) => {
    const patch = applyListingPreset(status, data)
    setData((prev) => ({ ...prev, ...patch }))
  }

  return (
    <Section title="Real Estate Listing" desc="Property details — auto-fills Just Listed / Sold / Open House templates">
      <div className="mb-4 grid grid-cols-2 gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => applyStatus(s.id)}
            className={`rounded-lg border py-2.5 text-[10px] font-semibold transition ${
              data.listingStatus === s.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400 hover:border-slate-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {FIELDS.map((f) => (
          <Field key={f.key} label={f.label}>
            <input
              type="text"
              value={data[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder={f.ph}
              className={inputClass}
            />
          </Field>
        ))}
      </div>
    </Section>
  )
}

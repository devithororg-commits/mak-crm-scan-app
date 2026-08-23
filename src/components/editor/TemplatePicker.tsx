import { useMemo, useState } from 'react'
import { Check, LayoutGrid, Star } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { TEMPLATES } from '../../data/config'
import { applyTemplateSwitch } from '../../data/presets'
import type { TemplateId } from '../../types/creative'
import TemplateThumb, { TEMPLATE_GROUPS, TEMPLATE_GROUP_MAP } from './TemplateThumb'
import { MOOD_FILTERS, templateMatchesMood, type TemplateMood } from '../../utils/templateMoods'
import { AppIcon } from '../icons'
import { Section } from './FormUI'
import SearchInput from '../ux/SearchInput'
import { useToast } from '../ux/ToastProvider'

const POPULAR_TEMPLATES: TemplateId[] = [
  'just-listed', 'just-sold', 'market-update', 'agent-spotlight', 'open-house', 'emi-calculator',
]

type SortMode = 'popular' | 'az'

export default function TemplatePicker() {
  const { data, setData } = useCreative()
  const { toast } = useToast()
  const [filter, setFilter] = useState<string>('all')
  const [moodFilter, setMoodFilter] = useState<TemplateMood | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortMode>('popular')

  const selectTemplate = (id: TemplateId) => {
    if (data.templateId === id) return
    setData((prev) => applyTemplateSwitch(id, prev))
    const name = TEMPLATES.find((t) => t.id === id)?.name
    toast(`${name ?? 'Template'} selected — preview updated`, 'success')
  }

  const filtered = useMemo(() => {
    let list = TEMPLATES.filter(
      (t) => filter === 'all' || TEMPLATE_GROUP_MAP[t.id as TemplateId] === filter,
    )
    if (moodFilter !== 'all') {
      list = list.filter((t) => templateMatchesMood(t.id as TemplateId, moodFilter))
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.bestFor.toLowerCase().includes(q) ||
          t.id.includes(q),
      )
    }
    if (sort === 'popular') {
      list = [...list].sort((a, b) => {
        const aPop = POPULAR_TEMPLATES.indexOf(a.id as TemplateId)
        const bPop = POPULAR_TEMPLATES.indexOf(b.id as TemplateId)
        if (aPop !== -1 && bPop !== -1) return aPop - bPop
        if (aPop !== -1) return -1
        if (bPop !== -1) return 1
        return a.name.localeCompare(b.name)
      })
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    }
    return list
  }, [filter, moodFilter, search, sort])

  return (
    <Section title="Choose Template" desc="Search, filter, or tap to preview on the right" noPad>
      <div className="space-y-3 border-b border-slate-100 px-4 py-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search templates…" />
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {filtered.length} template{filtered.length === 1 ? '' : 's'}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 outline-none focus:border-violet-400"
          >
            <option value="popular">Popular first</option>
            <option value="az">A → Z</option>
          </select>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 px-4 py-3">
        {TEMPLATE_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setFilter(g.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
              filter === g.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AppIcon name={g.icon} size={12} className={filter === g.id ? 'text-white' : 'text-slate-500'} />
            {g.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 px-4 py-2">
        {MOOD_FILTERS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMoodFilter(m.id)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
              moodFilter === m.id
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
            }`}
          >
            <span>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        {filtered.map((tpl) => {
          const active = data.templateId === tpl.id
          const popular = POPULAR_TEMPLATES.includes(tpl.id as TemplateId)
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => selectTemplate(tpl.id as TemplateId)}
              className={`group relative overflow-hidden rounded-[14px] border text-left transition-all duration-200 ${
                active
                  ? 'border-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.2)] ring-2 ring-indigo-100'
                  : 'border-slate-200/80 hover:border-indigo-200 hover:shadow-md'
              }`}
            >
              <TemplateThumb id={tpl.id as TemplateId} className="h-[88px]" />

              <div className="border-t border-slate-100 bg-white px-2.5 py-2">
                <div className="flex items-start justify-between gap-1">
                  <p className={`text-[11px] font-bold leading-tight ${active ? 'text-indigo-700' : 'text-slate-800'}`}>
                    {tpl.name}
                  </p>
                  {popular && !active && (
                    <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" aria-label="Popular" />
                  )}
                </div>
                <p className="mt-0.5 text-[9px] text-slate-400">{tpl.bestFor}</p>
              </div>

              {active && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 shadow-md">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-8 text-slate-400">
          <LayoutGrid className="mb-2 h-8 w-8 opacity-40" />
          <p className="text-xs font-medium">No templates match your search</p>
          <button type="button" onClick={() => { setSearch(''); setFilter('all'); setMoodFilter('all') }} className="mt-2 text-[11px] font-semibold text-violet-600 hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </Section>
  )
}

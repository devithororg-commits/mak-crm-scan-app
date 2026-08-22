import { useState } from 'react'
import { Check, LayoutGrid } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { TEMPLATES } from '../../data/config'
import { applyTemplateSwitch } from '../../data/presets'
import type { TemplateId } from '../../types/creative'
import TemplateThumb, { TEMPLATE_GROUPS, TEMPLATE_GROUP_MAP } from './TemplateThumb'
import { AppIcon } from '../icons'
import { Section } from './FormUI'

export default function TemplatePicker() {
  const { data, setData } = useCreative()
  const [filter, setFilter] = useState<string>('all')

  const selectTemplate = (id: TemplateId) => {
    if (data.templateId === id) return
    setData((prev) => applyTemplateSwitch(id, prev))
  }

  const filtered = TEMPLATES.filter(
    (t) => filter === 'all' || TEMPLATE_GROUP_MAP[t.id as TemplateId] === filter,
  )

  return (
    <Section title="Choose Template" desc="Tap to preview on the right — edit when you're ready" noPad>
      {/* Filter pills */}
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

      <div className="grid grid-cols-2 gap-3 p-4">
        {filtered.map((tpl) => {
          const active = data.templateId === tpl.id
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
              {/* Live mini preview */}
              <TemplateThumb id={tpl.id as TemplateId} className="h-[88px]" />

              {/* Label */}
              <div className="border-t border-slate-100 bg-white px-2.5 py-2">
                <p className={`text-[11px] font-bold leading-tight ${active ? 'text-indigo-700' : 'text-slate-800'}`}>
                  {tpl.name}
                </p>
                <p className="mt-0.5 text-[9px] text-slate-400">{tpl.bestFor}</p>
              </div>

              {/* Active badge */}
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
          <p className="text-xs">No templates in this category</p>
        </div>
      )}
    </Section>
  )
}

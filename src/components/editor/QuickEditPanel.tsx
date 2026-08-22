import type { ReactNode } from 'react'
import { useState } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { TEMPLATES } from '../../data/config'
import { getQuickEditZones } from '../../data/templateEditMap'
import type { CreativeData } from '../../types/creative'
import { HighlightField } from './HighlightField'
import HighlightsEditor from './HighlightsEditor'
import MediaEditor from './MediaEditor'
import { Field, inputClass, textareaClass } from './FormUI'

function EditField({
  label,
  placeholder,
  multiline,
  type,
  highlight,
  value,
  onChange,
}: {
  label: string
  placeholder?: string
  multiline?: boolean
  type?: 'number'
  highlight?: boolean
  value: string | number
  onChange: (v: string) => void
}) {
  if (highlight) {
    return (
      <HighlightField
        label={label}
        value={String(value)}
        onChange={onChange}
        multiline={multiline}
        placeholder={placeholder}
      />
    )
  }

  return (
    <Field label={label}>
      {multiline ? (
        <textarea
          rows={3}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={textareaClass}
        />
      ) : type === 'number' ? (
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </Field>
  )
}

function AccordionZone({
  title,
  subtitle,
  defaultOpen,
  children,
}: {
  title: string
  subtitle: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <div className="overflow-hidden rounded-[14px] border border-slate-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50/80"
      >
        <div>
          <p className="text-[13px] font-bold text-slate-900">{title}</p>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-100 bg-slate-50/30 px-4 py-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default function QuickEditPanel() {
  const { data, update } = useCreative()
  const zones = getQuickEditZones(data.templateId)
  const templateName = TEMPLATES.find((t) => t.id === data.templateId)?.name ?? 'Creative'

  const setField = (key: string, value: string) => {
    if (key === 'progressPercent') {
      update('progressPercent', Number(value) as CreativeData['progressPercent'])
      return
    }
    update(key as keyof CreativeData, value as never)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-violet-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Smart Edit</p>
            <p className="text-[14px] font-extrabold text-slate-900">{templateName}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
              Only fields for this template · Use <strong>**stars**</strong> to highlight words
            </p>
          </div>
        </div>
      </div>

      {zones.map((zone) => (
        <AccordionZone key={zone.id} title={zone.title} subtitle={zone.subtitle} defaultOpen={zone.defaultOpen}>
          {zone.fields.map((field) => (
            <EditField
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              multiline={field.multiline}
              type={field.type}
              highlight={field.highlight}
              value={data[field.key as keyof CreativeData] as string | number}
              onChange={(v) => setField(field.key, v)}
            />
          ))}
        </AccordionZone>
      ))}

      <AccordionZone title="Bullet Points" subtitle="Key highlights list" defaultOpen={false}>
        <HighlightsEditor bare />
      </AccordionZone>

      <AccordionZone title="Photos & Media" subtitle="Images, logo & layout" defaultOpen={false}>
        <MediaEditor />
      </AccordionZone>
    </div>
  )
}

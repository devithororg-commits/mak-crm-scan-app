import { useCreative } from '../../store/CreativeContext'
import { parseHighlightText, getHighlightStyle } from '../../utils/textHighlight'
import type { HighlightStyle } from '../../types/creative'
import { Field, inputClass, textareaClass } from './FormUI'

interface HighlightFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  placeholder?: string
  hint?: string
}

export function HighlightField({ label, value, onChange, multiline, placeholder, hint }: HighlightFieldProps) {
  const { data } = useCreative()
  const highlightStyle = getHighlightStyle(data)
  const segments = parseHighlightText(value)

  return (
    <Field
      label={label}
      hint={hint ?? 'Wrap words in **double stars** to highlight — e.g. Revenue up **34%**'}
    >
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={textareaClass}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      {value.includes('**') && (
        <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-sm leading-relaxed text-slate-700">
          {segments.map((seg, i) =>
            seg.highlight ? (
              <mark key={i} className="bg-transparent" style={highlightStyle}>
                {seg.text}
              </mark>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </div>
      )}
    </Field>
  )
}

const HIGHLIGHT_STYLES: { id: HighlightStyle; label: string }[] = [
  { id: 'accent', label: 'Accent Color' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'underline', label: 'Underline' },
  { id: 'background', label: 'Background' },
  { id: 'bold', label: 'Bold Only' },
]

export function HighlightStylePicker() {
  const { data, update } = useCreative()
  const previewStyle = getHighlightStyle(data)

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-[11px] font-medium text-slate-600">Syntax — wrap any word or number</p>
        <code className="block rounded-lg bg-white px-3 py-2 text-xs text-indigo-700">
          Your **highlighted** text here
        </code>
        <p className="mt-3 text-sm text-slate-700">
          Revenue up <mark className="bg-transparent" style={previewStyle}>34%</mark> this quarter
        </p>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Highlight Style</p>
      <div className="grid grid-cols-2 gap-2">
        {HIGHLIGHT_STYLES.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => update('highlightStyle', id)}
            className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
              data.highlightStyle === id
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-700">Highlight Color</span>
          <span className="text-[10px] text-slate-400">Empty = accent color</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={data.highlightColor || data.accentColor}
            onChange={(e) => update('highlightColor', e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white"
          />
          <input
            type="text"
            value={data.highlightColor}
            onChange={(e) => update('highlightColor', e.target.value)}
            placeholder={data.accentColor}
            className={inputClass}
          />
          {data.highlightColor && (
            <button
              type="button"
              onClick={() => update('highlightColor', '')}
              className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-[10px] text-slate-500 hover:text-slate-900"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

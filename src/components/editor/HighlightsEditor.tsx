import { Plus, Trash2 } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { Section, inputClass } from './FormUI'

export default function HighlightsEditor() {
  const { data, update } = useCreative()

  const updateHighlight = (index: number, value: string) => {
    const next = [...data.highlights]
    next[index] = value
    update('highlights', next)
  }

  const addHighlight = () => {
    if (data.highlights.length < 6) {
      update('highlights', [...data.highlights, ''])
    }
  }

  const removeHighlight = (index: number) => {
    update('highlights', data.highlights.filter((_, i) => i !== index))
  }

  return (
    <Section title="Key Highlights" desc="Bullet points shown on creative (up to 6)">
      <div className="space-y-2">
        {data.highlights.map((h, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-700">
              {i + 1}
            </span>
            <input
              type="text"
              value={h}
              onChange={(e) => updateHighlight(i, e.target.value)}
              placeholder={`Highlight ${i + 1}`}
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => removeHighlight(i)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {data.highlights.length < 6 && (
          <button
            type="button"
            onClick={addHighlight}
            className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 py-2 text-xs text-slate-400 hover:border-indigo-500/40 hover:text-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add highlight
          </button>
        )}
      </div>
    </Section>
  )
}

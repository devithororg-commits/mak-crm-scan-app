import { useCreative } from '../../store/CreativeContext'
import { CATEGORIES } from '../../data/config'
import type { ContentCategory } from '../../types/creative'
import { AppIcon } from '../icons'
import { Section } from './FormUI'
import { useToast } from '../ux/ToastProvider'

export default function CategoryPicker() {
  const { data, applyPreset } = useCreative()
  const { toast } = useToast()

  return (
    <Section title="Content Type" desc="Pick a category — smart sample text fills in instantly" noPad>
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto p-4 pb-3">
        {CATEGORIES.map((cat) => {
          const active = data.category === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                applyPreset(cat.id as ContentCategory)
                toast(`${cat.label} content loaded — edit the text below`, 'success')
              }}
              className={`snap-start flex shrink-0 items-center gap-2 rounded-[12px] border px-3 py-2.5 transition-all duration-200 ${
                active
                  ? 'border-indigo-400 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-sm ring-1 ring-indigo-200/60'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                <AppIcon name={cat.icon} size={16} />
              </span>
              <div className="text-left">
                <p className={`text-[12px] font-bold leading-none ${active ? 'text-indigo-700' : 'text-slate-800'}`}>
                  {cat.label}
                </p>
                <p className="mt-0.5 max-w-[100px] truncate text-[9px] text-slate-400">{cat.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
    </Section>
  )
}

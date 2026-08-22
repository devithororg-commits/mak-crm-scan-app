import { useCreative } from '../../store/CreativeContext'
import { THEME_PRESETS, applyTheme } from '../../utils/themePresets'
import { Section } from './FormUI'

export default function ThemeEditor() {
  const { data, setData } = useCreative()

  const selectTheme = (themeId: string) => {
    setData((prev) => ({ ...prev, ...applyTheme(themeId) }))
  }

  return (
    <Section title="Style Themes" desc="One-click reskin — colors + font">
      <div className="grid grid-cols-2 gap-2.5">
        {THEME_PRESETS.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => selectTheme(theme.id)}
            className={`overflow-hidden rounded-[14px] border text-left transition-all duration-200 ${
              data.themeId === theme.id
                ? 'border-indigo-400 shadow-[0_0_0_2px_rgba(99,102,241,0.12)]'
                : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className={`h-12 bg-gradient-to-r ${theme.preview}`} />
            <div className="bg-white px-3 py-2.5">
              <p className="text-[12px] font-bold text-slate-800">{theme.name}</p>
              <p className="text-[10px] text-slate-400">{theme.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </Section>
  )
}

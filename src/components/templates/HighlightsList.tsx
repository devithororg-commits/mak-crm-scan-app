import type { CreativeData } from '../../types/creative'
import { getTypography } from '../../utils/typography'
import HighlightText from './HighlightText'

export default function HighlightsList({ data, light = false }: { data: CreativeData; light?: boolean }) {
  const t = getTypography(data)
  const items = data.highlights.filter(Boolean)
  if (items.length === 0) return null

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className={`flex items-start gap-2.5 ${light ? 'text-white/80' : 'text-slate-600'}`} style={t.body}>
          <span
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${light ? 'bg-white/60' : ''}`}
            style={light ? undefined : { background: data.accentColor }}
          />
          <span className="leading-snug">
            <HighlightText text={item} data={data} />
          </span>
        </li>
      ))}
    </ul>
  )
}

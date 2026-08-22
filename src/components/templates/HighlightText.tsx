import type { CSSProperties, ReactNode } from 'react'
import type { CreativeData } from '../../types/creative'
import { getHighlightStyle, parseHighlightText } from '../../utils/textHighlight'

interface Props {
  text: string
  data: CreativeData
  className?: string
  style?: CSSProperties
}

export default function HighlightText({ text, data, className, style }: Props) {
  const segments = parseHighlightText(text)
  const highlightStyle = getHighlightStyle(data)

  const content: ReactNode[] = segments.map((seg, i) =>
    seg.highlight ? (
      <mark key={i} className="bg-transparent" style={highlightStyle}>
        {seg.text}
      </mark>
    ) : (
      <span key={i}>{seg.text}</span>
    ),
  )

  return (
    <span className={className} style={style}>
      {content}
    </span>
  )
}

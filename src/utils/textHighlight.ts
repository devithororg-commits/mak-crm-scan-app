import type { CSSProperties } from 'react'
import type { CreativeData, HighlightStyle } from '../types/creative'

export interface TextSegment {
  text: string
  highlight: boolean
}

/** Parse **highlighted** segments from user text */
export function parseHighlightText(input: string): TextSegment[] {
  if (!input) return []
  const segments: TextSegment[] = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: input.slice(lastIndex, match.index), highlight: false })
    }
    segments.push({ text: match[1], highlight: true })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < input.length) {
    segments.push({ text: input.slice(lastIndex), highlight: false })
  }

  if (segments.length === 0) segments.push({ text: input, highlight: false })
  return segments
}

export function hasHighlights(input: string): boolean {
  return /\*\*.+?\*\*/.test(input)
}

const VALID_STYLES: HighlightStyle[] = ['accent', 'gradient', 'underline', 'background', 'bold']

export function resolveHighlightStyle(style?: string): HighlightStyle {
  return VALID_STYLES.includes(style as HighlightStyle) ? (style as HighlightStyle) : 'accent'
}

export function getHighlightStyle(data: CreativeData): CSSProperties {
  const color = data.highlightColor || data.accentColor
  const secondary = data.secondaryColor || color
  const style = resolveHighlightStyle(data.highlightStyle)

  switch (style) {
    case 'gradient':
      return {
        backgroundImage: `linear-gradient(135deg, ${color}, ${secondary})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 800,
      }
    case 'underline':
      return {
        color,
        textDecoration: 'underline',
        textDecorationThickness: '3px',
        textUnderlineOffset: '4px',
        fontWeight: 700,
      }
    case 'background':
      return {
        color: '#ffffff',
        background: color,
        padding: '1px 8px',
        borderRadius: 6,
        fontWeight: 700,
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
      }
    case 'bold':
      return { color, fontWeight: 800 }
    case 'accent':
    default:
      return { color, fontWeight: 700 }
  }
}

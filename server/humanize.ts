const AI_PHRASES: [RegExp, string][] = [
  [/\bunlock\b/gi, ''],
  [/\belevate\b/gi, ''],
  [/\brevolutionize\b/gi, ''],
  [/\bgame[- ]?changer\b/gi, ''],
  [/\bin today's fast[- ]paced\b/gi, ''],
  [/\bdon't miss out\b/gi, 'Limited availability'],
  [/\bseamless\b/gi, 'smooth'],
  [/\bcutting[- ]edge\b/gi, 'modern'],
  [/\bworld[- ]class\b/gi, 'premium'],
  [/\btransform your\b/gi, 'Upgrade your'],
  [/\b—\b/g, '-'],
  [/\s{2,}/g, ' '],
]

export function humanizeText(text: string): string {
  let out = text.trim()
  for (const [re, rep] of AI_PHRASES) out = out.replace(re, rep)
  return out.replace(/\s+([,.!?])/g, '$1').trim()
}

export function humanizeHashtags(tags: string): string {
  return tags
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : `#${t.replace(/[^a-zA-Z0-9]/g, '')}`))
    .filter((t) => t.length > 2)
    .slice(0, 12)
    .join(' ')
}

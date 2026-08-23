import type { TemplateId } from '../types/creative'

const HISTORY_KEY = 'studio-theme-history-v1'
const MAX_HISTORY = 30

export function getRecentTemplates(): TemplateId[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as TemplateId[]
  } catch {
    return []
  }
}

export function recordTemplateUse(id: TemplateId) {
  const prev = getRecentTemplates().filter((t) => t !== id)
  prev.unshift(id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(prev.slice(0, MAX_HISTORY)))
}

export function clearThemeHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

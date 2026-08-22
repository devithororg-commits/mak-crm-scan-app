import type { CreativeData, LibraryItem } from '../types/creative'

const LIBRARY_KEY = 'creative-studio-library'
const MAX_ITEMS = 50

export function loadLibrary(): LibraryItem[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveToLibrary(data: CreativeData, thumbnail?: string, name?: string): LibraryItem {
  const items = loadLibrary()
  const item: LibraryItem = {
    id: crypto.randomUUID(),
    name: name || data.title || 'Untitled Creative',
    templateId: data.templateId,
    aspectRatio: data.aspectRatio,
    thumbnail,
    savedAt: new Date().toISOString(),
    data: { ...data },
  }
  items.unshift(item)
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
  return item
}

export function deleteFromLibrary(id: string) {
  const items = loadLibrary().filter((i) => i.id !== id)
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(items))
}

export function exportProjectJson(data: CreativeData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${(data.title || 'project').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

export function importProjectJson(file: File): Promise<CreativeData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string))
      } catch {
        reject(new Error('Invalid project file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

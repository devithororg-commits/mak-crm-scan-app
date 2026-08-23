import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { applyCategoryPreset } from '../data/presets'
import { defaultCreativeData, type CarouselSlide, type ContentCategory, type CreativeData, type EditorTab, type EditSection } from '../types/creative'
import { snapValue } from '../utils/designEffects'
import { clearPersistedData, loadPersistedData, savePersistedData } from '../utils/persistence'

const MAX_HISTORY = 40

interface CreativeContextValue {
  data: CreativeData
  setData: React.Dispatch<React.SetStateAction<CreativeData>>
  update: <K extends keyof CreativeData>(key: K, value: CreativeData[K]) => void
  activeTab: EditorTab
  setActiveTab: (tab: EditorTab) => void
  editSection: EditSection
  setEditSection: (section: EditSection) => void
  applyPreset: (category: ContentCategory) => void
  resetAll: () => void
  savedAt: string | null
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  loadProject: (data: CreativeData) => void
  updateCarouselSlide: (index: number, patch: Partial<CarouselSlide>) => void
  addCarouselSlide: () => void
  removeCarouselSlide: (index: number) => void
  setActiveCarouselSlide: (index: number) => void
  duplicateCarouselSlide: () => void
  nudgeContent: (dx: number, dy: number, coarse?: boolean) => void
}

const CreativeContext = createContext<CreativeContextValue | null>(null)

export function CreativeProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<CreativeData>(() => loadPersistedData())
  const [activeTab, setActiveTab] = useState<EditorTab>('templates')
  const [editSection, setEditSection] = useState<EditSection>('content')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const history = useRef<CreativeData[]>([loadPersistedData()])
  const historyIndex = useRef(0)
  const skipHistory = useRef(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(historyIndex.current > 0)
    setCanRedo(historyIndex.current < history.current.length - 1)
  }, [])

  const pushHistory = useCallback((next: CreativeData) => {
    if (skipHistory.current) return
    history.current = history.current.slice(0, historyIndex.current + 1)
    history.current.push(next)
    if (history.current.length > MAX_HISTORY) history.current.shift()
    else historyIndex.current += 1
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const setData: React.Dispatch<React.SetStateAction<CreativeData>> = useCallback((action) => {
    setDataState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action
      pushHistory(next)
      return next
    })
  }, [pushHistory])

  useEffect(() => {
    const timer = setTimeout(() => {
      savePersistedData(data)
      setSavedAt(new Date().toLocaleTimeString())
    }, 800)
    return () => clearTimeout(timer)
  }, [data])

  const update = useCallback(<K extends keyof CreativeData>(key: K, value: CreativeData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }, [setData])

  const applyPreset = useCallback((category: ContentCategory) => {
    setData(applyCategoryPreset(category))
    setActiveTab('edit')
    setEditSection('content')
  }, [setData])

  const resetAll = useCallback(() => {
    const fresh = defaultCreativeData()
    skipHistory.current = true
    history.current = [fresh]
    historyIndex.current = 0
    setDataState(fresh)
    clearPersistedData()
    syncHistoryFlags()
    skipHistory.current = false
  }, [syncHistoryFlags])

  const undo = useCallback(() => {
    if (historyIndex.current <= 0) return
    historyIndex.current -= 1
    skipHistory.current = true
    setDataState(history.current[historyIndex.current])
    skipHistory.current = false
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const redo = useCallback(() => {
    if (historyIndex.current >= history.current.length - 1) return
    historyIndex.current += 1
    skipHistory.current = true
    setDataState(history.current[historyIndex.current])
    skipHistory.current = false
    syncHistoryFlags()
  }, [syncHistoryFlags])

  const loadProject = useCallback((project: CreativeData) => {
    setData(project)
  }, [setData])

  const updateCarouselSlide = useCallback((index: number, patch: Partial<CarouselSlide>) => {
    setData((prev) => ({
      ...prev,
      carouselSlides: prev.carouselSlides.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }))
  }, [setData])

  const addCarouselSlide = useCallback(() => {
    setData((prev) => {
      if (prev.carouselSlides.length >= 10) return prev
      const n = prev.carouselSlides.length + 1
      return {
        ...prev,
        carouselSlides: [
          ...prev.carouselSlides,
          { id: crypto.randomUUID(), title: `Slide ${n}`, subtitle: '', body: '', badge: String(n).padStart(2, '0') },
        ],
        activeCarouselSlide: n - 1,
      }
    })
  }, [setData])

  const removeCarouselSlide = useCallback((index: number) => {
    setData((prev) => {
      if (prev.carouselSlides.length <= 2) return prev
      const slides = prev.carouselSlides.filter((_, i) => i !== index)
      return {
        ...prev,
        carouselSlides: slides,
        activeCarouselSlide: Math.min(prev.activeCarouselSlide, slides.length - 1),
      }
    })
  }, [setData])

  const setActiveCarouselSlide = useCallback((index: number) => {
    update('activeCarouselSlide', index)
  }, [update])

  const duplicateCarouselSlide = useCallback(() => {
    setData((prev) => {
      if (!prev.carouselEnabled || prev.carouselSlides.length >= 10) return prev
      const src = prev.carouselSlides[prev.activeCarouselSlide]
      if (!src) return prev
      const copy = { ...src, id: crypto.randomUUID(), title: `${src.title} (copy)` }
      const slides = [...prev.carouselSlides]
      slides.splice(prev.activeCarouselSlide + 1, 0, copy)
      return { ...prev, carouselSlides: slides, activeCarouselSlide: prev.activeCarouselSlide + 1 }
    })
  }, [setData])

  const nudgeContent = useCallback((dx: number, dy: number, coarse = false) => {
    setData((prev) => {
      const step = coarse ? 10 : 1
      const apply = (v: number, d: number) => (prev.snapToGrid ? snapValue(v + d * step) : v + d * step)
      return {
        ...prev,
        contentOffsetX: apply(prev.contentOffsetX, dx),
        contentOffsetY: apply(prev.contentOffsetY, dy),
      }
    })
  }, [setData])

  return (
    <CreativeContext.Provider
      value={{
        data, setData, update, activeTab, setActiveTab, editSection, setEditSection, applyPreset, resetAll, savedAt,
        undo, redo, canUndo, canRedo, loadProject,
        updateCarouselSlide, addCarouselSlide, removeCarouselSlide, setActiveCarouselSlide,
        duplicateCarouselSlide, nudgeContent,
      }}
    >
      {children}
    </CreativeContext.Provider>
  )
}

export function useCreative() {
  const ctx = useContext(CreativeContext)
  if (!ctx) throw new Error('useCreative must be used within CreativeProvider')
  return ctx
}

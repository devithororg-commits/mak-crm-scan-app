import { createContext, useCallback, useContext, useRef, useState, type ReactNode, type RefObject } from 'react'

export interface ExportHandlers {
  download: (format: 'png' | 'jpeg') => Promise<void>
  magicResize: (format: 'png' | 'jpeg') => Promise<void>
  saveLibrary: () => Promise<void>
  exportVideo: () => Promise<void>
  exportCarousel: (type: 'pdf' | 'zip') => Promise<void>
  exportCampaignPack: (format: 'png' | 'jpeg') => Promise<void>
  exportAbVariants: (format: 'png' | 'jpeg') => Promise<void>
  exportCaptionPack: () => Promise<void>
}

export interface ExportProgress {
  message: string
  percent: number
}

interface ExportBridgeValue {
  exportRef: RefObject<HTMLDivElement | null>
  handlers: ExportHandlers | null
  exporting: string
  exportError: string
  savedMsg: string
  exportProgress: ExportProgress | null
  registerHandlers: (handlers: ExportHandlers) => void
  setExporting: (v: string) => void
  setExportError: (v: string) => void
  setSavedMsg: (v: string) => void
  setExportProgress: (v: ExportProgress | null) => void
}

const ExportBridgeContext = createContext<ExportBridgeValue | null>(null)

export function ExportBridgeProvider({ children }: { children: ReactNode }) {
  const exportRef = useRef<HTMLDivElement | null>(null)
  const [handlers, setHandlers] = useState<ExportHandlers | null>(null)
  const [exporting, setExporting] = useState('')
  const [exportError, setExportError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)

  const registerHandlers = useCallback((h: ExportHandlers) => {
    setHandlers(() => h)
  }, [])

  return (
    <ExportBridgeContext.Provider
      value={{
        exportRef,
        handlers,
        exporting,
        exportError,
        savedMsg,
        exportProgress,
        registerHandlers,
        setExporting,
        setExportError,
        setSavedMsg,
        setExportProgress,
      }}
    >
      {children}
    </ExportBridgeContext.Provider>
  )
}

export function useExportBridge() {
  const ctx = useContext(ExportBridgeContext)
  if (!ctx) throw new Error('useExportBridge must be used within ExportBridgeProvider')
  return ctx
}

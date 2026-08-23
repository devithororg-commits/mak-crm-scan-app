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

interface ExportBridgeValue {
  exportRef: RefObject<HTMLDivElement | null>
  handlers: ExportHandlers | null
  exporting: string
  exportError: string
  savedMsg: string
  registerHandlers: (handlers: ExportHandlers) => void
  setExporting: (v: string) => void
  setExportError: (v: string) => void
  setSavedMsg: (v: string) => void
}

const ExportBridgeContext = createContext<ExportBridgeValue | null>(null)

export function ExportBridgeProvider({ children }: { children: ReactNode }) {
  const exportRef = useRef<HTMLDivElement | null>(null)
  const handlersRef = useRef<ExportHandlers | null>(null)
  const handlersReadyRef = useRef(false)
  const [, setHandlersReady] = useState(false)
  const [exporting, setExporting] = useState('')
  const [exportError, setExportError] = useState('')
  const [savedMsg, setSavedMsg] = useState('')

  const registerHandlers = useCallback((h: ExportHandlers) => {
    handlersRef.current = h
    if (!handlersReadyRef.current) {
      handlersReadyRef.current = true
      setHandlersReady(true)
    }
  }, [])

  return (
    <ExportBridgeContext.Provider
      value={{
        exportRef,
        handlers: handlersRef.current,
        exporting,
        exportError,
        savedMsg,
        registerHandlers,
        setExporting,
        setExportError,
        setSavedMsg,
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

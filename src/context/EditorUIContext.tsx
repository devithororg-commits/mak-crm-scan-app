import { createContext, useContext, useState, type ReactNode } from 'react'

interface EditorUIContextValue {
  exportOpen: boolean
  setExportOpen: (open: boolean) => void
  helpOpen: boolean
  setHelpOpen: (open: boolean) => void
  mobilePanelOpen: boolean
  setMobilePanelOpen: (open: boolean) => void
}

const EditorUIContext = createContext<EditorUIContextValue | null>(null)

export function EditorUIProvider({ children }: { children: ReactNode }) {
  const [exportOpen, setExportOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)

  return (
    <EditorUIContext.Provider value={{ exportOpen, setExportOpen, helpOpen, setHelpOpen, mobilePanelOpen, setMobilePanelOpen }}>
      {children}
    </EditorUIContext.Provider>
  )
}

export function useEditorUI() {
  const ctx = useContext(EditorUIContext)
  if (!ctx) throw new Error('useEditorUI must be used within EditorUIProvider')
  return ctx
}

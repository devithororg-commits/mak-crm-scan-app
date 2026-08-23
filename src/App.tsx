import { useEffect, useState } from 'react'
import { CreativeProvider, useCreative } from './store/CreativeContext'
import { ExportBridgeProvider } from './context/ExportBridge'
import { EditorUIProvider } from './context/EditorUIContext'
import { ToastProvider } from './components/ux/ToastProvider'
import AppShell from './components/layout/AppShell'
import EditorPanel from './components/editor/EditorPanel'
import PreviewPanel from './components/editor/PreviewPanel'
import ErrorBoundary from './components/ErrorBoundary'
import WelcomeGuide from './components/ux/WelcomeGuide'
import HelpPanel from './components/ux/HelpPanel'
import { hasSeenOnboarding } from './utils/onboarding'
import { useEditorUI } from './context/EditorUIContext'

function AppContent() {
  const { setActiveTab, setEditSection } = useCreative()
  const { helpOpen, setHelpOpen } = useEditorUI()
  const [showWelcome, setShowWelcome] = useState(() => !hasSeenOnboarding())

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable
      if (typing) return
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault()
        setHelpOpen(true)
      }
      if (e.key === 'Escape') setHelpOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setHelpOpen])

  return (
    <>
      <AppShell>
        <div className="relative flex flex-1 overflow-hidden">
          <EditorPanel />
          <PreviewPanel />
        </div>
      </AppShell>
      {showWelcome && (
        <WelcomeGuide
          onClose={() => setShowWelcome(false)}
          onStart={() => {
            setActiveTab('templates')
            setEditSection('content')
          }}
        />
      )}
      <HelpPanel open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CreativeProvider>
          <ExportBridgeProvider>
            <EditorUIProvider>
              <AppContent />
            </EditorUIProvider>
          </ExportBridgeProvider>
        </CreativeProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

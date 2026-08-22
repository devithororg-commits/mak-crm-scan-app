import { CreativeProvider } from './store/CreativeContext'
import { ExportBridgeProvider } from './context/ExportBridge'
import AppShell from './components/layout/AppShell'
import EditorPanel from './components/editor/EditorPanel'
import PreviewPanel from './components/editor/PreviewPanel'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <CreativeProvider>
        <ExportBridgeProvider>
          <AppShell>
            <div className="flex flex-1 overflow-hidden">
              <EditorPanel />
              <PreviewPanel />
            </div>
          </AppShell>
        </ExportBridgeProvider>
      </CreativeProvider>
    </ErrorBoundary>
  )
}

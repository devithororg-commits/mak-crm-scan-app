import { useEffect, useState } from 'react'
import { HelpCircle, Menu, PanelLeftClose, PanelLeftOpen, RotateCcw, Sparkles, Undo2, Redo2, Circle, Copy } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { useEditorUI } from '../../context/EditorUIContext'
import { useIsMobile } from '../../hooks/useMediaQuery'
import ConfirmDialog from '../ux/ConfirmDialog'
import WorkflowSteps from '../ux/WorkflowSteps'
import { useToast } from '../ux/ToastProvider'
import { saveToLibrary } from '../../utils/contentLibrary'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const {
    resetAll, savedAt, undo, redo, canUndo, canRedo, activeTab, setActiveTab, setEditSection,
    data, duplicateCarouselSlide, nudgeContent,
  } = useCreative()
  const { exportOpen, setExportOpen, setHelpOpen, mobilePanelOpen, setMobilePanelOpen } = useEditorUI()
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const [resetOpen, setResetOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }

      if (typing) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        if (e.shiftKey && data.carouselEnabled) {
          duplicateCarouselSlide()
          toast('Carousel slide duplicated', 'success')
        } else {
          saveToLibrary(data)
          toast('Creative saved to library', 'success')
        }
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const coarse = e.shiftKey
        if (e.key === 'ArrowUp') nudgeContent(0, -1, coarse)
        if (e.key === 'ArrowDown') nudgeContent(0, 1, coarse)
        if (e.key === 'ArrowLeft') nudgeContent(-1, 0, coarse)
        if (e.key === 'ArrowRight') nudgeContent(1, 0, coarse)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, duplicateCarouselSlide, nudgeContent, data, toast])

  const handleReset = () => {
    resetAll()
    setResetOpen(false)
    setExportOpen(false)
    setActiveTab('templates')
    toast('Project reset — pick a template to start fresh', 'info')
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-app)]">
      <header className="glass z-20 flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 bg-white px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {isMobile && (
            <button
              type="button"
              onClick={() => setMobilePanelOpen(!mobilePanelOpen)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              title={mobilePanelOpen ? 'Hide editor' : 'Show editor'}
            >
              {mobilePanelOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
          )}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8b3dff] shadow-md shadow-violet-500/25">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[14px] font-bold text-slate-900">Creative Studio Pro</h1>
            <p className="hidden text-[10px] text-slate-400 sm:block">Design · Edit · Export</p>
          </div>
        </div>

        <div className="order-3 w-full lg:order-2 lg:w-auto lg:flex-1 lg:justify-center flex">
          <WorkflowSteps
            compact={isMobile}
            activeTab={activeTab}
            exportOpen={exportOpen}
            onGoTemplates={() => { setActiveTab('templates'); setExportOpen(false); setMobilePanelOpen(true) }}
            onGoEdit={() => { setActiveTab('edit'); setEditSection('content'); setExportOpen(false); setMobilePanelOpen(true) }}
            onGoExport={() => { setExportOpen(true); setMobilePanelOpen(true) }}
          />
        </div>

        <div className="order-2 flex items-center gap-1 sm:gap-1.5 lg:order-3">
          <div className="flex items-center rounded-[12px] border border-slate-200/60 bg-slate-50/80 p-0.5">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="rounded-[10px] p-2 text-slate-500 transition hover:bg-white hover:text-slate-800 hover:shadow-sm disabled:opacity-25"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="rounded-[10px] p-2 text-slate-500 transition hover:bg-white hover:text-slate-800 hover:shadow-sm disabled:opacity-25"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="hidden rounded-[12px] border border-slate-200/60 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-violet-700 sm:inline-flex"
            title="Help (?)"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {savedAt && (
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/60 sm:flex sm:text-[11px] sm:px-3">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
              Saved {savedAt}
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              saveToLibrary(data)
              toast('Saved to content library', 'success')
            }}
            className="hidden items-center gap-1.5 rounded-[12px] border border-slate-200/60 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700 sm:flex"
            title="Save copy to library (Ctrl+D)"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Save copy</span>
          </button>

          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="flex items-center gap-1.5 rounded-[12px] border border-slate-200/60 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:px-3.5 sm:text-[12px]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {isMobile && (
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="rounded-[12px] border border-slate-200/60 bg-white p-2 text-slate-500 sm:hidden"
              title="Help"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {children}

      <ConfirmDialog
        open={resetOpen}
        title="Reset entire project?"
        message="All text, images, and design changes will be cleared. Your work is auto-saved until you reset — this cannot be undone."
        confirmLabel="Yes, reset"
        cancelLabel="Keep editing"
        danger
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  )
}

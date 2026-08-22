import { useEffect } from 'react'
import { RotateCcw, Sparkles, Undo2, Redo2, Circle } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { resetAll, savedAt, undo, redo, canUndo, canRedo } = useCreative()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-app)]">
      {/* Top bar — minimal */}
      <header className="glass z-20 flex h-12 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white px-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#8b3dff] shadow-md shadow-violet-500/25">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-[14px] font-bold text-slate-900">
              Creative Studio
            </h1>
            <p className="text-[10px] text-slate-400">Design · Edit · Export</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="mr-2 flex items-center rounded-[12px] border border-slate-200/60 bg-slate-50/80 p-0.5">
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

          {savedAt && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/60">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
              Saved {savedAt}
            </span>
          )}

          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1.5 rounded-[12px] border border-slate-200/60 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </header>

      {children}
    </div>
  )
}

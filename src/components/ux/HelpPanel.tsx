import { Keyboard, Lightbulb, X } from 'lucide-react'

const SHORTCUTS = [
  { keys: 'Ctrl + Z', action: 'Undo last change' },
  { keys: 'Ctrl + Y', action: 'Redo' },
  { keys: 'Ctrl + Shift + Z', action: 'Redo (alternate)' },
  { keys: 'Ctrl + D', action: 'Save copy to content library' },
  { keys: 'Ctrl + Shift + D', action: 'Duplicate carousel slide' },
  { keys: 'Arrow keys', action: 'Nudge text content 1px' },
  { keys: 'Shift + Arrow', action: 'Nudge text content 10px' },
  { keys: '?', action: 'Open this help panel' },
  { keys: 'Esc', action: 'Close panels / dialogs' },
]

const FEATURES = [
  { title: 'Templates', tip: 'Filter by Real Estate, Business, or Social. Search by name. Click to preview instantly.' },
  { title: 'Text', tip: 'Smart fields change per template. Use **word** syntax to highlight important text.' },
  { title: 'Uploads', tip: 'Add photos, apply filters (Luxury, Modern, B&W), flip, rotate, and control placement.' },
  { title: 'Design', tip: 'Colors, spacing, effects, themes, and QR code — full pro controls.' },
  { title: 'Position', tip: 'Canva-style layers panel, align text, nudge pixels, flip/rotate photos, text shadow & outline.' },
  { title: 'Brand', tip: 'Save logo, fonts, and brand colors. Import from website URL.' },
  { title: 'Charts', tip: 'Add metrics or import CSV data for analytics-style posts.' },
  { title: 'Pages', tip: 'Build carousel slides for Instagram multi-image posts.' },
  { title: 'Export', tip: 'PNG/JPEG, all sizes, reel video, PDF/ZIP carousel, captions & content library.' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function HelpPanel({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button type="button" aria-label="Close help" className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">Help Center</p>
            <h2 className="text-[18px] font-bold text-slate-900">Quick guide & shortcuts</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-slate-800">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="text-[14px] font-bold">How to use each tool</h3>
            </div>
            <div className="space-y-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
                  <p className="text-[13px] font-bold text-slate-900">{f.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600">{f.tip}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-slate-800">
              <Keyboard className="h-4 w-4 text-indigo-500" />
              <h3 className="text-[14px] font-bold">Keyboard shortcuts</h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              {SHORTCUTS.map((s, i) => (
                <div key={s.keys} className={`flex items-center justify-between px-3.5 py-2.5 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                  <span className="text-[12px] text-slate-600">{s.action}</span>
                  <kbd className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}

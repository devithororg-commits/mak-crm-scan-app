import { Keyboard, Lightbulb, X } from 'lucide-react'

const SHORTCUTS = [
  { keys: 'Ctrl + Z', action: 'Undo last change' },
  { keys: 'Ctrl + Y', action: 'Redo' },
  { keys: 'Ctrl + Shift + Z', action: 'Redo (alternate)' },
  { keys: 'Ctrl + D', action: 'Save copy to content library' },
  { keys: 'Ctrl + Shift + D', action: 'Duplicate carousel slide OR duplicate project' },
  { keys: 'Arrow keys', action: 'Nudge text content 1px' },
  { keys: 'Shift + Arrow', action: 'Nudge text content 10px' },
  { keys: '?', action: 'Open this help panel' },
  { keys: 'Esc', action: 'Close panels / dialogs' },
]

const FEATURES = [
  { title: 'Smart Fill', tip: 'Text tab → company email login → topic → Generate. Setup: SMART_STUDIO_SETUP.md' },
  { title: 'Company Profile', tip: 'Brand tab → save company name, phone, colors — Smart Fill uses your voice.' },
  { title: 'Templates', tip: 'Mood filters (Luxury, Trust, Urgent). Search & preview instantly.' },
  { title: 'Text & Listings', tip: 'Listing Quick Pack, Bulk CSV import (up to 20 listings), campaign ZIP export.' },
  { title: 'Design Intelligence', tip: 'Design Score, typography presets, 60-30-10 color harmony, A/B variants.' },
  { title: 'Composition', tip: 'Canvas toolbar: safe zone, rule of thirds, golden ratio, grayscale QA, feed thumbnail.' },
  { title: 'Brand', tip: 'Upload custom font (TTF/OTF/WOFF), Brand Lock, logo & colors from URL.' },
  { title: 'Export', tip: 'Smart file naming, all sizes sync, campaign pack, A/B ZIP, caption pack.' },
  { title: 'Share', tip: 'WhatsApp share, native mobile share (poster + caption), copy all captions.' },
  { title: 'Offline', tip: 'Install as app (PWA) — works offline after first load.' },
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
                <div key={`${s.keys}-${i}`} className={`flex items-center justify-between px-3.5 py-2.5 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
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

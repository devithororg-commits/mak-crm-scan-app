import { useRef, useState } from 'react'
import { Archive, Download, Trash2, FolderOpen, Upload } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { deleteFromLibrary, exportProjectJson, importProjectJson, loadLibrary } from '../../utils/contentLibrary'
import type { LibraryItem } from '../../types/creative'
import { Section } from './FormUI'

export default function ContentLibrary() {
  const { data, loadProject } = useCreative()
  const [items, setItems] = useState<LibraryItem[]>(() => loadLibrary())
  const fileRef = useRef<HTMLInputElement>(null)

  const refresh = () => setItems(loadLibrary())

  return (
    <Section title="Project & Library" desc="Save, load, and manage your creatives">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => exportProjectJson(data)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-[10px] text-slate-700 hover:text-slate-900"
        >
          <Download className="h-3.5 w-3.5" /> Export Project JSON
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-[10px] text-slate-700 hover:text-slate-900"
        >
          <Upload className="h-3.5 w-3.5" /> Import Project
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) { loadProject(await importProjectJson(f)); refresh() }
          e.target.value = ''
        }} />
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center">
          <Archive className="mx-auto mb-2 h-8 w-8 text-slate-600" />
          <p className="text-xs text-slate-500">No saved creatives yet</p>
          <p className="mt-1 text-[10px] text-slate-600">Use &quot;Save&quot; in the preview panel below</p>
        </div>
      ) : (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-700">
                {item.templateId.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-900">{item.name}</p>
                <p className="text-[10px] text-slate-500">{item.templateId} · {item.aspectRatio} · {new Date(item.savedAt).toLocaleDateString()}</p>
              </div>
              <button type="button" onClick={() => { loadProject(item.data); refresh() }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900">
                <FolderOpen className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => { deleteFromLibrary(item.id); refresh() }} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

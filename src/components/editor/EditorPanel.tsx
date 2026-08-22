import { useState } from 'react'
import {
  BarChart3, Download, LayoutGrid, Palette, PenLine, Images, ChevronRight, ArrowRight, SlidersHorizontal,
} from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import type { EditSection } from '../../types/creative'
import { TEMPLATES } from '../../data/config'
import BrandKitEditor from './BrandKitEditor'
import BrandUrlImport from './BrandUrlImport'
import CarouselEditor from './CarouselEditor'
import CategoryPicker from './CategoryPicker'
import QuickEditPanel from './QuickEditPanel'
import CsvImporter from './CsvImporter'
import ExportPanel from './ExportPanel'
import ListingUrlImport from './ListingUrlImport'
import ListingImport from './ListingImport'
import MetricsEditor from './MetricsEditor'
import TemplatePicker from './TemplatePicker'
import ThemeEditor from './ThemeEditor'
import AdvancedControlsPanel from './AdvancedControlsPanel'

const MAIN_NAV = [
  { id: 'templates' as const, label: 'Templates', icon: LayoutGrid },
  { id: 'edit' as const, label: 'Edit', icon: PenLine },
]

const EDIT_SECTIONS: { id: EditSection; label: string; icon: typeof PenLine }[] = [
  { id: 'content', label: 'Content', icon: PenLine },
  { id: 'style', label: 'Style', icon: SlidersHorizontal },
  { id: 'data', label: 'Data', icon: BarChart3 },
  { id: 'brand', label: 'Brand', icon: Palette },
  { id: 'slides', label: 'Slides', icon: Images },
]

export default function EditorPanel() {
  const { activeTab, setActiveTab, editSection, setEditSection, data } = useCreative()
  const [exportOpen, setExportOpen] = useState(false)
  const templateName = TEMPLATES.find((t) => t.id === data.templateId)?.name ?? 'Template'
  const currentSection = EDIT_SECTIONS.find((s) => s.id === editSection) ?? EDIT_SECTIONS[0]

  return (
    <aside className="relative flex h-full w-[420px] shrink-0 border-r border-slate-200/60 bg-white">
      {/* Vertical nav rail */}
      <nav className="flex w-[76px] shrink-0 flex-col items-center gap-1 border-r border-slate-100 bg-slate-50/50 py-4">
        {MAIN_NAV.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setExportOpen(false) }}
              title={tab.label}
              className={`group relative flex w-[60px] flex-col items-center gap-1 rounded-[14px] px-1 py-2.5 transition-all duration-200 ${
                active
                  ? 'bg-white text-indigo-600 shadow-[var(--shadow-md)] ring-1 ring-slate-200/60'
                  : 'text-slate-400 hover:bg-white/80 hover:text-slate-700'
              }`}
            >
              <Icon className={`h-[18px] w-[18px] ${active ? 'text-indigo-600' : ''}`} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[9px] font-bold leading-none ${active ? 'text-indigo-600' : 'text-slate-500'}`}>
                {tab.label}
              </span>
              {active && (
                <div className="absolute -right-[1px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-indigo-500" />
              )}
            </button>
          )
        })}

        <div className="mt-auto w-full px-2">
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className={`flex w-full flex-col items-center gap-1 rounded-[14px] px-1 py-3 transition-all ${
              exportOpen
                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:brightness-105'
            }`}
            title="Export & Download"
          >
            <Download className="h-[18px] w-[18px]" strokeWidth={2.5} />
            <span className="text-[9px] font-bold">Export</span>
          </button>
        </div>
      </nav>

      {/* Panel content */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {exportOpen ? (
          <ExportPanel onClose={() => setExportOpen(false)} />
        ) : (
          <>
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <span>Studio</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-indigo-600">{activeTab === 'templates' ? 'Templates' : 'Edit'}</span>
                {activeTab === 'edit' && (
                  <>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-slate-600">{currentSection.label}</span>
                  </>
                )}
              </div>
              <div className="mt-0.5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900">
                    {activeTab === 'templates' ? 'Choose Template' : 'Edit Creative'}
                  </h2>
                  <p className="text-[12px] text-slate-500">
                    {activeTab === 'templates'
                      ? 'Browse & preview layouts — then start editing'
                      : `${templateName} · All editing controls below`}
                  </p>
                </div>
                {activeTab === 'edit' && (
                  <button
                    type="button"
                    onClick={() => setExportOpen(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-[12px] bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-[11px] font-bold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-105"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                )}
              </div>

              {activeTab === 'edit' && (
                <div className="mt-3 flex gap-1 overflow-x-auto rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-1">
                  {EDIT_SECTIONS.map((section) => {
                    const Icon = section.icon
                    const active = editSection === section.id
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setEditSection(section.id)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] px-2 py-2 text-[11px] font-bold transition ${
                          active
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {section.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {activeTab === 'templates' && <TemplatePicker />}

                {activeTab === 'edit' && editSection === 'content' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTab('templates')}
                      className="w-full rounded-[12px] border border-dashed border-indigo-200 bg-indigo-50/50 py-2.5 text-[12px] font-semibold text-indigo-700 transition hover:bg-indigo-50"
                    >
                      ← Change Template ({templateName})
                    </button>
                    <CategoryPicker />
                    <QuickEditPanel />
                    <ListingUrlImport />
                    <ListingImport />
                  </>
                )}

                {activeTab === 'edit' && editSection === 'style' && <AdvancedControlsPanel />}

                {activeTab === 'edit' && editSection === 'data' && (
                  <>
                    <CsvImporter />
                    <MetricsEditor />
                  </>
                )}

                {activeTab === 'edit' && editSection === 'brand' && (
                  <>
                    <ThemeEditor />
                    <BrandUrlImport />
                    <BrandKitEditor />
                  </>
                )}

                {activeTab === 'edit' && editSection === 'slides' && <CarouselEditor />}
              </div>
            </div>

            {activeTab === 'templates' && !exportOpen && (
              <div className="shrink-0 border-t border-slate-200 bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
                <div className="mb-3 rounded-[12px] border border-indigo-100 bg-indigo-50/60 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">Selected</p>
                  <p className="text-[13px] font-bold text-slate-900">{templateName}</p>
                  <p className="text-[11px] text-slate-500">Preview updates on the right as you browse</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveTab('edit'); setEditSection('content') }}
                  className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-105"
                >
                  Start Editing
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Advanced controls in Edit →{' '}
                  <button type="button" onClick={() => { setActiveTab('edit'); setEditSection('style') }} className="font-semibold text-indigo-600 hover:underline">Style</button>
                  {' '}tab
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  )
}

import {
  BarChart3, Download, Palette, PenLine, Images, ChevronRight,
} from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import type { EditorTab } from '../../types/creative'
import BrandKitEditor from './BrandKitEditor'
import BrandUrlImport from './BrandUrlImport'
import CaptionGenerator from './CaptionGenerator'
import CarouselEditor from './CarouselEditor'
import CategoryPicker from './CategoryPicker'
import ContentFields from './ContentFields'
import TemplateFields from './TemplateFields'
import ContentLibrary from './ContentLibrary'
import CsvImporter from './CsvImporter'
import ExportSettings from './ExportSettings'
import HighlightsEditor from './HighlightsEditor'
import ListingImport from './ListingImport'
import ListingUrlImport from './ListingUrlImport'
import MetricsEditor from './MetricsEditor'
import TemplatePicker from './TemplatePicker'
import ThemeEditor from './ThemeEditor'

const NAV: { id: EditorTab; label: string; desc: string; icon: typeof PenLine }[] = [
  { id: 'content', label: 'Content', desc: 'Text & media', icon: PenLine },
  { id: 'analytics', label: 'Data', desc: 'Metrics & charts', icon: BarChart3 },
  { id: 'brand', label: 'Brand', desc: 'Colors & logo', icon: Palette },
  { id: 'carousel', label: 'Slides', desc: 'Multi-slide', icon: Images },
  { id: 'export', label: 'Export', desc: 'Download & share', icon: Download },
]

export default function EditorPanel() {
  const { activeTab, setActiveTab } = useCreative()
  const current = NAV.find((n) => n.id === activeTab) ?? NAV[0]

  return (
    <aside className="flex h-full w-[400px] shrink-0 border-r border-slate-200/60 bg-white">
      {/* Vertical nav rail */}
      <nav className="flex w-[76px] shrink-0 flex-col items-center gap-1 border-r border-slate-100 bg-slate-50/50 py-4">
        {NAV.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
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
      </nav>

      {/* Panel content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <span>Editor</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600">{current.label}</span>
          </div>
          <h2 className="mt-0.5 text-[17px] font-extrabold tracking-tight text-slate-900">{current.label}</h2>
          <p className="text-[12px] text-slate-500">{current.desc}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {activeTab === 'content' && (
              <>
                <CategoryPicker />
                <TemplatePicker />
                <ContentFields />
                <TemplateFields />
                <HighlightsEditor />
                <ListingUrlImport />
                <ListingImport />
              </>
            )}
            {activeTab === 'analytics' && (
              <>
                <CsvImporter />
                <MetricsEditor />
              </>
            )}
            {activeTab === 'brand' && (
              <>
                <ThemeEditor />
                <BrandUrlImport />
                <BrandKitEditor />
              </>
            )}
            {activeTab === 'carousel' && <CarouselEditor />}
            {activeTab === 'export' && (
              <>
                <ExportSettings />
                <CaptionGenerator />
                <ContentLibrary />
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

import {
  LayoutGrid, Type, ImageUp, Palette, Briefcase, BarChart3, Layers, Download, Move,
} from 'lucide-react'
import type { EditSection, EditorTab } from '../../types/creative'

export interface ToolItem {
  id: EditSection | 'templates'
  label: string
  icon: typeof Type
  group: 'main' | 'extra'
}

export const CANVA_TOOLS: ToolItem[] = [
  { id: 'templates', label: 'Templates', icon: LayoutGrid, group: 'main' },
  { id: 'content', label: 'Text', icon: Type, group: 'main' },
  { id: 'media', label: 'Uploads', icon: ImageUp, group: 'main' },
  { id: 'style', label: 'Design', icon: Palette, group: 'main' },
  { id: 'position', label: 'Position', icon: Move, group: 'main' },
  { id: 'brand', label: 'Brand', icon: Briefcase, group: 'main' },
  { id: 'data', label: 'Charts', icon: BarChart3, group: 'extra' },
  { id: 'slides', label: 'Pages', icon: Layers, group: 'extra' },
]

const TOOL_DESCRIPTIONS: Record<string, string> = {
  templates: 'Browse & pick a layout',
  content: 'Headlines, copy & highlights',
  media: 'Photos, filters & placement',
  style: 'Colors, effects & spacing',
  position: 'Layers, align, flip & nudge',
  brand: 'Logo, colors & fonts',
  data: 'Metrics, charts & CSV',
  slides: 'Carousel page editor',
}

export function getToolDescription(id: string) {
  return TOOL_DESCRIPTIONS[id] ?? ''
}

interface Props {
  activeTab: EditorTab
  editSection: EditSection
  onSelectTemplates: () => void
  onSelectTool: (section: EditSection) => void
  onExport: () => void
  exportOpen: boolean
}

export default function CanvaToolRail({
  activeTab,
  editSection,
  onSelectTemplates,
  onSelectTool,
  onExport,
  exportOpen,
}: Props) {
  const activeId = activeTab === 'templates' ? 'templates' : editSection

  return (
    <nav className="flex w-[72px] shrink-0 flex-col items-center border-r border-slate-200/80 bg-[#f0f2f5] py-3">
      <div className="flex flex-1 flex-col items-center gap-0.5">
        {CANVA_TOOLS.map((tool) => {
          const Icon = tool.icon
          const active = !exportOpen && activeId === tool.id
          const isTemplates = tool.id === 'templates'

          return (
            <button
              key={tool.id}
              type="button"
              title={`${tool.label} — ${getToolDescription(tool.id)}`}
              aria-label={tool.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                if (isTemplates) onSelectTemplates()
                else onSelectTool(tool.id as EditSection)
              }}
              className={`group relative flex w-[60px] flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all duration-150 ${
                active
                  ? 'bg-white text-[#8b3dff] shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
              }`}
            >
              {active && (
                <div className="absolute -left-[1px] top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#8b3dff]" />
              )}
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.25 : 1.75} />
              <span className={`text-[9px] font-semibold leading-none ${active ? 'text-[#8b3dff]' : 'text-slate-600'}`}>
                {tool.label}
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onExport}
        title="Export & Download"
        className={`mt-2 flex w-[60px] flex-col items-center gap-1 rounded-xl px-1 py-2.5 transition-all ${
          exportOpen
            ? 'bg-gradient-to-br from-[#8b3dff] to-violet-600 text-white shadow-lg shadow-violet-500/30'
            : 'bg-gradient-to-br from-[#8b3dff] to-violet-600 text-white shadow-md hover:brightness-105'
        }`}
      >
        <Download className="h-[20px] w-[20px]" strokeWidth={2.25} />
        <span className="text-[9px] font-bold">Export</span>
      </button>
    </nav>
  )
}

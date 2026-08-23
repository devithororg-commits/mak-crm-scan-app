import { ArrowRight } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import type { EditSection } from '../../types/creative'
import { getToolDescription } from './CanvaToolRail'
import TemplatePicker from './TemplatePicker'
import QuickEditPanel from './QuickEditPanel'
import CategoryPicker from './CategoryPicker'
import ListingUrlImport from './ListingUrlImport'
import ListingImport from './ListingImport'
import ListingQuickPack from './ListingQuickPack'
import ListingBulkImporter from './ListingBulkImporter'
import MediaEditor from './MediaEditor'
import EffectsEditor from './EffectsEditor'
import AdvancedControlsPanel from './AdvancedControlsPanel'
import ThemeEditor from './ThemeEditor'
import BrandUrlImport from './BrandUrlImport'
import BrandKitEditor from './BrandKitEditor'
import CsvImporter from './CsvImporter'
import MetricsEditor from './MetricsEditor'
import CarouselEditor from './CarouselEditor'
import PositionEditor from './PositionEditor'

const PANEL_TITLES: Record<EditSection | 'templates', string> = {
  templates: 'Templates',
  content: 'Text',
  media: 'Uploads',
  style: 'Design',
  position: 'Position',
  brand: 'Brand',
  data: 'Charts & Data',
  slides: 'Pages',
}

const PANEL_TIPS: Partial<Record<EditSection, string>> = {
  content: 'Edit headline & details — changes appear live on the canvas. Use **word** to highlight text.',
  media: 'Upload property photos or pick stock images. Apply filters for a polished look.',
  style: 'Fine-tune colors, spacing, effects, and QR code placement.',
  position: 'Reorder layers, align text, flip photos, and nudge elements pixel-perfect.',
  brand: 'Set logo, fonts, and brand colors once — they apply across templates.',
  data: 'Add numbers for charts or import CSV for analytics-style posts.',
  slides: 'Build multi-slide carousels for Instagram — each page edits separately.',
}

function PanelTip({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/90 to-indigo-50/60 px-3.5 py-2.5 text-[11px] leading-relaxed text-violet-900">
      <span className="font-bold text-violet-700">Tip · </span>{text}
    </div>
  )
}

interface Props {
  mode: 'templates' | EditSection
  templateName: string
  onChangeTemplate: () => void
}

export default function CanvaToolPanel({ mode, templateName, onChangeTemplate }: Props) {
  const { setEditSection } = useCreative()

  if (mode === 'templates') {
    return (
      <div className="space-y-4">
        <TemplatePicker />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {PANEL_TIPS[mode] && <PanelTip text={PANEL_TIPS[mode]!} />}

      {mode === 'content' && (
        <>
          <button
            type="button"
            onClick={onChangeTemplate}
            className="w-full rounded-xl border border-dashed border-violet-200 bg-violet-50/50 py-2.5 text-[12px] font-semibold text-violet-700 transition hover:bg-violet-50"
          >
            ← {templateName}
          </button>
          <CategoryPicker />
          <QuickEditPanel />
          <ListingUrlImport />
          <ListingImport />
          <ListingQuickPack />
          <ListingBulkImporter />
        </>
      )}

      {mode === 'media' && (
        <>
          <MediaEditor />
          <EffectsEditor />
        </>
      )}

      {mode === 'style' && <AdvancedControlsPanel />}

      {mode === 'position' && (
        <PositionEditor onOpenTool={(tool) => setEditSection(tool)} />
      )}

      {mode === 'brand' && (
        <>
          <ThemeEditor />
          <BrandUrlImport />
          <BrandKitEditor />
        </>
      )}

      {mode === 'data' && (
        <>
          <CsvImporter />
          <MetricsEditor />
        </>
      )}

      {mode === 'slides' && <CarouselEditor />}

      {/* Quick jump chips */}
      {mode !== 'style' && mode !== 'media' && (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Quick tools</p>
          <div className="flex flex-wrap gap-1.5">
            {(['media', 'style', 'brand'] as EditSection[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setEditSection(s)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
              >
                {PANEL_TITLES[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function CanvaPanelHeader({
  mode,
  templateName,
}: {
  mode: 'templates' | EditSection
  templateName: string
}) {
  const title = mode === 'templates' ? 'Templates' : PANEL_TITLES[mode]
  const desc = mode === 'templates'
    ? 'Browse layouts — click to preview'
    : `${templateName} · ${getToolDescription(mode)}`

  return (
    <div className="border-b border-slate-200/80 bg-white px-4 py-3.5">
      <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
      <p className="mt-0.5 text-[11px] text-slate-500">{desc}</p>
    </div>
  )
}

export function CanvaTemplatesFooter({ templateName, onStartEditing }: { templateName: string; onStartEditing: () => void }) {
  const { setEditSection } = useCreative()

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="mb-3 rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">Selected</p>
        <p className="text-[13px] font-bold text-slate-900">{templateName}</p>
      </div>
      <button
        type="button"
        onClick={onStartEditing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b3dff] py-3 text-[13px] font-bold text-white shadow-lg shadow-violet-500/25 transition hover:bg-[#7c2ef0]"
      >
        Start Editing
        <ArrowRight className="h-4 w-4" />
      </button>
      <p className="mt-2 text-center text-[10px] text-slate-400">
        Edit like Canva — Text, Uploads, Design tools on the left
      </p>
      <button
        type="button"
        onClick={() => { onStartEditing(); setEditSection('style') }}
        className="mt-1 w-full text-center text-[10px] font-medium text-violet-600 hover:underline"
      >
        Open Design tools →
      </button>
    </div>
  )
}

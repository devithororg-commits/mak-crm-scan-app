import { useState, type ReactNode } from 'react'
import { ChevronDown, Layers, Image, Type, Sparkles, Layout, PanelBottom } from 'lucide-react'
import CanvasSettings from './CanvasSettings'
import TypographyEditor from './TypographyEditor'
import MediaEditor from './MediaEditor'
import EffectsEditor from './EffectsEditor'
import FooterEditor from './FooterEditor'
import LogoEditor from './LogoEditor'

function Accordion({
  id,
  title,
  subtitle,
  icon: Icon,
  defaultOpen,
  children,
}: {
  id: string
  title: string
  subtitle: string
  icon: typeof Type
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <div className="overflow-hidden rounded-[14px] border border-slate-200/80 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50/80"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-600">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-slate-900">{title}</p>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={id} className="border-t border-slate-100 bg-slate-50/30 px-4 py-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default function AdvancedControlsPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-violet-200/60 bg-gradient-to-r from-violet-50 to-indigo-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-violet-600 text-white shadow-md">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Advanced Studio</p>
            <p className="text-[14px] font-extrabold text-slate-900">Pro Controls</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
              Typography, images, effects, canvas & footer — full creative control
            </p>
          </div>
        </div>
      </div>

      <Accordion id="canvas" title="Canvas & Format" subtitle="Platform, aspect ratio & size" icon={Layout} defaultOpen>
        <CanvasSettings compact />
      </Accordion>

      <Accordion id="typography" title="Typography" subtitle="Font sizes, scale & word highlights" icon={Type} defaultOpen>
        <TypographyEditor />
      </Accordion>

      <Accordion id="image" title="Image Studio" subtitle="Upload, filters, gallery & placement" icon={Image}>
        <MediaEditor />
      </Accordion>

      <Accordion id="effects" title="Visual Effects" subtitle="Opacity, borders, overlay & watermark" icon={Layers}>
        <EffectsEditor bare />
      </Accordion>

      <Accordion id="logo" title="Logo Placement" subtitle="Size, position & fit per template zone" icon={Image}>
        <LogoEditor />
      </Accordion>

      <Accordion id="footer" title="Footer Designer" subtitle="Style, alignment, text & visibility" icon={PanelBottom}>
        <FooterEditor bare />
      </Accordion>
    </div>
  )
}

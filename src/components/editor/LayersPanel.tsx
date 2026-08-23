import { useCreative } from '../../store/CreativeContext'
import type { EditSection } from '../../types/creative'
import { getLayers, moveLayer, setLayerVisible } from '../../utils/layers'
import { Section } from './FormUI'
import { ChevronDown, ChevronUp, Eye, EyeOff, Layers } from 'lucide-react'

interface Props {
  onOpenTool?: (tool: EditSection) => void
}

export default function LayersPanel({ onOpenTool }: Props) {
  const { data, setData } = useCreative()
  const layers = getLayers(data)

  return (
    <Section title="Layers" desc="Canva-style stack — reorder, show/hide, jump to edit">
      <div className="space-y-2">
        {layers.map((layer, i) => (
          <div
            key={layer.id}
            className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Layers className="h-4 w-4" />
            </div>
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onOpenTool?.(layer.tool === 'position' ? 'style' : layer.tool as EditSection)}
            >
              <p className="truncate text-[12px] font-bold text-slate-900">{layer.label}</p>
              <p className="truncate text-[10px] text-slate-500">{layer.description}</p>
            </button>
            <div className="flex shrink-0 flex-col gap-0.5">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => setData((prev) => ({ ...prev, layerOrder: moveLayer(prev.layerOrder, layer.id, 'up') }))}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                title="Bring forward"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={i === layers.length - 1}
                onClick={() => setData((prev) => ({ ...prev, layerOrder: moveLayer(prev.layerOrder, layer.id, 'down') }))}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                title="Send backward"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const patch = setLayerVisible(data, layer.id, !layer.visible)
                if (Object.keys(patch).length) setData((prev) => ({ ...prev, ...patch }))
              }}
              className={`rounded-lg p-2 transition ${layer.visible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
              title={layer.visible ? 'Hide layer' : 'Show layer'}
            >
              {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
        Tip: Use Position tools below to nudge text & photos. Arrow keys move content when not typing.
      </p>
    </Section>
  )
}

import {
  AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowLeft, ArrowRight, ArrowUp,
  FlipHorizontal2, FlipVertical2, RotateCw,
} from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import type { EditSection, ImageRotate, TextAlign } from '../../types/creative'
import { snapValue } from '../../utils/designEffects'
import LayersPanel from './LayersPanel'
import TextEffectsEditor from './TextEffectsEditor'
import { Field, Section, inputClass } from './FormUI'

const ALIGN: { id: TextAlign; icon: typeof AlignLeft; label: string }[] = [
  { id: 'left', icon: AlignLeft, label: 'Left' },
  { id: 'center', icon: AlignCenter, label: 'Center' },
  { id: 'right', icon: AlignRight, label: 'Right' },
]

function NudgeButton({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
    >
      {children}
    </button>
  )
}

interface Props {
  onOpenTool?: (tool: EditSection) => void
}

export default function PositionEditor({ onOpenTool }: Props) {
  const { data, update, setData } = useCreative()
  const snap = data.snapToGrid

  const nudge = (target: 'content' | 'image', dx: number, dy: number, coarse = false) => {
    const step = coarse ? 10 : 1
    const apply = (v: number, d: number) => (snap ? snapValue(v + d * step) : v + d * step)
    if (target === 'content') {
      setData((prev) => ({
        ...prev,
        contentOffsetX: apply(prev.contentOffsetX, dx),
        contentOffsetY: apply(prev.contentOffsetY, dy),
      }))
    } else {
      setData((prev) => ({
        ...prev,
        imageOffsetX: apply(prev.imageOffsetX, dx),
        imageOffsetY: apply(prev.imageOffsetY, dy),
      }))
    }
  }

  const rotateImage = () => {
    const order: ImageRotate[] = [0, 90, 180, 270]
    const idx = order.indexOf(data.imageRotate)
    update('imageRotate', order[(idx + 1) % order.length])
  }

  return (
    <div className="space-y-4">
      <LayersPanel onOpenTool={(t) => onOpenTool?.(t === 'position' ? 'style' : t)} />

      <Section title="Align Text" desc="Page-level text alignment — like Canva Position">
        <div className="grid grid-cols-3 gap-1.5">
          {ALIGN.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => update('textAlign', id)}
              className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[11px] font-semibold transition ${
                data.textAlign === id ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Nudge Content" desc="Move text block — Arrow keys also work (Shift = 10px)">
        <div className="flex flex-col items-center gap-1.5">
          <NudgeButton onClick={() => nudge('content', 0, -1)} title="Up"><ArrowUp className="h-4 w-4" /></NudgeButton>
          <div className="flex gap-1.5">
            <NudgeButton onClick={() => nudge('content', -1, 0)} title="Left"><ArrowLeft className="h-4 w-4" /></NudgeButton>
            <button
              type="button"
              onClick={() => setData((prev) => ({ ...prev, contentOffsetX: 0, contentOffsetY: 0 }))}
              className="rounded-xl border border-dashed border-slate-300 px-3 text-[10px] font-semibold text-slate-500 hover:border-violet-300 hover:text-violet-700"
            >
              Reset
            </button>
            <NudgeButton onClick={() => nudge('content', 1, 0)} title="Right"><ArrowRight className="h-4 w-4" /></NudgeButton>
          </div>
          <NudgeButton onClick={() => nudge('content', 0, 1)} title="Down"><ArrowDown className="h-4 w-4" /></NudgeButton>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Field label="X offset">
            <input type="number" value={data.contentOffsetX} onChange={(e) => update('contentOffsetX', Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Y offset">
            <input type="number" value={data.contentOffsetY} onChange={(e) => update('contentOffsetY', Number(e.target.value))} className={inputClass} />
          </Field>
        </div>
      </Section>

      {data.showCreativeImage && (
        <Section title="Transform Photo" desc="Flip, rotate & nudge — Canva-style image controls">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => update('imageFlipX', !data.imageFlipX)} className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-semibold ${data.imageFlipX ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600'}`}>
              <FlipHorizontal2 className="h-4 w-4" /> Flip H
            </button>
            <button type="button" onClick={() => update('imageFlipY', !data.imageFlipY)} className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-semibold ${data.imageFlipY ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600'}`}>
              <FlipVertical2 className="h-4 w-4" /> Flip V
            </button>
            <button type="button" onClick={rotateImage} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 hover:border-violet-300">
              <RotateCw className="h-4 w-4" /> Rotate {data.imageRotate}°
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Field label="Image X">
              <input type="number" value={data.imageOffsetX} onChange={(e) => update('imageOffsetX', Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Image Y">
              <input type="number" value={data.imageOffsetY} onChange={(e) => update('imageOffsetY', Number(e.target.value))} className={inputClass} />
            </Field>
          </div>
        </Section>
      )}

      <TextEffectsEditor />

      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-700">
        <input type="checkbox" checked={data.snapToGrid} onChange={(e) => update('snapToGrid', e.target.checked)} className="rounded accent-violet-600" />
        Snap to 8px grid when nudging (Canva-style precision)
      </label>
    </div>
  )
}

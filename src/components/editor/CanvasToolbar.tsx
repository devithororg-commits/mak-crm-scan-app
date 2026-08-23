import { Maximize2, Grid3X3, Minus, Plus, ChevronLeft, ChevronRight, Shield } from 'lucide-react'
import { ASPECT_RATIOS } from '../../data/config'
import type { AspectRatio } from '../../types/creative'

interface Props {
  zoom: number
  onZoomChange: (z: number) => void
  showGrid: boolean
  onToggleGrid: () => void
  showSafeZone: boolean
  onToggleSafeZone: () => void
  aspectRatio: AspectRatio
  onAspectChange: (ar: AspectRatio) => void
  carouselEnabled?: boolean
  activeSlide?: number
  slideCount?: number
  onPrevSlide?: () => void
  onNextSlide?: () => void
  snapToGrid?: boolean
  onToggleSnap?: () => void
}

export default function CanvasToolbar({
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  showSafeZone,
  onToggleSafeZone,
  aspectRatio,
  onAspectChange,
  carouselEnabled,
  activeSlide = 0,
  slideCount = 1,
  onPrevSlide,
  onNextSlide,
  snapToGrid,
  onToggleSnap,
}: Props) {
  const platform = ASPECT_RATIOS.find((r) => r.id === aspectRatio)

  return (
    <div className="relative z-20 flex flex-col items-center gap-2 px-4 pb-4">
      {/* Carousel page nav */}
      {carouselEnabled && slideCount > 1 && (
        <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 shadow-md">
          <button type="button" onClick={onPrevSlide} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: slideCount }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === activeSlide ? 'w-4 bg-[#8b3dff]' : 'w-1.5 bg-slate-300'}`}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-600">{activeSlide + 1}/{slideCount}</span>
          <button type="button" onClick={onNextSlide} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bottom toolbar — Canva style */}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-2 py-1.5 shadow-lg">
        {/* Aspect ratio quick switch */}
        <div className="flex items-center gap-0.5 border-r border-slate-200 pr-2">
          {ASPECT_RATIOS.slice(0, 3).map((ar) => (
            <button
              key={ar.id}
              type="button"
              title={ar.label}
              onClick={() => onAspectChange(ar.id)}
              className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                aspectRatio === ar.id ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {ar.id}
            </button>
          ))}
        </div>

        {/* Grid & safe zone */}
        <button
          type="button"
          title="Toggle grid"
          onClick={onToggleGrid}
          className={`rounded-lg p-2 transition ${showGrid ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Grid3X3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Safe zone guide"
          onClick={onToggleSafeZone}
          className={`rounded-lg p-2 transition ${showSafeZone ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Shield className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="Snap to grid"
          onClick={onToggleSnap}
          className={`rounded-lg px-2 py-1.5 text-[10px] font-bold transition ${snapToGrid ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          SNAP
        </button>

        <div className="mx-0.5 h-5 w-px bg-slate-200" />
        <button type="button" onClick={() => onZoomChange(Math.max(0.4, zoom - 0.1))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-50">
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="range"
          min={40}
          max={150}
          value={Math.round(zoom * 100)}
          onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
          className="h-1 w-20 cursor-pointer accent-[#8b3dff]"
        />
        <span className="min-w-[36px] text-center text-[11px] font-bold text-slate-700">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))} className="rounded-lg p-2 text-slate-500 hover:bg-slate-50">
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Fit to screen"
          onClick={() => onZoomChange(1)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        <div className="mx-0.5 h-5 w-px bg-slate-200" />
        <span className="px-1 text-[10px] font-medium text-slate-400">{platform?.w}×{platform?.h}</span>
      </div>
    </div>
  )
}

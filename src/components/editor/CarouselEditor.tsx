import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { Field, Section, inputClass, textareaClass } from './FormUI'

export default function CarouselEditor() {
  const {
    data, update, updateCarouselSlide, addCarouselSlide, removeCarouselSlide, setActiveCarouselSlide,
  } = useCreative()
  const slide = data.carouselSlides[data.activeCarouselSlide]
  const total = data.carouselSlides.length

  return (
    <Section title="Carousel Builder" desc="Multi-slide posts for LinkedIn, Instagram & TikTok">
      <label className="mb-4 flex items-center gap-2 text-xs text-slate-700">
        <input
          type="checkbox"
          checked={data.carouselEnabled}
          onChange={(e) => update('carouselEnabled', e.target.checked)}
          className="rounded accent-indigo-500"
        />
        Enable carousel mode (preview shows active slide)
      </label>

      {data.carouselEnabled && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setActiveCarouselSlide(Math.max(0, data.activeCarouselSlide - 1))} disabled={data.activeCarouselSlide === 0} className="rounded-lg border border-slate-200 p-2 text-slate-400 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-1 gap-1">
              {data.carouselSlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveCarouselSlide(i)}
                  className={`flex-1 rounded-lg border py-2 text-[10px] font-medium transition ${
                    i === data.activeCarouselSlide ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  {s.badge || i + 1}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setActiveCarouselSlide(Math.min(total - 1, data.activeCarouselSlide + 1))} disabled={data.activeCarouselSlide >= total - 1} className="rounded-lg border border-slate-200 p-2 text-slate-400 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {slide && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Slide {data.activeCarouselSlide + 1} of {total}
              </p>
              <Field label="Title">
                <input type="text" value={slide.title} onChange={(e) => updateCarouselSlide(data.activeCarouselSlide, { title: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Subtitle">
                <input type="text" value={slide.subtitle} onChange={(e) => updateCarouselSlide(data.activeCarouselSlide, { subtitle: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Body">
                <textarea rows={3} value={slide.body} onChange={(e) => updateCarouselSlide(data.activeCarouselSlide, { body: e.target.value })} className={textareaClass} />
              </Field>
              <Field label="Badge">
                <input type="text" value={slide.badge} onChange={(e) => updateCarouselSlide(data.activeCarouselSlide, { badge: e.target.value })} className={inputClass} />
              </Field>
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={addCarouselSlide} disabled={total >= 10} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-[10px] text-slate-400 hover:text-slate-900 disabled:opacity-40">
              <Plus className="h-3.5 w-3.5" /> Add Slide
            </button>
            <button type="button" onClick={() => removeCarouselSlide(data.activeCarouselSlide)} disabled={total <= 2} className="flex items-center justify-center gap-1 rounded-lg border border-red-200 px-4 py-2 text-[10px] text-red-600 disabled:opacity-40">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-slate-500">Export carousel as PDF or ZIP from the preview panel below.</p>
        </div>
      )}
    </Section>
  )
}

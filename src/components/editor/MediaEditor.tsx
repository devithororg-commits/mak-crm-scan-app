import { useRef, useState } from 'react'
import { ImagePlus, Trash2, Upload, Wand2, Plus, X } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import type { ImageAlign, ImageFit, ImageObjectPosition, ImagePosition, ImageSizePreset, UploadQuality } from '../../types/creative'
import { processImageWithQuality } from '../../utils/imageEnhance'
import { IMAGE_FILTER_PRESETS, applyFilterPreset } from '../../utils/imageFilters'
import { UPLOAD_QUALITY_CONFIG } from '../../utils/imageEnhance'
import { IMAGE_SIZE_PRESETS } from '../../utils/imageLayout'
import { validateImageFile } from '../../utils/imageUpload'
import StockPhotoPicker from './StockPhotoPicker'
import { Field, Section } from './FormUI'

const POSITIONS: { id: ImagePosition; label: string }[] = [
  { id: 'top', label: 'Top' }, { id: 'cover', label: 'Banner' }, { id: 'bottom', label: 'Bottom' },
  { id: 'left', label: 'Left' }, { id: 'right', label: 'Right' }, { id: 'background', label: 'BG' },
]
const ALIGN_OPTIONS: { id: ImageAlign; label: string }[] = [
  { id: 'stretch', label: 'Full' }, { id: 'left', label: 'Left' }, { id: 'center', label: 'Center' }, { id: 'right', label: 'Right' },
]
const OBJECT_POSITIONS: { id: ImageObjectPosition; label: string }[] = [
  { id: 'center', label: 'Center' }, { id: 'top', label: 'Top' }, { id: 'bottom', label: 'Bottom' },
  { id: 'left', label: 'Left' }, { id: 'right', label: 'Right' },
]

function SizeSlider({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="text-[11px] text-slate-700">{label}</span>
        <span className="text-[10px] font-mono text-indigo-700">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-indigo-500"
      />
    </div>
  )
}

export default function MediaEditor() {
  const { data, update, setData } = useCreative()
  const galleryRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const isBg = data.imagePosition === 'background'
  const isCover = data.imagePosition === 'cover'
  const isTopBottom = data.imagePosition === 'top' || data.imagePosition === 'bottom'

  const applyPreset = (preset: ImageSizePreset) => {
    const p = IMAGE_SIZE_PRESETS[preset]
    update('imageSizePreset', preset)
    if (preset !== 'custom') {
      update('imageHeight', p.height)
      update('imageWidth', p.width)
      update('imageCoverHeight', p.coverHeight)
    }
  }

  const handleMainUpload = async (file: File) => {
    setError('')
    setProcessing(true)
    try {
      const url = await processImageWithQuality(file, data.uploadQuality, {
        autoEnhance: data.imageAutoEnhance,
        brightness: data.imageBrightness,
        contrast: data.imageContrast,
        saturation: data.imageSaturation,
        sharpness: data.imageSharpness,
      })
      update('imageUrl', url)
      update('showCreativeImage', true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleGalleryUpload = async (files: FileList) => {
    setProcessing(true)
    try {
      const newUrls: string[] = []
      for (const file of Array.from(files).slice(0, 10)) {
        const err = validateImageFile(file)
        if (err) continue
        const url = await processImageWithQuality(file, data.uploadQuality, {
          autoEnhance: data.imageAutoEnhance,
          brightness: data.imageBrightness,
          contrast: data.imageContrast,
          saturation: data.imageSaturation,
          sharpness: data.imageSharpness,
        })
        newUrls.push(url)
      }
      setData((prev) => ({
        ...prev,
        imageGallery: [...prev.imageGallery, ...newUrls].slice(0, 10),
        imageUrl: prev.imageUrl || newUrls[0] || '',
        showCreativeImage: true,
      }))
    } finally {
      setProcessing(false)
    }
  }

  const reprocessImage = async () => {
    if (!data.imageUrl) return
    setProcessing(true)
    try {
      const { enhanceImage } = await import('../../utils/imageEnhance')
      const { urlToDataUrl } = await import('../../utils/imageEmbed')
      const src = data.imageUrl.startsWith('data:') ? data.imageUrl : await urlToDataUrl(data.imageUrl)
      const url = await enhanceImage(src, {
        autoEnhance: data.imageAutoEnhance,
        brightness: data.imageBrightness,
        contrast: data.imageContrast,
        saturation: data.imageSaturation,
        sharpness: data.imageSharpness,
      })
      update('imageUrl', url)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Section title="Main Image" desc="HQ upload · filters · multi-photo gallery">
      <label className="mb-4 flex items-center gap-2 text-xs text-slate-700">
        <input
          type="checkbox"
          checked={data.showCreativeImage}
          onChange={(e) => update('showCreativeImage', e.target.checked)}
          className="rounded accent-indigo-500"
        />
        Show main image on creative
      </label>

      {data.showCreativeImage && (
        <div className="space-y-5">
          {/* Upload Quality */}
          <div>
            <span className="mb-2 block text-[11px] font-medium text-slate-700">Upload Quality</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['standard', 'high', 'ultra'] as UploadQuality[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => update('uploadQuality', q)}
                  className={`rounded-lg border py-2 text-[9px] font-medium transition ${
                    data.uploadQuality === q ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'
                  }`}
                >
                  {UPLOAD_QUALITY_CONFIG[q].label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Main image upload */}
          <div>
            {data.imageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex h-36 items-center justify-center p-3">
                  <img
                    src={data.imageUrl}
                    alt="Preview"
                    className="max-h-full max-w-full rounded-lg object-contain"
                    style={{
                      filter: `brightness(${data.imageBrightness}%) contrast(${data.imageContrast}%) saturate(${data.imageSaturation}%)`,
                    }}
                  />
                </div>
                <div className="flex border-t border-slate-200">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 py-2 text-[10px] text-slate-400 hover:bg-slate-50 hover:text-slate-900">
                    <Upload className="h-3 w-3" /> Replace
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMainUpload(f); e.target.value = '' }} />
                  </label>
                  <button type="button" onClick={() => update('imageUrl', '')} className="flex flex-1 items-center justify-center gap-1.5 border-l border-slate-200 py-2 text-[10px] text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition ${processing ? 'border-indigo-500/50' : 'border-slate-200 hover:border-indigo-500/40'}`}>
                {processing ? (
                  <p className="text-xs text-slate-400">Processing HQ image...</p>
                ) : (
                  <>
                    <ImagePlus className="mb-2 h-8 w-8 text-slate-500" />
                    <p className="text-xs font-medium text-slate-700">Click to upload HQ image</p>
                    <p className="mt-1 text-[10px] text-slate-500">PNG, JPG, WebP, HEIC · Max 15MB</p>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMainUpload(f); e.target.value = '' }} />
              </label>
            )}
          </div>

          {/* Stock photos */}
          <StockPhotoPicker onSelect={(url) => { update('imageUrl', url); update('showCreativeImage', true) }} />

          {/* Multi-image gallery */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Photo Gallery ({data.imageGallery.length}/10)
              </p>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                disabled={data.imageGallery.length >= 10 || processing}
                className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
              >
                <Plus className="h-3 w-3" /> Add Photos
              </button>
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) handleGalleryUpload(e.target.files); e.target.value = '' }}
              />
            </div>
            {data.imageGallery.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5">
                {data.imageGallery.map((url, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, imageGallery: prev.imageGallery.filter((_, j) => j !== i) }))}
                      className="absolute right-0.5 top-0.5 rounded bg-black/60 p-0.5 opacity-0 transition group-hover:opacity-100"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => update('imageUrl', url)}
                      className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-[8px] text-white opacity-0 transition group-hover:opacity-100"
                    >
                      Set main
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-[9px] text-slate-500">Use Photo Gallery template for multi-image layouts</p>
          </div>

          {/* Filter Presets */}
          <div>
            <span className="mb-2 block text-[11px] font-medium text-slate-700">Filter Presets</span>
            <div className="grid grid-cols-4 gap-1.5">
              {IMAGE_FILTER_PRESETS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setData((prev) => ({ ...prev, ...applyFilterPreset(f.id) }))}
                  className={`rounded-lg border py-2 text-center transition ${
                    data.imageFilter === f.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-[10px] font-medium text-slate-900">{f.name}</p>
                  <p className="text-[8px] text-slate-500">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Auto Enhance */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={data.imageAutoEnhance}
                  onChange={(e) => update('imageAutoEnhance', e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                Auto-enhance on upload
              </label>
              <button
                type="button"
                onClick={reprocessImage}
                disabled={!data.imageUrl || processing}
                className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
              >
                <Wand2 className="h-3 w-3" /> Re-apply
              </button>
            </div>
            <SizeSlider label="Brightness" value={data.imageBrightness} min={70} max={130} unit="%" onChange={(v) => update('imageBrightness', v)} />
            <SizeSlider label="Contrast" value={data.imageContrast} min={70} max={150} unit="%" onChange={(v) => update('imageContrast', v)} />
            <SizeSlider label="Saturation" value={data.imageSaturation} min={0} max={150} unit="%" onChange={(v) => update('imageSaturation', v)} />
            <SizeSlider label="Sharpness" value={data.imageSharpness} min={0} max={100} unit="%" onChange={(v) => update('imageSharpness', v)} />
          </div>

          {/* Gradient Overlay */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={data.imageGradientOverlay}
                onChange={(e) => update('imageGradientOverlay', e.target.checked)}
                className="rounded accent-indigo-500"
              />
              Gradient overlay (text readability)
            </label>
            {data.imageGradientOverlay && (
              <SizeSlider
                label="Gradient Strength"
                value={data.imageGradientStrength}
                min={20}
                max={90}
                unit="%"
                onChange={(v) => update('imageGradientStrength', v)}
              />
            )}
          </div>

          {/* Layout controls */}
          <div>
            <span className="mb-2 block text-[11px] font-medium text-slate-700">Placement</span>
            <div className="grid grid-cols-3 gap-1.5">
              {POSITIONS.map((pos) => (
                <button key={pos.id} type="button" onClick={() => update('imagePosition', pos.id)}
                  className={`rounded-lg border py-2 text-[10px] font-medium transition ${data.imagePosition === pos.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'}`}>
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {(isTopBottom || isCover) && !isBg && (
            <div>
              <span className="mb-2 block text-[11px] font-medium text-slate-700">Alignment</span>
              <div className="grid grid-cols-4 gap-1.5">
                {ALIGN_OPTIONS.map((a) => (
                  <button key={a.id} type="button" onClick={() => update('imageAlign', a.id)}
                    className={`rounded-lg border py-2 text-[9px] font-medium transition ${data.imageAlign === a.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'}`}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="mb-2 block text-[11px] font-medium text-slate-700">Size Preset</span>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(IMAGE_SIZE_PRESETS) as ImageSizePreset[]).map((preset) => (
                <button key={preset} type="button" onClick={() => applyPreset(preset)}
                  className={`rounded-lg border py-2 text-center transition ${data.imageSizePreset === preset ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`}>
                  <p className="text-[10px] font-medium text-slate-900">{IMAGE_SIZE_PRESETS[preset].label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fit">
              <div className="flex gap-1">
                {(['cover', 'contain'] as ImageFit[]).map((fit) => (
                  <button key={fit} type="button" onClick={() => update('imageFit', fit)}
                    className={`flex-1 rounded-lg border py-2 text-[10px] capitalize transition ${data.imageFit === fit ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'}`}>
                    {fit}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Focus">
              <select value={data.imageObjectPosition} onChange={(e) => update('imageObjectPosition', e.target.value as ImageObjectPosition)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] text-slate-900 outline-none">
                {OBJECT_POSITIONS.map((p) => <option key={p.id} value={p.id} className="bg-white">{p.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="flex gap-3">
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-700">
              <input type="checkbox" checked={data.imageBorder} onChange={(e) => update('imageBorder', e.target.checked)} className="rounded accent-indigo-500" /> Border
            </label>
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-700">
              <input type="checkbox" checked={data.imageShadow} onChange={(e) => update('imageShadow', e.target.checked)} className="rounded accent-indigo-500" /> Shadow
            </label>
          </div>

          {error && <p className="text-[10px] text-red-600">{error}</p>}
        </div>
      )}
    </Section>
  )
}

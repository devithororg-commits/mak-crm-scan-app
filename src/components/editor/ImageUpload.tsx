import { useRef, useState } from 'react'
import { ImagePlus, Link, Trash2, Upload } from 'lucide-react'
import { processImageFile } from '../../utils/imageUpload'
import { urlToDataUrl } from '../../utils/imageEmbed'
import { Field, inputClass } from './FormUI'

interface ImageUploadProps {
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  maxWidth?: number
  previewHeight?: string
}

export default function ImageUpload({
  label,
  hint,
  value,
  onChange,
  maxWidth = 1200,
  previewHeight = 'h-28',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [urlLoading, setUrlLoading] = useState(false)
  const [showUrl, setShowUrl] = useState(false)

  const handleUrl = async (raw: string) => {
    if (!raw.trim()) {
      onChange('')
      return
    }
    if (raw.startsWith('data:')) {
      onChange(raw)
      return
    }
    setUrlLoading(true)
    setError('')
    try {
      onChange(await urlToDataUrl(raw))
    } catch {
      onChange(raw)
      setError('Could not embed image — export may fail. Try uploading the file instead.')
    } finally {
      setUrlLoading(false)
    }
  }

  const handleFile = async (file: File) => {
    setError('')
    setLoading(true)
    try {
      const dataUrl = await processImageFile(file, maxWidth)
      onChange(dataUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <Field label={label} hint={hint}>
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className={`flex ${previewHeight} items-center justify-center p-3`}>
            <img src={value} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
          </div>
          <div className="flex border-t border-slate-200">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-1.5 py-2 text-[10px] text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            >
              <Upload className="h-3 w-3" /> Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex flex-1 items-center justify-center gap-1.5 border-l border-slate-200 py-2 text-[10px] text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition ${
            dragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 bg-white hover:border-indigo-500/40 hover:bg-slate-50'
          }`}
        >
          {loading ? (
            <p className="text-xs text-slate-400">Processing image...</p>
          ) : (
            <>
              <ImagePlus className="mb-2 h-8 w-8 text-slate-500" />
              <p className="text-xs font-medium text-slate-700">Click or drag image here</p>
              <p className="mt-1 text-[10px] text-slate-500">PNG, JPG, WebP, SVG · Max 8MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => setShowUrl(!showUrl)}
        className="mt-2 flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-600"
      >
        <Link className="h-3 w-3" /> {showUrl ? 'Hide URL input' : 'Or paste image URL'}
      </button>

      {showUrl && (
        <input
          type="url"
          value={value.startsWith('data:') ? '' : value}
          onChange={(e) => handleUrl(e.target.value)}
          onBlur={(e) => { if (e.target.value && !e.target.value.startsWith('data:')) handleUrl(e.target.value) }}
          placeholder="https://example.com/image.jpg"
          className={`${inputClass} mt-2`}
          disabled={urlLoading}
        />
      )}

      {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
    </Field>
  )
}

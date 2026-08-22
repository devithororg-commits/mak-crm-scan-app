import { useState } from 'react'
import { ChevronDown, Image } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import type { CreativeData, LogoFit } from '../../types/creative'
import { LOGO_PLACEMENT_LABELS, type LogoPlacement } from '../templates/CreativeLogo'
import ImageUpload from './ImageUpload'
import { Section } from './FormUI'

type PlacementFieldMap = {
  show: keyof CreativeData
  size: keyof CreativeData
  radius: keyof CreativeData
  fit: keyof CreativeData
  containerSize?: keyof CreativeData
  border?: keyof CreativeData
}

const PLACEMENT_FIELDS: Record<LogoPlacement, PlacementFieldMap> = {
  header: {
    show: 'headerShowLogo',
    size: 'headerLogoSize',
    radius: 'headerLogoRadius',
    fit: 'headerLogoFit',
    containerSize: 'headerLogoContainerSize',
  },
  hero: {
    show: 'heroShowLogo',
    size: 'heroLogoSize',
    radius: 'heroLogoRadius',
    fit: 'heroLogoFit',
  },
  avatar: {
    show: 'avatarShowLogo',
    size: 'avatarLogoSize',
    radius: 'avatarLogoRadius',
    fit: 'avatarLogoFit',
    border: 'avatarLogoBorder',
  },
  badge: {
    show: 'badgeShowLogo',
    size: 'badgeLogoSize',
    radius: 'badgeLogoRadius',
    fit: 'badgeLogoFit',
  },
  footer: {
    show: 'footerShowLogo',
    size: 'footerLogoSize',
    radius: 'footerLogoRadius',
    fit: 'footerLogoFit',
  },
}

const SIZE_LIMITS: Record<LogoPlacement, { min: number; max: number }> = {
  header: { min: 16, max: 80 },
  hero: { min: 32, max: 120 },
  avatar: { min: 48, max: 160 },
  badge: { min: 24, max: 72 },
  footer: { min: 16, max: 80 },
}

function SizeSlider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between">
        <span className="text-[11px] text-slate-700">{label}</span>
        <span className="text-[10px] font-mono text-indigo-700">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-indigo-500"
      />
    </div>
  )
}

function PlacementControls({ placement }: { placement: LogoPlacement }) {
  const { data, update } = useCreative()
  const fields = PLACEMENT_FIELDS[placement]
  const limits = SIZE_LIMITS[placement]
  const meta = LOGO_PLACEMENT_LABELS[placement]

  const show = data[fields.show] as boolean
  const size = data[fields.size] as number
  const radius = data[fields.radius] as number
  const fit = data[fields.fit] as LogoFit
  const containerSize = fields.containerSize ? (data[fields.containerSize] as number) : undefined
  const border = fields.border ? (data[fields.border] as number) : undefined

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <label className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-900">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => update(fields.show, e.target.checked)}
          className="rounded accent-indigo-500"
        />
        Show {meta.label.toLowerCase()}
      </label>

      {show && (
        <div className="space-y-3">
          <SizeSlider
            label="Logo Size"
            value={size}
            min={limits.min}
            max={limits.max}
            unit="px"
            onChange={(v) => update(fields.size, v)}
          />

          <SizeSlider
            label={radius >= 999 ? 'Shape (Circle)' : 'Corner Radius'}
            value={radius >= 999 ? 50 : radius}
            min={0}
            max={radius >= 999 ? 50 : 32}
            unit={radius >= 999 ? '% round' : 'px'}
            onChange={(v) => update(fields.radius, placement === 'avatar' || placement === 'badge' ? (v >= 50 ? 999 : v) : v)}
          />

          {(placement === 'avatar' || placement === 'badge') && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update(fields.radius, 999)}
                className={`flex-1 rounded-lg border py-1.5 text-[10px] ${radius >= 999 ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'}`}
              >
                Circle
              </button>
              <button
                type="button"
                onClick={() => update(fields.radius, placement === 'avatar' ? 12 : 8)}
                className={`flex-1 rounded-lg border py-1.5 text-[10px] ${radius < 999 ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'}`}
              >
                Rounded
              </button>
            </div>
          )}

          <div>
            <span className="mb-1.5 block text-[11px] text-slate-700">Fit Mode</span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['contain', 'cover'] as LogoFit[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => update(fields.fit, f)}
                  className={`rounded-lg border py-1.5 text-[10px] capitalize ${
                    fit === f ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {fields.containerSize && containerSize !== undefined && (
            <SizeSlider
              label="Container Size (Feature card)"
              value={containerSize}
              min={40}
              max={96}
              unit="px"
              onChange={(v) => update(fields.containerSize!, v)}
            />
          )}

          {fields.border !== undefined && border !== undefined && (
            <SizeSlider
              label="Border Width"
              value={border}
              min={0}
              max={8}
              unit="px"
              onChange={(v) => update(fields.border!, v)}
            />
          )}

          {/* Mini preview */}
          <div className="flex items-center justify-center rounded-lg bg-slate-800/50 py-4">
            {data.logoUrl ? (
              <img
                src={data.logoUrl}
                alt=""
                style={{
                  width: size,
                  height: size,
                  borderRadius: radius >= 999 ? '50%' : radius,
                  objectFit: fit,
                  border: border ? `${border}px solid white` : undefined,
                }}
              />
            ) : (
              <div
                className="flex items-center justify-center bg-indigo-600 font-bold text-white"
                style={{
                  width: size,
                  height: size,
                  borderRadius: radius >= 999 ? '50%' : radius,
                  fontSize: size * 0.4,
                  border: border ? `${border}px solid white` : undefined,
                }}
              >
                L
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Accordion({ placement }: { placement: LogoPlacement }) {
  const [open, setOpen] = useState(placement === 'header')
  const meta = LOGO_PLACEMENT_LABELS[placement]

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"
      >
        <div>
          <p className="text-xs font-semibold text-slate-900">{meta.label}</p>
          <p className="text-[10px] text-slate-500">{meta.desc}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-slate-200 p-3"><PlacementControls placement={placement} /></div>}
    </div>
  )
}

export default function LogoEditor() {
  const { data, update } = useCreative()

  return (
    <>
      <Section title="Logo Upload" desc="Upload once — control size per component below">
        <ImageUpload
          label="Company Logo"
          hint="PNG with transparent background works best"
          value={data.logoUrl}
          onChange={(url) => update('logoUrl', url)}
          maxWidth={800}
          previewHeight="h-24"
        />
      </Section>

      <Section title="Logo Size Controls" desc="Each component has individual size, shape & fit controls">
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-[10px] text-indigo-700">
          <Image className="h-3.5 w-3.5 shrink-0" />
          Changes apply live in preview — each placement is independent
        </div>

        <div className="space-y-2">
          {(['header', 'hero', 'avatar', 'badge', 'footer'] as LogoPlacement[]).map((p) => (
            <Accordion key={p} placement={p} />
          ))}
        </div>
      </Section>
    </>
  )
}

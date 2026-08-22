import type { ReactNode } from 'react'
import type { IconName } from '../../components/icons/iconNames'
import type { TemplateId } from '../../types/creative'

interface Props {
  id: TemplateId
  className?: string
}

/** Illustrated mini-layout previews — not blank placeholders */
export default function TemplateThumb({ id, className = '' }: Props) {
  return (
    <div className={`relative overflow-hidden rounded-t-[12px] bg-slate-100 ${className}`}>
      {THUMBS[id]}
    </div>
  )
}

function Bar({ w = 'w-full', h = 'h-1', color = 'bg-slate-300' }) {
  return <div className={`${h} ${w} rounded-full ${color}`} />
}

function Dot({ color = 'bg-indigo-400' }) {
  return <div className={`h-2 w-2 rounded-full ${color}`} />
}

const THUMBS: Record<TemplateId, ReactNode> = {
  analytics: (
    <div className="flex h-full flex-col bg-white p-2">
      <div className="mb-1.5 flex items-center gap-1">
        <Dot />
        <Bar w="w-8" color="bg-slate-400" />
      </div>
      <Bar w="w-10" h="h-1.5" color="bg-slate-700" />
      <div className="mt-2 flex flex-1 items-end gap-0.5">
        {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-indigo-400" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-0.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded bg-slate-50 p-0.5">
            <Bar w="w-4" color="bg-indigo-500" />
            <Bar w="w-3" h="h-0.5" />
          </div>
        ))}
      </div>
    </div>
  ),

  'feature-card': (
    <div className="flex h-full flex-col justify-end bg-gradient-to-br from-blue-600 to-indigo-800 p-2">
      <Bar w="w-6" color="bg-white/50" />
      <Bar w="w-10" h="h-1.5" color="bg-white" />
      <Bar w="w-8" color="bg-white/40" />
      <div className="mt-1.5 w-8 rounded-full bg-white/90 py-0.5" />
    </div>
  ),

  progress: (
    <div className="flex h-full flex-col justify-center bg-gradient-to-br from-rose-500 to-rose-900 p-2">
      <Bar w="w-8" color="bg-white/60" />
      <div className="my-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
        <div className="h-full w-3/4 rounded-full bg-white" />
      </div>
      <div className="text-[6px] font-bold text-white/80">73%</div>
    </div>
  ),

  'stats-dashboard': (
    <div className="grid h-full grid-cols-2 gap-1 bg-slate-50 p-1.5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded bg-white p-1 shadow-sm">
          <Bar w="w-5" color="bg-indigo-500" />
          <Bar w="w-4" h="h-0.5" />
        </div>
      ))}
    </div>
  ),

  'report-story': (
    <div className="flex h-full flex-col bg-stone-100 p-2">
      <Bar w="w-6" color="bg-amber-600" />
      <Bar w="w-10" h="h-1.5" color="bg-stone-700" />
      <div className="mt-1.5 flex-1 space-y-0.5">
        <Bar /><Bar w="w-4/5" /><Bar w="w-3/5" />
      </div>
      <div className="mt-1 h-4 rounded bg-white" />
    </div>
  ),

  'profile-card': (
    <div className="flex h-full flex-col bg-white">
      <div className="h-1/2 bg-gradient-to-br from-indigo-200 to-violet-200" />
      <div className="relative flex flex-1 flex-col items-center px-2 pt-3">
        <div className="absolute -top-3 h-6 w-6 rounded-full border-2 border-white bg-indigo-400 shadow" />
        <Bar w="w-8" h="h-1" color="bg-slate-700" />
        <Bar w="w-6" h="w-0.5" color="bg-slate-400" />
        <div className="mt-1 flex gap-0.5">
          {[1, 2, 3].map((i) => <div key={i} className="h-2 w-4 rounded bg-slate-100" />)}
        </div>
      </div>
    </div>
  ),

  'job-card': (
    <div className="flex h-full flex-col bg-white p-2 shadow-sm">
      <div className="mb-1 flex items-center gap-1">
        <div className="h-3 w-3 rounded bg-indigo-100" />
        <Bar w="w-6" color="bg-slate-600" />
      </div>
      <Bar w="w-10" h="h-1.5" color="bg-slate-800" />
      <Bar w="w-8" />
      <div className="mt-auto flex gap-0.5">
        {[1, 2, 3].map((i) => <div key={i} className="rounded bg-slate-50 px-1 py-0.5 text-[5px] text-slate-400">tag</div>)}
      </div>
    </div>
  ),

  'kanban-task': (
    <div className="flex h-full items-start justify-center bg-slate-100 p-2">
      <div className="w-4/5 rounded-lg border-l-4 border-indigo-500 bg-white p-1.5 shadow">
        <Bar w="w-8" color="bg-slate-700" />
        <Bar w="w-6" h="h-0.5" />
        <div className="mt-1 flex gap-0.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <Bar w="w-4" h="h-0.5" />
        </div>
      </div>
    </div>
  ),

  'pastel-job': (
    <div className="flex h-full flex-col justify-between bg-purple-100 p-2">
      <Bar w="w-8" color="bg-purple-600" />
      <div className="rounded-lg bg-white/80 p-1.5">
        <Bar w="w-8" color="bg-purple-700" />
        <Bar w="w-6" h="h-0.5" />
      </div>
      <div className="rounded-full bg-purple-500 py-0.5" />
    </div>
  ),

  'community-post': (
    <div className="flex h-full flex-col bg-orange-50 p-2">
      <div className="mb-1 flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-orange-300" />
        <Bar w="w-5" color="bg-orange-700" />
      </div>
      <Bar w="w-10" h="h-1.5" color="bg-slate-800" />
      <div className="mt-1 flex-1 rounded bg-white" />
    </div>
  ),

  'just-listed': (
    <div className="flex h-full flex-col bg-white">
      <div className="relative h-1/2 bg-gradient-to-br from-emerald-200 to-teal-300">
        <div className="absolute left-1 top-1 rounded bg-emerald-500 px-1 py-0.5 text-[5px] font-bold text-white">NEW</div>
      </div>
      <div className="flex flex-1 flex-col p-1.5">
        <Bar w="w-8" color="bg-slate-800" />
        <Bar w="w-6" color="bg-emerald-600" />
        <div className="mt-auto grid grid-cols-3 gap-0.5">
          {[1, 2, 3].map((i) => <div key={i} className="rounded bg-emerald-50 p-0.5 text-center text-[4px] text-emerald-700">3</div>)}
        </div>
      </div>
    </div>
  ),

  'just-sold': (
    <div className="flex h-full flex-col bg-slate-800 p-2">
      <div className="mb-1 rounded bg-amber-500 px-1 py-0.5 text-[5px] font-bold text-white w-fit">SOLD</div>
      <div className="flex-1 rounded bg-slate-700" />
      <Bar w="w-8" color="bg-white" />
      <Bar w="w-6" color="bg-amber-400" />
    </div>
  ),

  'open-house': (
    <div className="flex h-full flex-col bg-violet-50 p-2">
      <div className="mb-1 rounded bg-violet-600 px-1 py-0.5 text-[5px] font-bold text-white w-fit">OPEN HOUSE</div>
      <div className="flex-1 rounded-lg bg-violet-200" />
      <Bar w="w-8" color="bg-violet-800" />
      <Bar w="w-6" h="h-0.5" color="bg-violet-500" />
    </div>
  ),

  'profile-glass': (
    <div className="relative flex h-full flex-col justify-end bg-gradient-to-br from-slate-600 to-slate-800 p-2">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="relative">
        <Bar w="w-8" color="bg-white" />
        <Bar w="w-6" color="bg-white/50" />
        <div className="mt-1 w-8 rounded-full bg-white/20 py-0.5" />
      </div>
    </div>
  ),

  'buyer-match': (
    <div className="flex h-full flex-col bg-white p-2">
      <div className="mb-1 h-1/3 rounded bg-slate-200" />
      <Bar w="w-9" h="h-1.5" color="bg-slate-800" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="mt-0.5 flex items-center gap-0.5">
          <Dot color="bg-indigo-500" />
          <Bar w="w-7" h="h-0.5" />
        </div>
      ))}
      <div className="mt-auto rounded-full bg-indigo-600 py-0.5" />
    </div>
  ),

  'luxury-frame': (
    <div className="flex h-full items-center justify-center bg-[#f4f1ea] p-2">
      <div className="h-full w-full border-2 border-amber-700/30 p-1">
        <div className="flex h-full flex-col bg-white p-1">
          <Bar w="w-4" color="bg-amber-700" />
          <div className="my-0.5 flex-1 bg-stone-200" />
          <Bar w="w-6" h="h-0.5" />
        </div>
      </div>
    </div>
  ),

  testimonial: (
    <div className="flex h-full flex-col items-center justify-center bg-white p-2 text-center">
      <div className="mb-1 text-[8px] text-amber-400">★★★★★</div>
      <Bar w="w-10" />
      <Bar w="w-8" h="h-0.5" />
      <div className="mt-1.5 h-4 w-4 rounded-full bg-indigo-200" />
      <Bar w="w-6" h="h-0.5" color="bg-slate-600" />
    </div>
  ),

  'market-update': (
    <div className="flex h-full flex-col bg-gradient-to-br from-indigo-600 to-violet-600 p-2">
      <Bar w="w-6" color="bg-white/50" />
      <Bar w="w-10" h="h-1.5" color="bg-white" />
      <div className="mt-1.5 grid grid-cols-2 gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded bg-white/15 p-0.5">
            <Bar w="w-4" color="bg-white" />
          </div>
        ))}
      </div>
    </div>
  ),

  'photo-gallery': (
    <div className="flex h-full flex-col bg-white">
      <div className="grid h-1/2 grid-cols-2 gap-0.5 p-0.5">
        <div className="col-span-2 row-span-1 bg-slate-300" />
        <div className="bg-slate-200" />
        <div className="bg-slate-300" />
      </div>
      <div className="flex flex-1 flex-col p-1.5">
        <Bar w="w-8" color="bg-slate-800" />
        <Bar w="w-6" color="bg-indigo-600" />
      </div>
    </div>
  ),

  'price-drop': (
    <div className="flex h-full flex-col bg-white">
      <div className="bg-gradient-to-r from-rose-500 to-red-600 py-1 text-center text-[5px] font-bold text-white">PRICE DROP</div>
      <div className="flex flex-1 flex-col items-center justify-center p-2">
        <Bar w="w-6" color="bg-slate-300" />
        <Bar w="w-8" h="h-1.5" color="bg-rose-600" />
        <div className="mt-1 rounded border border-dashed border-rose-200 bg-rose-50 px-2 py-1">
          <Bar w="w-5" color="bg-emerald-500" />
        </div>
      </div>
    </div>
  ),

  'emi-calculator': (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-800 to-indigo-950 p-2">
      <Bar w="w-6" color="bg-indigo-400" />
      <div className="my-2 flex flex-1 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2">
        <Bar w="w-5" color="bg-white/40" />
        <Bar w="w-8" h="h-2" color="bg-white" />
      </div>
      <div className="grid grid-cols-2 gap-0.5">
        <div className="rounded bg-white/10 p-1"><Bar w="w-4" color="bg-indigo-300" /></div>
        <div className="rounded bg-white/10 p-1"><Bar w="w-4" color="bg-indigo-300" /></div>
      </div>
    </div>
  ),

  'agent-spotlight': (
    <div className="flex h-full flex-col bg-white">
      <div className="h-1/3 bg-gradient-to-br from-indigo-500 to-violet-600" />
      <div className="flex flex-1 flex-col items-center px-2 pt-4">
        <div className="absolute top-6 h-6 w-6 rounded-full border-2 border-white bg-indigo-200" />
        <Bar w="w-7" h="h-1" color="bg-slate-700" />
        <Bar w="w-5" h="h-0.5" color="bg-indigo-500" />
        <div className="mt-1.5 grid w-full grid-cols-3 gap-0.5">
          {[1, 2, 3].map((i) => <div key={i} className="rounded bg-slate-50 p-0.5"><Bar w="w-3" color="bg-indigo-500" /></div>)}
        </div>
      </div>
    </div>
  ),

  'festival-wishes': (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 p-2 text-center">
      <Bar w="w-5" color="bg-white/50" />
      <Bar w="w-8" h="h-1" color="bg-white" />
      <Bar w="w-6" color="bg-white/40" />
      <div className="mt-2 rounded-full border border-white/30 px-2 py-0.5" />
    </div>
  ),

  'site-visit': (
    <div className="flex h-full flex-col bg-white">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-2">
        <Bar w="w-6" color="bg-white" />
        <Bar w="w-4" h="h-0.5" color="bg-white/50" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-1 rounded bg-teal-50 p-1">
            <Dot color="bg-teal-500" />
            <Bar w="w-6" h="h-0.5" />
          </div>
        ))}
      </div>
    </div>
  ),

  'before-after': (
    <div className="relative flex h-full bg-slate-800">
      <div className="relative flex-1 bg-slate-600">
        <div className="absolute bottom-0.5 left-0.5 text-[4px] text-white/50">BEFORE</div>
      </div>
      <div className="relative flex-1 bg-slate-500">
        <div className="absolute bottom-0.5 left-0.5 text-[4px] text-amber-300">AFTER</div>
      </div>
      <div className="absolute left-1/2 top-1/2 z-10 flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-400 text-[3px] font-bold text-slate-900">VS</div>
    </div>
  ),

  'neighbourhood-guide': (
    <div className="flex h-full flex-col bg-white">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2">
        <Bar w="w-6" color="bg-white" />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-0.5 p-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-0.5 rounded bg-emerald-50 p-1">
            <Dot color="bg-emerald-500" />
            <Bar w="w-4" h="h-0.5" />
          </div>
        ))}
      </div>
    </div>
  ),

  'investment-roi': (
    <div className="flex h-full flex-col bg-gradient-to-br from-violet-950 to-indigo-950 p-2">
      <Bar w="w-6" color="bg-violet-400" />
      <div className="my-1 grid grid-cols-3 gap-0.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded bg-white/10 p-1 text-center">
            <Bar w="w-3" color="bg-emerald-400" />
          </div>
        ))}
      </div>
      <div className="flex-1 rounded bg-white/5 p-1">
        <Bar w="w-full" h="h-1" color="bg-gradient-to-r from-violet-500 to-emerald-400" />
      </div>
    </div>
  ),

  'project-launch': (
    <div className="flex h-full flex-col bg-white">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2">
        <Bar w="w-6" color="bg-white" />
      </div>
      <div className="flex items-center justify-center gap-1 bg-slate-900 py-2">
        <span className="text-[10px] font-bold text-orange-400">7</span>
        <Bar w="w-4" h="h-0.5" color="bg-white/30" />
      </div>
      <div className="flex-1 p-1">
        <div className="h-1.5 rounded-full bg-slate-100">
          <div className="h-full w-3/4 rounded-full bg-orange-500" />
        </div>
      </div>
    </div>
  ),

  'quote-card': (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-indigo-950 p-3 text-center">
      <span className="text-lg font-serif text-white/10">"</span>
      <Bar w="w-10" color="bg-white/60" />
      <Bar w="w-8" color="bg-white/40" />
      <div className="mt-2 flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-indigo-400" />
        <Bar w="w-4" h="h-0.5" color="bg-white/50" />
      </div>
    </div>
  ),

  'rera-trust': (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-900 to-emerald-950 p-2">
      <div className="mb-1 flex h-4 w-4 items-center justify-center rounded bg-emerald-500/30">
        <div className="h-2 w-2 rounded-full bg-emerald-400" />
      </div>
      <Bar w="w-8" color="bg-white/70" />
      <div className="mt-2 rounded border border-emerald-500/30 bg-emerald-500/10 p-1.5">
        <Bar w="w-6" color="bg-emerald-400" />
      </div>
    </div>
  ),

  'rental-yield': (
    <div className="flex h-full flex-col bg-white">
      <div className="bg-gradient-to-r from-cyan-500 to-teal-500 p-2">
        <Bar w="w-6" color="bg-white" />
      </div>
      <div className="grid flex-1 grid-cols-3 gap-0.5 p-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded bg-cyan-50 p-1 text-center">
            <Bar w="w-3" color="bg-cyan-500" />
          </div>
        ))}
      </div>
    </div>
  ),

  'property-compare': (
    <div className="flex h-full bg-slate-100">
      <div className="flex-1 border-r border-slate-200 bg-white p-1.5">
        <Bar w="w-4" color="bg-indigo-400" />
        <Bar w="w-3" h="h-0.5" color="bg-slate-300" />
      </div>
      <div className="flex-1 bg-violet-50 p-1.5">
        <Bar w="w-4" color="bg-violet-400" />
        <Bar w="w-3" h="h-0.5" color="bg-slate-300" />
      </div>
    </div>
  ),

  'home-tips': (
    <div className="flex h-full flex-col bg-gradient-to-br from-amber-50 to-orange-50 p-2">
      <Bar w="w-8" color="bg-orange-500" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="mt-1 flex items-center gap-1">
          <Dot color="bg-orange-400" />
          <Bar w="w-5" h="h-0.5" />
        </div>
      ))}
    </div>
  ),

  'team-showcase': (
    <div className="flex h-full flex-col bg-white p-2">
      <Bar w="w-6" color="bg-indigo-500" />
      <div className="mt-2 grid grid-cols-3 gap-0.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded bg-indigo-50 p-1 text-center">
            <Bar w="w-2" color="bg-indigo-400" />
          </div>
        ))}
      </div>
    </div>
  ),

  'grid-cheatsheet': (
    <div
      className="flex h-full flex-col items-center justify-center p-2"
      style={{
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
        backgroundSize: '8px 8px',
        backgroundColor: '#FAFAFA',
      }}
    >
      <div className="grid grid-cols-3 gap-0.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-1 w-1 rounded-full bg-emerald-600" />
        ))}
      </div>
      <Bar w="w-8" color="bg-emerald-800" />
      <Bar w="w-5" color="bg-lime-500" />
    </div>
  ),

  'glass-card': (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-white p-2">
      <div className="w-full rounded-lg border border-white/80 bg-white/50 p-2 backdrop-blur-sm">
        <Bar w="w-4" color="bg-slate-800" />
        <Bar w="w-8" color="bg-orange-400" />
        <Bar w="w-6" color="bg-slate-300" />
      </div>
    </div>
  ),

  'gradient-radar': (
    <div className="flex h-full bg-slate-50 p-2">
      <div className="flex w-1/2 flex-col justify-center gap-1">
        <Bar w="w-5" color="bg-slate-400" />
        <Bar w="w-6" color="bg-pink-500" />
      </div>
      <div className="flex w-1/2 items-center justify-center">
        <div className="h-8 w-8 rounded-full border border-pink-300" />
      </div>
    </div>
  ),

  'serif-authority': (
    <div className="flex h-full flex-col justify-between bg-stone-50 p-2">
      <Bar w="w-8" color="bg-slate-800" />
      <Bar w="w-6" color="bg-slate-400" />
      <div className="h-3 w-full rounded bg-gradient-to-r from-violet-400 to-amber-300 opacity-60" />
    </div>
  ),

  'growth-curve': (
    <div className="flex h-full flex-col bg-slate-50 p-2">
      <Bar w="w-4" color="bg-slate-700" />
      <Bar w="w-7" color="bg-slate-800" />
      <div className="mt-auto h-4 w-full rounded bg-gradient-to-r from-orange-300 via-pink-400 to-blue-400 opacity-70" />
    </div>
  ),

  'minimal-pill': (
    <div className="relative flex h-full flex-col bg-slate-50 p-2">
      <div className="absolute right-0 top-0 h-6 w-6 rounded-full bg-purple-200 blur-sm" />
      <div className="w-5 rounded-full border border-slate-800 px-1 py-0.5 text-[5px]">PILL</div>
      <Bar w="w-8" color="bg-slate-800" />
    </div>
  ),

  'carousel-tip': (
    <div className="relative flex h-full flex-col items-center justify-center bg-[#F9F9FB] p-2">
      <div className="absolute left-1 top-1 h-3 w-3 rounded-full border border-slate-800" />
      <Bar w="w-7" color="bg-slate-900" />
      <Bar w="w-5" color="bg-slate-400" />
    </div>
  ),

  'design-pills': (
    <div className="flex h-full flex-col items-center justify-center gap-1 bg-[#F9F9F9] p-2">
      <Bar w="w-6" color="bg-teal-500" />
      {[1, 2].map((i) => (
        <div key={i} className="w-full rounded-full border border-slate-200 bg-white px-1 py-0.5">
          <Bar w="w-5" h="h-0.5" />
        </div>
      ))}
    </div>
  ),

  'hook-post': (
    <div className="flex h-full flex-col bg-indigo-50 p-2">
      <div className="flex justify-between border-b border-slate-200 pb-1">
        <Bar w="w-4" h="h-0.5" />
        <Bar w="w-3" h="h-0.5" />
      </div>
      <Bar w="w-8" color="bg-slate-900" />
      <Bar w="w-5" color="bg-orange-500" />
    </div>
  ),

  'studio-statement': (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-2">
      <Bar w="w-6" color="bg-violet-500" />
      <div className="mt-1 flex gap-1">
        <div className="h-2 w-5 rounded-full border border-violet-400" />
        <div className="h-2 w-5 rounded-full border border-violet-400" />
      </div>
      <div className="mt-auto h-2 w-full rounded-t-full bg-gradient-to-r from-violet-400 to-blue-400 opacity-60" />
    </div>
  ),
}

export const TEMPLATE_GROUPS: { id: string; label: string; icon: IconName }[] = [
  { id: 'all', label: 'All', icon: 'layout-grid' },
  { id: 'realestate', label: 'Real Estate', icon: 'home-modern' },
  { id: 'business', label: 'Business', icon: 'briefcase' },
  { id: 'social', label: 'Social', icon: 'smartphone' },
]

export const TEMPLATE_GROUP_MAP: Record<TemplateId, string> = {
  analytics: 'business',
  'feature-card': 'business',
  progress: 'business',
  'stats-dashboard': 'business',
  'report-story': 'business',
  'profile-card': 'social',
  'job-card': 'business',
  'kanban-task': 'business',
  'pastel-job': 'social',
  'community-post': 'social',
  'just-listed': 'realestate',
  'just-sold': 'realestate',
  'open-house': 'realestate',
  'profile-glass': 'social',
  'buyer-match': 'realestate',
  'luxury-frame': 'realestate',
  testimonial: 'social',
  'market-update': 'realestate',
  'photo-gallery': 'realestate',
  'price-drop': 'realestate',
  'emi-calculator': 'realestate',
  'agent-spotlight': 'realestate',
  'festival-wishes': 'social',
  'site-visit': 'realestate',
  'before-after': 'realestate',
  'neighbourhood-guide': 'realestate',
  'investment-roi': 'realestate',
  'project-launch': 'realestate',
  'quote-card': 'social',
  'rera-trust': 'realestate',
  'rental-yield': 'realestate',
  'property-compare': 'realestate',
  'home-tips': 'social',
  'team-showcase': 'business',
  'grid-cheatsheet': 'social',
  'glass-card': 'business',
  'gradient-radar': 'social',
  'serif-authority': 'business',
  'growth-curve': 'business',
  'minimal-pill': 'social',
  'carousel-tip': 'social',
  'design-pills': 'social',
  'hook-post': 'social',
  'studio-statement': 'social',
}

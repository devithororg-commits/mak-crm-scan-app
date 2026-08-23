import { ArrowRight, Download, LayoutGrid, Sparkles, Type, X } from 'lucide-react'
import { markOnboardingSeen } from '../../utils/onboarding'
import { primaryBtn, ghostBtn } from '../editor/FormUI'

const STEPS = [
  {
    icon: LayoutGrid,
    title: 'Pick a template',
    desc: '44 real-estate layouts — Just Listed, EMI, Market Update, and more. Filter by category or search by name.',
  },
  {
    icon: Type,
    title: 'Edit in seconds',
    desc: 'Use Text, Uploads, Design, Brand, Charts & Pages tools on the left — like Canva, but built for property marketing.',
  },
  {
    icon: Download,
    title: 'Export HD creatives',
    desc: 'Download PNG/JPEG, all sizes at once, carousel PDF/ZIP, or reel video. Auto-saves your work in the browser.',
  },
]

interface Props {
  onClose: () => void
  onStart: () => void
}

export default function WelcomeGuide({ onClose, onStart }: Props) {
  const finish = (startEditing: boolean) => {
    markOnboardingSeen()
    onClose()
    if (startEditing) onStart()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl animate-fade-in">
        <div className="bg-gradient-to-br from-[#8b3dff] via-violet-600 to-indigo-700 px-6 py-8 text-white">
          <button type="button" onClick={() => finish(false)} className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-[22px] font-extrabold tracking-tight">Welcome to Creative Studio Pro</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-violet-100">
            Professional social posts for real estate — easy, fast, and ready to share.
          </p>
        </div>

        <div className="space-y-3 px-6 py-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-violet-600">Step {i + 1}</p>
                  <p className="text-[14px] font-bold text-slate-900">{step.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button type="button" onClick={() => finish(false)} className={`${ghostBtn} flex-1`}>
            Skip tour
          </button>
          <button type="button" onClick={() => finish(true)} className={`${primaryBtn} flex-1`}>
            Start creating
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

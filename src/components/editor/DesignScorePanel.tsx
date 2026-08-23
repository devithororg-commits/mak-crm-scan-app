import { CheckCircle2, AlertTriangle, XCircle, Wand2 } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import { computeDesignScore, type CheckStatus, type DesignCheck } from '../../utils/designScore'

const STATUS_ICON: Record<CheckStatus, typeof CheckCircle2> = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
}

const STATUS_COLOR: Record<CheckStatus, string> = {
  pass: 'text-emerald-600',
  warn: 'text-amber-600',
  fail: 'text-red-600',
}

const GRADE_COLOR: Record<string, string> = {
  A: 'from-emerald-500 to-teal-600',
  B: 'from-blue-500 to-indigo-600',
  C: 'from-amber-500 to-orange-600',
  D: 'from-orange-500 to-red-500',
  F: 'from-red-500 to-rose-700',
}

function CheckRow({ check, onFix }: { check: DesignCheck; onFix: (c: DesignCheck) => void }) {
  const Icon = STATUS_ICON[check.status]
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${STATUS_COLOR[check.status]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-slate-800">{check.label}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{check.detail}</p>
        {check.fixKey && check.fixLabel && check.status !== 'pass' && (
          <button
            type="button"
            onClick={() => onFix(check)}
            className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 transition hover:bg-violet-100"
          >
            <Wand2 className="h-3 w-3" />
            {check.fixLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export default function DesignScorePanel() {
  const { data, update } = useCreative()
  const result = computeDesignScore(data)

  const applyFix = (check: DesignCheck) => {
    if (check.fixKey && check.fixValue !== undefined) {
      update(check.fixKey, check.fixValue)
    }
  }

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl bg-gradient-to-br ${GRADE_COLOR[result.grade]} p-4 text-white shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Design Score</p>
            <p className="text-[32px] font-black leading-none">{result.score}</p>
            <p className="mt-1 text-[11px] text-white/90">
              Grade {result.grade} · {result.passed}/{result.total} checks passed
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl font-black backdrop-blur-sm">
            {result.grade}
          </div>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-600">
        Professional poster QA — typography, contrast, CTA, and photo readability. Fix warnings before export.
      </p>

      <div className="space-y-2">
        {result.checks.map((check) => (
          <CheckRow key={check.id} check={check} onFix={applyFix} />
        ))}
      </div>
    </div>
  )
}

import type { ExportProgress } from '../../context/ExportBridge'

export default function ExportProgressBar({ progress }: { progress: ExportProgress | null }) {
  if (!progress) return null

  return (
    <div className="mb-3 rounded-[12px] border border-indigo-200 bg-indigo-50/80 px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-indigo-900">{progress.message}</p>
        <span className="text-[10px] font-bold tabular-nums text-indigo-700">{Math.round(progress.percent)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-indigo-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
        />
      </div>
    </div>
  )
}

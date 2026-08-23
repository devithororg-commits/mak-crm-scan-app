import { AlertTriangle, X } from 'lucide-react'
import { ghostBtn, primaryBtn } from '../editor/FormUI'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button type="button" aria-label="Close dialog" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl animate-fade-in">
        <button type="button" onClick={onCancel} className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
        <div className="flex gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={ghostBtn}>{cancelLabel}</button>
          <button
            type="button"
            onClick={onConfirm}
            className={`${primaryBtn} ${danger ? 'from-red-600 to-rose-600 shadow-red-500/25' : ''}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

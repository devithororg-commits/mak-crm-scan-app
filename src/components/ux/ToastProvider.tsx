import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev.slice(-2), { id, kind, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const icon = (kind: ToastKind) => {
    if (kind === 'success') return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
    if (kind === 'error') return <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
    return <Info className="h-4 w-4 shrink-0 text-indigo-600" />
  }

  const styles: Record<ToastKind, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-indigo-200 bg-indigo-50 text-indigo-900',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100vw-2rem,360px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3.5 py-3 text-[13px] font-medium shadow-lg animate-fade-in ${styles[t.kind]}`}
          >
            {icon(t.kind)}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} className="rounded-md p-0.5 opacity-60 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

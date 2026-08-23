import { Check } from 'lucide-react'
import type { EditorTab } from '../../types/creative'

type WorkflowStep = 'template' | 'edit' | 'export'

interface Props {
  activeTab: EditorTab
  exportOpen: boolean
  compact?: boolean
  onGoTemplates: () => void
  onGoEdit: () => void
  onGoExport: () => void
}

function stepState(step: WorkflowStep, activeTab: EditorTab, exportOpen: boolean): 'done' | 'active' | 'upcoming' {
  const order: WorkflowStep[] = ['template', 'edit', 'export']
  let current: WorkflowStep = 'template'
  if (exportOpen) current = 'export'
  else if (activeTab === 'edit') current = 'edit'

  const currentIdx = order.indexOf(current)
  const stepIdx = order.indexOf(step)
  if (stepIdx < currentIdx) return 'done'
  if (stepIdx === currentIdx) return 'active'
  return 'upcoming'
}

export default function WorkflowSteps({ activeTab, exportOpen, compact, onGoTemplates, onGoEdit, onGoExport }: Props) {
  const steps: { id: WorkflowStep; label: string; short: string; onClick: () => void }[] = [
    { id: 'template', label: 'Choose template', short: 'Template', onClick: onGoTemplates },
    { id: 'edit', label: 'Edit content', short: 'Edit', onClick: onGoEdit },
    { id: 'export', label: 'Export & download', short: 'Export', onClick: onGoExport },
  ]

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
      {steps.map((step, i) => {
        const state = stepState(step.id, activeTab, exportOpen)
        const active = state === 'active'
        const done = state === 'done'

        return (
          <div key={step.id} className="flex items-center gap-1">
            {i > 0 && <span className={`hidden sm:inline text-slate-300 ${compact ? 'text-[10px]' : ''}`}>→</span>}
            <button
              type="button"
              onClick={step.onClick}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition sm:px-3 sm:py-1.5 ${
                active
                  ? 'border-violet-300 bg-violet-50 text-violet-700 shadow-sm'
                  : done
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                active ? 'bg-violet-600 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {done ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="hidden md:inline">{step.label}</span>
              <span className="md:hidden">{step.short}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}

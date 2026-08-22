import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { clearPersistedData } from '../utils/persistence'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App error:', error, info)
  }

  handleReset = () => {
    clearPersistedData()
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-5 bg-[var(--bg-app)] p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-amber-50 ring-1 ring-amber-200">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Something went wrong</h1>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Saved data may be corrupted. Reset to start fresh.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25"
          >
            <RotateCcw className="h-4 w-4" /> Reset & Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

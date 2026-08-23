import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, ExternalLink, Eye, EyeOff, KeyRound, Loader2, LogIn, Save, X } from 'lucide-react'
import { useStudioAuth } from '../../context/StudioAuthContext'
import { fetchStudioSettings, saveStudioSettings, type StudioSettingsState } from '../../utils/studioSettingsClient'
import { StudioAuthError } from '../../utils/studioAuth'
import { inputClass } from '../editor/FormUI'
import { useToast } from './ToastProvider'

interface Props {
  open: boolean
  onClose: () => void
}

const KEY_FIELDS = [
  {
    id: 'openaiApiKey' as const,
    label: 'OpenAI API Key',
    placeholder: 'sk-...',
    help: 'Smart Fill copy generation (ChatGPT)',
    link: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'tavilyApiKey' as const,
    label: 'Tavily API Key',
    placeholder: 'tvly-...',
    help: 'Topic research before writing copy',
    link: 'https://app.tavily.com/',
  },
]

export default function StudioSettingsPanel({ open, onClose }: Props) {
  const { loggedIn, openLogin, refreshAuth } = useStudioAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [state, setState] = useState<StudioSettingsState | null>(null)
  const [values, setValues] = useState({ openaiApiKey: '', tavilyApiKey: '' })
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  const load = useCallback(async () => {
    if (!loggedIn) return
    setLoading(true)
    try {
      const data = await fetchStudioSettings()
      setState(data)
      setValues({ openaiApiKey: '', tavilyApiKey: '' })
    } catch (e) {
      if (e instanceof StudioAuthError) {
        refreshAuth()
        openLogin()
        toast('Session expired — login again to save API keys', 'error')
        return
      }
      toast(e instanceof Error ? e.message : 'Could not load settings', 'error')
    } finally {
      setLoading(false)
    }
  }, [loggedIn, toast, refreshAuth, openLogin])

  useEffect(() => {
    if (!open) return
    if (loggedIn) load()
    else setState(null)
  }, [open, loggedIn, load])

  const save = async () => {
    const hasNewValue = Object.values(values).some((value) => value.trim())
    if (!hasNewValue) {
      toast('Paste at least one API key to save', 'error')
      return
    }

    setSaving(true)
    try {
      const result = await saveStudioSettings(values)
      setState(result)
      setValues({ openaiApiKey: '', tavilyApiKey: '' })
      toast(result.message || 'Settings saved', result.keysReady ? 'success' : 'info')
      await load()
    } catch (e) {
      if (e instanceof StudioAuthError) {
        refreshAuth()
        openLogin()
        toast('Session expired — login again to save API keys', 'error')
        return
      }
      toast(e instanceof Error ? e.message : 'Could not save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button type="button" aria-label="Close settings" className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">Studio Settings</p>
            <h2 className="text-[18px] font-bold text-slate-900">OpenAI + Tavily</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!loggedIn ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50/80 px-4 py-4">
              <p className="text-[12px] font-semibold text-violet-900">Login required</p>
              <p className="mt-1 text-[11px] leading-relaxed text-violet-800">
                Settings are saved on the server. Login first to add or update API keys.
              </p>
              <button
                type="button"
                onClick={openLogin}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-violet-700 px-3 py-2 text-[11px] font-bold text-white"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[12px] text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading settings…
            </div>
          ) : (
            <div className="space-y-4">
              {state?.keysReady ? (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[11px] text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-bold">Smart Fill ready</p>
                    <p className="mt-0.5 opacity-90">OpenAI + Tavily keys are configured.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] text-amber-900">
                  <p className="font-bold">Smart Fill needs keys</p>
                  <p className="mt-0.5">Add OpenAI and Tavily keys below, then save.</p>
                </div>
              )}

              <p className="text-[11px] leading-relaxed text-slate-500">
                Keys save to the server (same secure store as login OTP). Leave a field blank to keep the existing key.
              </p>

              {KEY_FIELDS.map((field) => {
                const saved = state?.settings[field.id]
                const show = visible[field.id]
                return (
                  <div key={field.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                          <KeyRound className="h-3.5 w-3.5 text-violet-600" />
                          {field.label}
                        </label>
                        <p className="mt-0.5 text-[10px] text-slate-500">{field.help}</p>
                      </div>
                      <a
                        href={field.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-violet-700 hover:underline"
                      >
                        Get key
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    {saved?.set && (
                      <p className="mb-2 text-[10px] font-medium text-emerald-700">
                        Saved {saved.hint}
                      </p>
                    )}

                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        className={`${inputClass} pr-10 font-mono text-[11px]`}
                        placeholder={saved?.set ? 'Paste new key to replace' : field.placeholder}
                        value={values[field.id]}
                        onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <button
                        type="button"
                        onClick={() => setVisible((prev) => ({ ...prev, [field.id]: !prev[field.id] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                        title={show ? 'Hide' : 'Show'}
                      >
                        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {loggedIn && !loading && (
          <div className="border-t border-slate-100 px-5 py-4">
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-[12px] font-bold text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save API Keys
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

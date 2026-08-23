import { useState } from 'react'
import { Loader2, LogOut, Mail, ShieldCheck } from 'lucide-react'
import { getStudioAuthEmail, isStudioLoggedIn, logoutStudio, sendStudioOtp, verifyStudioOtp } from '../../utils/studioAuth'
import { inputClass } from './FormUI'
import { useToast } from '../ux/ToastProvider'

interface Props {
  onLoggedIn?: () => void
}

export default function StudioLoginPanel({ onLoggedIn, onLoggedOut }: Props & { onLoggedOut?: () => void }) {
  const { toast } = useToast()
  const [email, setEmail] = useState(getStudioAuthEmail())
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>(isStudioLoggedIn() ? 'otp' : 'email')
  const [loading, setLoading] = useState(false)
  const loggedIn = isStudioLoggedIn()

  if (loggedIn) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-900">
            <ShieldCheck className="h-4 w-4" />
            Logged in as {getStudioAuthEmail()}
          </div>
          <button
            type="button"
            onClick={async () => {
              await logoutStudio()
              setStep('email')
              setOtp('')
              onLoggedOut?.()
              toast('Logged out', 'success')
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-[10px] font-semibold text-emerald-800"
          >
            <LogOut className="h-3 w-3" />
            Logout
          </button>
        </div>
      </div>
    )
  }

  const sendOtp = async () => {
    setLoading(true)
    try {
      const result = await sendStudioOtp(email.trim())
      setStep('otp')
      toast(result.message || 'OTP sent', 'success')
      if (result.mock && result.debugOtp) {
        setOtp(result.debugOtp)
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to send OTP', 'error')
    } finally {
      setLoading(false)
    }
  }

  const verify = async () => {
    setLoading(true)
    try {
      await verifyStudioOtp(email.trim(), otp.trim())
      toast('Login successful', 'success')
      onLoggedIn?.()
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Invalid OTP', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800">
        <Mail className="h-4 w-4" />
        Company email login
      </div>
      <p className="text-[10px] leading-relaxed text-slate-500">
        Smart Fill is internal only. Use your company email — OTP will be sent to your inbox.
      </p>

      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Company email</label>
        <input
          type="email"
          className={inputClass}
          placeholder="you@yourcompany.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={step === 'otp'}
        />
      </div>

      {step === 'otp' && (
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">OTP code</label>
          <input
            type="text"
            inputMode="numeric"
            className={inputClass}
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>
      )}

      {step === 'email' ? (
        <button
          type="button"
          disabled={loading || !email.trim()}
          onClick={sendOtp}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-[11px] font-bold text-white disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send OTP
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading || !otp.trim()}
            onClick={verify}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-[11px] font-bold text-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Verify & Login
          </button>
          <button
            type="button"
            onClick={() => { setStep('email'); setOtp('') }}
            className="rounded-xl border border-slate-200 px-3 text-[11px] font-semibold text-slate-600"
          >
            Back
          </button>
        </div>
      )}
    </div>
  )
}

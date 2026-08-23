import { useEffect, useState } from 'react'
import { Loader2, Mail, ShieldCheck, X } from 'lucide-react'
import { useStudioAuth } from '../../context/StudioAuthContext'
import { sendStudioOtp, verifyStudioOtp, getStudioAuthEmail } from '../../utils/studioAuth'
import { inputClass } from '../editor/FormUI'
import { useToast } from './ToastProvider'

export default function StudioLoginModal() {
  const { loginOpen, closeLogin, refreshAuth } = useStudioAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState(getStudioAuthEmail())
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!loginOpen) return
    setEmail(getStudioAuthEmail())
    setOtp('')
    setStep('email')
  }, [loginOpen])

  if (!loginOpen) return null

  const sendOtp = async () => {
    setLoading(true)
    try {
      const result = await sendStudioOtp(email.trim())
      setStep('otp')
      toast(result.message || 'OTP sent', 'success')
      if (result.mock && result.debugOtp) setOtp(result.debugOtp)
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
      refreshAuth()
      closeLogin()
      toast('Login successful', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Invalid OTP', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        role="dialog"
        aria-labelledby="studio-login-title"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-violet-600" />
              <span id="studio-login-title">Studio login</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              Authorized email only. OTP will be sent to your inbox for Smart Fill access.
            </p>
          </div>
          <button
            type="button"
            onClick={closeLogin}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Email</label>
            <input
              type="email"
              className={inputClass}
              placeholder="madhuwebtools@gmail.com"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-[12px] font-bold text-white disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send OTP
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading || !otp.trim()}
                onClick={verify}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-[12px] font-bold text-white disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Verify & Login
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp('') }}
                className="rounded-xl border border-slate-200 px-4 text-[11px] font-semibold text-slate-600"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

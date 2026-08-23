import { useState } from 'react'
import { Copy, MessageCircle, Share2, Loader2, Check } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import {
  buildCaptionBundle,
  buildShareCaption,
  copyText,
  sharePosterNative,
  shareToWhatsApp,
} from '../../utils/shareCreative'
import { useToast } from '../ux/ToastProvider'

export default function ShareToolsPanel() {
  const { data } = useCreative()
  const { toast } = useToast()
  const [busy, setBusy] = useState('')
  const [copied, setCopied] = useState('')

  const markCopied = (key: string) => {
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const onWhatsApp = async () => {
    setBusy('wa')
    try {
      const result = await shareToWhatsApp(data)
      if (result === 'native') toast('Shared poster + caption via device share', 'success')
      else toast('WhatsApp opened with caption — attach downloaded poster if needed', 'info')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Share failed', 'error')
    } finally {
      setBusy('')
    }
  }

  const onNativeShare = async () => {
    setBusy('native')
    try {
      await sharePosterNative(data)
      toast('Shared successfully', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Share not available on this device', 'error')
    } finally {
      setBusy('')
    }
  }

  const onCopyCaptions = async () => {
    setBusy('copy')
    try {
      await copyText(buildCaptionBundle(data))
      markCopied('all')
      toast('All platform captions copied', 'success')
    } finally {
      setBusy('')
    }
  }

  const onCopyWhatsApp = async () => {
    try {
      await copyText(buildShareCaption(data, 'whatsapp'))
      markCopied('wa')
      toast('WhatsApp caption copied', 'success')
    } catch {
      toast('Copy failed', 'error')
    }
  }

  return (
    <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-cyan-50/50 p-4">
      <p className="text-[11px] font-bold text-teal-900">Share & Publish</p>
      <p className="mt-1 text-[10px] leading-relaxed text-teal-800/90">
        One-click WhatsApp, native share (mobile), or copy captions for all platforms.
      </p>

      <div className="mt-3 grid gap-2">
        <button
          type="button"
          disabled={!!busy}
          onClick={onWhatsApp}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-[11px] font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
        >
          {busy === 'wa' ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
          Share on WhatsApp
        </button>

        <button
          type="button"
          disabled={!!busy}
          onClick={onNativeShare}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-300 bg-white py-2.5 text-[11px] font-bold text-teal-900 transition hover:bg-teal-50 disabled:opacity-50"
        >
          {busy === 'native' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          Native Share (poster + caption)
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!!busy}
            onClick={onCopyWhatsApp}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50"
          >
            {copied === 'wa' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            WA Caption
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={onCopyCaptions}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50"
          >
            {copied === 'all' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            All Captions
          </button>
        </div>
      </div>
    </div>
  )
}

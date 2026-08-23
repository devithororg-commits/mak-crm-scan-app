import { LogIn, LogOut, UserRound } from 'lucide-react'
import { useStudioAuth } from '../../context/StudioAuthContext'
import { useToast } from './ToastProvider'

export default function StudioAuthButton() {
  const { loggedIn, email, openLogin, logout } = useStudioAuth()
  const { toast } = useToast()

  if (loggedIn) {
    return (
      <div className="flex items-center gap-1 rounded-[12px] border border-emerald-200/80 bg-emerald-50/90 pl-2 pr-1 py-1">
        <UserRound className="hidden h-3.5 w-3.5 text-emerald-700 sm:block" />
        <span className="max-w-[120px] truncate text-[10px] font-semibold text-emerald-900 sm:max-w-[160px] sm:text-[11px]">
          {email || 'Logged in'}
        </span>
        <button
          type="button"
          onClick={async () => {
            await logout()
            toast('Logged out', 'success')
          }}
          className="inline-flex items-center gap-1 rounded-[10px] bg-white px-2 py-1.5 text-[10px] font-semibold text-emerald-800 shadow-sm ring-1 ring-emerald-200/80 transition hover:bg-emerald-100/50"
          title="Logout"
        >
          <LogOut className="h-3 w-3" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={openLogin}
      className="inline-flex items-center gap-1.5 rounded-[12px] border border-violet-200/80 bg-violet-50 px-2.5 py-2 text-[10px] font-bold text-violet-800 shadow-sm transition hover:bg-violet-100 sm:px-3 sm:text-[11px]"
      title="Company email login"
    >
      <LogIn className="h-3.5 w-3.5" />
      Login
    </button>
  )
}

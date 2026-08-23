import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getStudioAuthEmail, isStudioLoggedIn, logoutStudio, verifyStudioSession } from '../utils/studioAuth'

interface StudioAuthContextValue {
  loggedIn: boolean
  email: string
  loginOpen: boolean
  openLogin: () => void
  closeLogin: () => void
  refreshAuth: () => void
  logout: () => Promise<void>
}

const StudioAuthContext = createContext<StudioAuthContextValue | null>(null)

export function StudioAuthProvider({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(() => isStudioLoggedIn())
  const [email, setEmail] = useState(() => getStudioAuthEmail())
  const [loginOpen, setLoginOpen] = useState(false)

  const refreshAuth = useCallback(() => {
    setLoggedIn(isStudioLoggedIn())
    setEmail(getStudioAuthEmail())
  }, [])

  useEffect(() => {
    if (!isStudioLoggedIn()) return
    verifyStudioSession().then((session) => {
      if (session.ok) {
        setLoggedIn(true)
        if (session.email) setEmail(session.email)
      } else {
        setLoggedIn(false)
        setEmail('')
      }
    })
  }, [])

  const openLogin = useCallback(() => setLoginOpen(true), [])
  const closeLogin = useCallback(() => setLoginOpen(false), [])

  const logout = useCallback(async () => {
    await logoutStudio()
    refreshAuth()
  }, [refreshAuth])

  const value = useMemo(
    () => ({ loggedIn, email, loginOpen, openLogin, closeLogin, refreshAuth, logout }),
    [loggedIn, email, loginOpen, openLogin, closeLogin, refreshAuth, logout],
  )

  return <StudioAuthContext.Provider value={value}>{children}</StudioAuthContext.Provider>
}

export function useStudioAuth() {
  const ctx = useContext(StudioAuthContext)
  if (!ctx) throw new Error('useStudioAuth must be used within StudioAuthProvider')
  return ctx
}

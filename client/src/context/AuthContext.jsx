import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getMe, logoutApi } from '@/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('centsible_token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem('centsible_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((token, userData) => {
    localStorage.setItem('centsible_token', token)
    setUser(userData)
  }, [])

  // Merge a fresh/partial user (e.g. after a profile or currency change)
  // so the shell — greeting, currency — reflects it without a reload.
  const updateUser = useCallback((patch) => {
    setUser((prev) => ({ ...prev, ...patch }))
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    localStorage.removeItem('centsible_token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

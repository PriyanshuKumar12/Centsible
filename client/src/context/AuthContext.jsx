import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO (Day 3–4): call GET /api/auth/me to hydrate user from token.
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('centsible_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('centsible_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

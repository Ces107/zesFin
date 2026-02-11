import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { AuthUser } from '../types'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: () => void
  logout: () => void
  setTokenFromCallback: (token: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'zesfin_token'

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode(token)
    if (!decoded.exp) return true
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async (jwt: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (!res.ok) throw new Error('Unauthorized')
      const data: AuthUser = await res.json()
      setUser(data)
      setToken(jwt)
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
      setToken(null)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored && !isTokenExpired(stored)) {
      fetchUser(stored).finally(() => setLoading(false))
    } else {
      if (stored) localStorage.removeItem(TOKEN_KEY)
      setLoading(false)
    }
  }, [fetchUser])

  const login = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL as string
    const backendBase = apiUrl.replace(/\/api$/, '')
    window.location.href = `${backendBase}/oauth2/authorization/google`
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setToken(null)
  }, [])

  const setTokenFromCallback = useCallback(async (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    await fetchUser(newToken)
  }, [fetchUser])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setTokenFromCallback }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

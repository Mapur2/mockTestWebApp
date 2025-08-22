import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loginUser, registerUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('auth_token')
    const u = localStorage.getItem('auth_user')
    if (t && u) {
      setToken(t)
      try { setUser(JSON.parse(u)) } catch {}
    }
  }, [])

  const saveAuth = useCallback((resp) => {
    if (resp?.access_token) {
      localStorage.setItem('auth_token', resp.access_token)
      localStorage.setItem('auth_user', JSON.stringify(resp.user))
      setToken(resp.access_token)
      setUser(resp.user)
    }
  }, [])

  const login = useCallback(async (payload) => {
    const resp = await loginUser(payload)
    saveAuth(resp)
    return resp
  }, [saveAuth])

  const register = useCallback(async (payload) => {
    const resp = await registerUser(payload)
    saveAuth(resp)
    return resp
  }, [saveAuth])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setUser(null)
    setToken(null)
  }, [])

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}



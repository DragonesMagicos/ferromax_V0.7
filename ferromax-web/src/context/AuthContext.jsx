import { createContext, useContext, useState, useCallback } from 'react'
import axiosClient from '../api/axiosClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ferromax_user')
    return raw ? JSON.parse(raw) : null
  })

  const login = useCallback(async (username, password) => {
    const { data } = await axiosClient.post('/auth/login', { username, password })
    localStorage.setItem('ferromax_token', data.token)
    localStorage.setItem('ferromax_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ferromax_token')
    localStorage.removeItem('ferromax_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

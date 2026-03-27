import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

const API = axios.create({
  baseURL: API_BASE_URL,
})

// Add auth header to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fr_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('fr_token'))
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Restore session on mount
  useEffect(() => {
    if (token) {
      API.get('/api/auth/me')
        .then((res) => {
          setUser(res.data.user)
        })
        .catch(() => {
          localStorage.removeItem('fr_token')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await API.post('/api/auth/login', { email, password })
    const { token: newToken, user: userData } = res.data
    localStorage.setItem('fr_token', newToken)
    setToken(newToken)
    setUser(userData)
    return userData
  }

  const signup = async (email, password, name) => {
    const res = await API.post('/api/auth/signup', { email, password, name })
    const { token: newToken, user: userData } = res.data
    localStorage.setItem('fr_token', newToken)
    setToken(newToken)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('fr_token')
    setToken(null)
    setUser(null)
  }

  const refreshCredits = async () => {
    try {
      const res = await API.get('/api/credits')
      setUser((prev) => (
        prev
          ? {
              ...prev,
              plan: res.data.plan ?? prev.plan,
              creditsRemaining: res.data.creditsRemaining ?? prev.creditsRemaining,
              monthlyCredits: res.data.monthlyCredits ?? prev.monthlyCredits,
              nextResetAt: res.data.nextResetAt ?? prev.nextResetAt,
            }
          : prev
      ))
    } catch (e) {
      console.error('Credit refresh failed', e)
    }
  }

  const updateCredits = (newAmount) => {
    const nextAmount = Number(newAmount) || 0
    setUser((prev) => (
      prev
        ? {
            ...prev,
            creditsRemaining: nextAmount,
            monthlyCredits: Math.max(Number(prev.monthlyCredits) || 0, nextAmount),
          }
        : prev
    ))
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated, login, signup, logout, refreshCredits, updateCredits, API }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { API }
export default AuthContext

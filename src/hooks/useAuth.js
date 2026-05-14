import { useState } from 'react'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Invalid credentials')
    const data = await res.json()
    localStorage.setItem('admin_token', data.token)
    setToken(data.token)
    return data.token
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
  }

  return { token, login, logout, isAuthenticated: !!token }
}

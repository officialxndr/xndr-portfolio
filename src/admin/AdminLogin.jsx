import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { motion } from 'framer-motion'

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) { navigate('/admin'); return null }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/admin')
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    backgroundColor: '#100d1a',
    border: '1px solid #2a1f45',
    borderRadius: '6px',
    color: '#e2e8f0',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060509', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '360px', padding: '0 1.5rem' }}
      >
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.4rem' }}>
            Admin
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#a090bc' }}>
            Sign in to manage your portfolio
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#b08fff'}
            onBlur={e => e.target.style.borderColor = '#2a1f45'}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#b08fff'}
            onBlur={e => e.target.style.borderColor = '#2a1f45'}
            required
          />

          {error && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#ff6b6b', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.4rem',
              padding: '0.75rem',
              backgroundColor: loading ? '#100d1a' : 'rgba(176,143,255,0.1)',
              border: '1px solid rgba(176,143,255,0.35)',
              borderRadius: '6px',
              color: '#b08fff',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.04em',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

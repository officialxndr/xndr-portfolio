import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { motion } from 'framer-motion'

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  backgroundColor: '#100d1a',
  border: '1px solid #2a1f45',
  borderRadius: '6px',
  color: '#e2e8f0',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.85rem',
  outline: 'none',
}

const labelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.7rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#7a6898',
  display: 'block',
  marginBottom: '0.4rem',
}

export default function AdminSiteSettings() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const videoRef = useRef(null)
  const logoRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ site_name: '', tagline: '', hero_video: '', logo: '', hero_morph_speed: '1' })
  const [morphItems, setMorphItems] = useState([])
  const [morphInput, setMorphInput] = useState('')

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(d => {
      setForm(f => ({ ...f, ...d }))
      try { setMorphItems(JSON.parse(d.hero_morph_texts || '[]')) } catch { setMorphItems([]) }
    })
  }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const uploadFile = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    return (await res.json()).url
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    set('hero_video', url)
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    set('logo', url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, hero_morph_texts: JSON.stringify(morphItems) }
    await fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060509' }}>
      <div style={{ borderBottom: '1px solid #2a1f45', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(7,10,16,0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)' }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>Site Settings</div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <div style={{ backgroundColor: '#100d1a', border: '1px solid #2a1f45', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Identity</h2>
          <div>
            <label style={labelStyle}>Your Name</label>
            <input style={inputStyle} value={form.site_name} onChange={e => set('site_name', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
          </div>
          <div>
            <label style={labelStyle}>Tagline</label>
            <input style={inputStyle} value={form.tagline} onChange={e => set('tagline', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
          </div>
          <div>
            <label style={labelStyle}>Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {form.logo && (
                <img src={form.logo} alt="Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain', borderRadius: '4px', border: '1px solid #2a1f45', padding: '4px', background: '#060509' }} />
              )}
              <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              <button type="button" onClick={() => logoRef.current?.click()}
                style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
                {form.logo ? 'Replace logo' : 'Upload logo'}
              </button>
              {form.logo && (
                <button type="button" onClick={() => set('logo', '')}
                  style={{ background: 'none', border: 'none', color: '#4a3a6a', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
                  Remove
                </button>
              )}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#4a3a6a', marginTop: '0.4rem' }}>
              Displayed in the navbar. PNG or SVG with transparency works best.
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#100d1a', border: '1px solid #2a1f45', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Hero Video</h2>
          <div>
            <label style={labelStyle}>Video path</label>
            <input style={inputStyle} value={form.hero_video} onChange={e => set('hero_video', e.target.value)} placeholder="/uploads/hero.mp4"
              onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
            <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoUpload} />
            <button type="button" onClick={() => videoRef.current?.click()}
              style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
              Upload video
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: '#100d1a', border: '1px solid #2a1f45', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>Hero Text Morph</h2>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#4a3a6a' }}>
            Text items that cycle below the logo in the hero. Add at least 2 to enable the effect.
          </div>
          <div>
            <label style={labelStyle}>Morph speed</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[{ label: 'Slow', value: '2' }, { label: 'Normal', value: '1' }, { label: 'Fast', value: '0.5' }].map(opt => {
                const active = form.hero_morph_speed === opt.value
                return (
                  <button key={opt.value} type="button" onClick={() => set('hero_morph_speed', opt.value)}
                    style={{ flex: 1, padding: '0.4rem 0', border: `1px solid ${active ? '#b08fff' : '#2a1f45'}`, borderRadius: '5px', background: active ? 'rgba(176,143,255,0.12)' : 'none', color: active ? '#b08fff' : '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
          {morphItems.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {morphItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0d0a16', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.65rem' }}>
                  <span style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#e2e8f0' }}>{item}</span>
                  <button type="button" onClick={() => setMorphItems(items => items.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a3a6a', fontSize: '0.8rem', lineHeight: 1, padding: '0 0.15rem' }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={morphInput}
              onChange={e => setMorphInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const val = morphInput.trim()
                  if (val) { setMorphItems(items => [...items, val]); setMorphInput('') }
                }
              }}
              placeholder="Add a text item..."
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
            <button type="button"
              onClick={() => {
                const val = morphInput.trim()
                if (val) { setMorphItems(items => [...items, val]); setMorphInput('') }
              }}
              style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Add
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          {saved && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#b08fff' }}>Saved ✓</span>}
          <button type="submit" disabled={saving}
            style={{ background: 'rgba(176,143,255,0.1)', border: '1px solid rgba(176,143,255,0.35)', borderRadius: '6px', padding: '0.65rem 1.5rem', color: '#b08fff', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

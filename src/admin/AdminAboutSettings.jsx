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

const cardStyle = {
  backgroundColor: '#100d1a',
  border: '1px solid #2a1f45',
  borderRadius: '8px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const sectionTitle = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#e2e8f0',
}

export default function AdminAboutSettings() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const photoRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toolInput, setToolInput] = useState('')
  const [socialInput, setSocialInput] = useState({ name: '', url: '', icon: '' })
  const [editingSocialIndex, setEditingSocialIndex] = useState(null)
  const [contactInput, setContactInput] = useState({ label: '', url: '' })
  const [editingContactIndex, setEditingContactIndex] = useState(null)
  const socialIconRef = useRef(null)
  const [form, setForm] = useState({
    about_name: '',
    about_role: '',
    about_bio: '',
    about_photo: '',
    about_tools: JSON.stringify(['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Photoshop', 'Lightroom', 'Blender', 'VS Code', 'Fusion 360', 'OrcaSlicer']),
    about_socials: '[]',
    about_contacts: '[]',
    about_location: '',
    about_email: '',
    about_available: 'false',
  })

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(d => setForm(f => ({ ...f, ...d })))
  }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const tools = (() => {
    try { return JSON.parse(form.about_tools) }
    catch { return [] }
  })()

  const addTool = () => {
    const trimmed = toolInput.trim()
    if (!trimmed || tools.includes(trimmed)) return
    set('about_tools', JSON.stringify([...tools, trimmed]))
    setToolInput('')
  }

  const removeTool = (tool) => {
    set('about_tools', JSON.stringify(tools.filter(t => t !== tool)))
  }

  const socials = (() => {
    try { return JSON.parse(form.about_socials) }
    catch { return [] }
  })()

  const addSocial = () => {
    const name = socialInput.name.trim()
    const url = socialInput.url.trim()
    if (!name || !url) return
    if (editingSocialIndex !== null) {
      const next = [...socials]
      next[editingSocialIndex] = { name, url, icon: socialInput.icon }
      set('about_socials', JSON.stringify(next))
      setEditingSocialIndex(null)
    } else {
      set('about_socials', JSON.stringify([...socials, { name, url, icon: socialInput.icon }]))
    }
    setSocialInput({ name: '', url: '', icon: '' })
  }

  const startEditSocial = (i) => {
    setEditingSocialIndex(i)
    setSocialInput({ name: socials[i].name, url: socials[i].url, icon: socials[i].icon || '' })
  }

  const cancelEditSocial = () => {
    setEditingSocialIndex(null)
    setSocialInput({ name: '', url: '', icon: '' })
  }

  const removeSocial = (name) => {
    set('about_socials', JSON.stringify(socials.filter(s => s.name !== name)))
  }

  const contacts = (() => {
    try { return JSON.parse(form.about_contacts) }
    catch { return [] }
  })()

  const addContact = () => {
    const label = contactInput.label.trim()
    const url = contactInput.url.trim()
    if (!label || !url) return
    if (editingContactIndex !== null) {
      const next = [...contacts]
      next[editingContactIndex] = { label, url }
      set('about_contacts', JSON.stringify(next))
      setEditingContactIndex(null)
    } else {
      set('about_contacts', JSON.stringify([...contacts, { label, url }]))
    }
    setContactInput({ label: '', url: '' })
  }

  const removeContact = (i) => {
    set('about_contacts', JSON.stringify(contacts.filter((_, idx) => idx !== i)))
  }

  const startEditContact = (i) => {
    setEditingContactIndex(i)
    setContactInput({ label: contacts[i].label, url: contacts[i].url })
  }

  const cancelEditContact = () => {
    setEditingContactIndex(null)
    setContactInput({ label: '', url: '' })
  }

  const moveSocial = (index, dir) => {
    const next = [...socials]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    set('about_socials', JSON.stringify(next))
  }

  const uploadFile = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    return (await res.json()).url
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    set('about_photo', url)
  }

  const handleSocialIconUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    setSocialInput(s => ({ ...s, icon: url }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060509' }}>
      <div style={{
        borderBottom: '1px solid #2a1f45',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: 'rgba(7,10,16,0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(12px)',
      }}>
        <button
          onClick={() => navigate('/admin')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>
          About Page
        </div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        {/* Identity */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Identity</h2>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              style={inputStyle}
              value={form.about_name}
              onChange={e => set('about_name', e.target.value)}
              placeholder="Zander Halverson"
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
          </div>
          <div>
            <label style={labelStyle}>Role / Title</label>
            <input
              style={inputStyle}
              value={form.about_role}
              onChange={e => set('about_role', e.target.value)}
              placeholder="Videographer · Photographer · Editor"
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input
              style={inputStyle}
              value={form.about_location}
              onChange={e => set('about_location', e.target.value)}
              placeholder="Minneapolis, MN"
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => set('about_available', form.about_available === 'true' ? 'false' : 'true')}
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                background: form.about_available === 'true' ? 'rgba(176,143,255,0.4)' : '#2a1f45',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '2px',
                left: form.about_available === 'true' ? '18px' : '2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: form.about_available === 'true' ? '#b08fff' : '#4a3a6a',
                transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#7a6898' }}>
              Available for work
            </span>
          </div>
        </div>

        {/* Bio */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Bio</h2>
          <div>
            <label style={labelStyle}>About paragraph</label>
            <textarea
              style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', lineHeight: 1.6 }}
              value={form.about_bio}
              onChange={e => set('about_bio', e.target.value)}
              placeholder="Write a short bio about yourself, your work, and your style..."
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
          </div>
        </div>

        {/* Profile Photo */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Profile Photo</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {form.about_photo && (
              <svg viewBox="-170 -255 430 430" width="60" height="60" style={{ flexShrink: 0 }}>
                <defs>
                  <clipPath id="blob-admin-clip">
                    <path d="M154.2 -150.7C204.2 -104.2 252.1 -52.1 246.8 -5.3C241.5 41.5 183 83 133 113.8C83 144.6 41.5 164.8 7.5 157.3C-26.5 149.9 -53 114.7 -71.7 83.9C-90.4 53 -101.2 26.5 -119.7 -18.6C-138.3 -63.6 -164.6 -127.3 -145.9 -173.8C-127.3 -220.3 -63.6 -249.6 -5.8 -243.9C52.1 -238.1 104.2 -197.2 154.2 -150.7" />
                  </clipPath>
                </defs>
                <g clipPath="url(#blob-admin-clip)">
                  <rect x="-170" y="-255" width="430" height="430" fill="#100d1a" />
                  <image href={form.about_photo} x="-170" y="-255" width="430" height="430" preserveAspectRatio="xMidYMid slice" />
                </g>
                <path d="M154.2 -150.7C204.2 -104.2 252.1 -52.1 246.8 -5.3C241.5 41.5 183 83 133 113.8C83 144.6 41.5 164.8 7.5 157.3C-26.5 149.9 -53 114.7 -71.7 83.9C-90.4 53 -101.2 26.5 -119.7 -18.6C-138.3 -63.6 -164.6 -127.3 -145.9 -173.8C-127.3 -220.3 -63.6 -249.6 -5.8 -243.9C52.1 -238.1 104.2 -197.2 154.2 -150.7" fill="none" stroke="rgba(176,143,255,0.32)" strokeWidth="3" />
              </svg>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}
              >
                {form.about_photo ? 'Replace photo' : 'Upload photo'}
              </button>
              {form.about_photo && (
                <button
                  type="button"
                  onClick={() => set('about_photo', '')}
                  style={{ background: 'none', border: 'none', color: '#4a3a6a', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer', textAlign: 'left' }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#4a3a6a' }}>
            Displayed in a diamond frame on the About page.
          </div>
        </div>

        {/* Tools */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Tools & Programs</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', minHeight: '2rem' }}>
            {tools.map(tool => (
              <span
                key={tool}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(176, 143, 255, 0.25)',
                  background: 'rgba(176, 143, 255, 0.08)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  color: '#b08fff',
                }}
              >
                {tool}
                <button
                  type="button"
                  onClick={() => removeTool(tool)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a3a6a', lineHeight: 1, padding: 0, fontSize: '0.85rem' }}
                  onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                  onMouseLeave={e => e.target.style.color = '#4a3a6a'}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={toolInput}
              onChange={e => setToolInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTool() } }}
              placeholder="Add a tool (e.g. Cinema 4D)"
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
            <button
              type="button"
              onClick={addTool}
              style={{ background: 'rgba(176,143,255,0.08)', border: '1px solid rgba(176,143,255,0.25)', borderRadius: '6px', padding: '0 1rem', color: '#b08fff', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Social Links</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {socials.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #2a1f45', background: '#0a0814' }}>
                {s.icon
                  ? <img src={s.icon} alt={s.name} style={{ width: '20px', height: '20px', objectFit: 'contain', flexShrink: 0 }} />
                  : <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#2a1f45', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.65rem', color: '#b08fff', fontWeight: 700 }}>{s.name[0]}</span>
                    </div>
                }
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#e2e8f0', flex: 1 }}>{s.name}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#4a3a6a', flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.url}</span>
                <button
                  type="button"
                  onClick={() => startEditSocial(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a3a6a', fontSize: '0.7rem', lineHeight: 1, padding: '0 2px', flexShrink: 0, fontFamily: "'Inter', sans-serif" }}
                  onMouseEnter={e => e.target.style.color = '#b08fff'}
                  onMouseLeave={e => e.target.style.color = '#4a3a6a'}
                >Edit</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => moveSocial(i, -1)}
                    disabled={i === 0}
                    style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? '#1e1530' : '#4a3a6a', lineHeight: 1, padding: '1px 3px', fontSize: '0.6rem' }}
                    onMouseEnter={e => { if (i !== 0) e.target.style.color = '#b08fff' }}
                    onMouseLeave={e => { if (i !== 0) e.target.style.color = '#4a3a6a' }}
                  >▲</button>
                  <button
                    type="button"
                    onClick={() => moveSocial(i, 1)}
                    disabled={i === socials.length - 1}
                    style={{ background: 'none', border: 'none', cursor: i === socials.length - 1 ? 'default' : 'pointer', color: i === socials.length - 1 ? '#1e1530' : '#4a3a6a', lineHeight: 1, padding: '1px 3px', fontSize: '0.6rem' }}
                    onMouseEnter={e => { if (i !== socials.length - 1) e.target.style.color = '#b08fff' }}
                    onMouseLeave={e => { if (i !== socials.length - 1) e.target.style.color = '#4a3a6a' }}
                  >▼</button>
                </div>
                <button
                  type="button"
                  onClick={() => removeSocial(s.name)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a3a6a', fontSize: '1rem', lineHeight: 1, padding: 0, flexShrink: 0 }}
                  onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                  onMouseLeave={e => e.target.style.color = '#4a3a6a'}
                >×</button>
              </div>
            ))}
            {socials.length === 0 && (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#2a1f45' }}>No social links yet.</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #2a1f45' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={socialInput.name}
                onChange={e => setSocialInput(s => ({ ...s, name: e.target.value }))}
                placeholder="Name (e.g. Instagram)"
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'}
              />
              <input
                style={{ ...inputStyle, flex: 2 }}
                value={socialInput.url}
                onChange={e => setSocialInput(s => ({ ...s, url: e.target.value }))}
                placeholder="https://..."
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input ref={socialIconRef} type="file" accept="image/*,image/svg+xml" style={{ display: 'none' }} onChange={handleSocialIconUpload} />
              <button
                type="button"
                onClick={() => socialIconRef.current?.click()}
                style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {socialInput.icon ? 'Change icon' : 'Upload icon'}
              </button>
              {socialInput.icon && (
                <img src={socialInput.icon} alt="preview" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              )}
              <div style={{ flex: 1 }} />
              {editingSocialIndex !== null && (
                <button
                  type="button"
                  onClick={cancelEditSocial}
                  style={{ background: 'none', border: 'none', color: '#4a3a6a', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={addSocial}
                style={{ background: 'rgba(176,143,255,0.08)', border: '1px solid rgba(176,143,255,0.25)', borderRadius: '6px', padding: '0.4rem 1rem', color: '#b08fff', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {editingSocialIndex !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Contact</h2>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={form.about_email}
              onChange={e => set('about_email', e.target.value)}
              placeholder="you@email.com"
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
          </div>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #2a1f45' }}>
            <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Additional contact methods</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {contacts.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #2a1f45', background: '#0a0814' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#e2e8f0', flex: 1 }}>{c.label}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#4a3a6a', flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.url}</span>
                  <button
                    type="button"
                    onClick={() => startEditContact(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a3a6a', fontSize: '0.7rem', lineHeight: 1, padding: '0 2px', flexShrink: 0, fontFamily: "'Inter', sans-serif" }}
                    onMouseEnter={e => e.target.style.color = '#b08fff'}
                    onMouseLeave={e => e.target.style.color = '#4a3a6a'}
                  >Edit</button>
                  <button
                    type="button"
                    onClick={() => removeContact(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a3a6a', fontSize: '1rem', lineHeight: 1, padding: 0, flexShrink: 0 }}
                    onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                    onMouseLeave={e => e.target.style.color = '#4a3a6a'}
                  >×</button>
                </div>
              ))}
              {contacts.length === 0 && (
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#2a1f45' }}>No additional contacts yet.</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={contactInput.label}
                onChange={e => setContactInput(s => ({ ...s, label: e.target.value }))}
                placeholder="Label (e.g. Discord)"
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'}
              />
              <input
                style={{ ...inputStyle, flex: 2 }}
                value={contactInput.url}
                onChange={e => setContactInput(s => ({ ...s, url: e.target.value }))}
                placeholder="Value (e.g. +1 555-0100, username, https://...)"
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {editingContactIndex !== null && (
                <button
                  type="button"
                  onClick={cancelEditContact}
                  style={{ background: 'none', border: 'none', color: '#4a3a6a', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}
                >Cancel</button>
              )}
              <button
                type="button"
                onClick={addContact}
                style={{ background: 'rgba(176,143,255,0.08)', border: '1px solid rgba(176,143,255,0.25)', borderRadius: '6px', padding: '0.4rem 1rem', color: '#b08fff', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                {editingContactIndex !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
          {saved && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#b08fff' }}>
              Saved ✓
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'rgba(176,143,255,0.1)',
              border: '1px solid rgba(176,143,255,0.35)',
              borderRadius: '6px',
              padding: '0.65rem 1.5rem',
              color: '#b08fff',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

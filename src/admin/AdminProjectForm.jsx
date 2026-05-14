import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { motion } from 'framer-motion'
import AdminPhotoEditor from './AdminPhotoEditor.jsx'
import ModuleBuilder from './ModuleBuilder.jsx'
import { uploadFile as uploadUtil } from '../utils/upload.js'

const PROCESS_TABS = [
  { key: 'preProduction', label: 'Pre Production' },
  { key: 'projection', label: 'Projection' },
  { key: 'postProduction', label: 'Post Production' },
  { key: 'final', label: 'Final' },
]

const TEMPLATES = ['video', 'photo', 'custom']

const toModules = (tabData) => {
  if (tabData?.modules) return tabData.modules
  if (tabData?.text) return [{ id: `legacy-${Date.now()}`, type: 'text', data: { text: tabData.text } }]
  return []
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

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

const sectionStyle = {
  backgroundColor: '#100d1a',
  border: '1px solid #2a1f45',
  borderRadius: '8px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

export default function AdminProjectForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { token } = useAuth()
  const fileRef = useRef(null)
  const videoFileRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeProcessTab, setActiveProcessTab] = useState('preProduction')
  const [slugManual, setSlugManual] = useState(false)

  const [form, setForm] = useState({
    id: '',
    title: '',
    category: '',
    tags: '',
    thumbnail: '',
    template: 'video',
    custom_component: '',
    sort_order: 0,
    published: 1,
    description: '',
    photos: [],
    video_url: '',
    video_poster: '',
    process: {
      preProduction:  { modules: [] },
      projection:     { modules: [] },
      postProduction: { modules: [] },
      final:          { modules: [] },
    },
  })

  useEffect(() => {
    if (!isEdit) return
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(p => {
        const c = p.content ?? {}
        setSlugManual(true)
        setForm({
          id: p.id,
          title: p.title,
          category: p.category,
          tags: (p.tags ?? []).join(', '),
          thumbnail: p.thumbnail ?? '',
          template: p.template,
          custom_component: p.custom_component ?? '',
          sort_order: p.sort_order ?? 0,
          published: p.published ?? 1,
          description: p.description ?? '',
          photos: c.photos ?? [],
          video_url: c.video?.url ?? '',
          video_poster: c.video?.poster ?? '',
          process: {
            preProduction:  { modules: toModules(c.process?.preProduction) },
            projection:     { modules: toModules(c.process?.projection) },
            postProduction: { modules: toModules(c.process?.postProduction) },
            final:          { modules: toModules(c.process?.final) },
          },
        })
      })
  }, [id, isEdit])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleTitleChange = (val) => {
    set('title', val)
    if (!slugManual) set('id', slugify(val))
  }


  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const { url } = await uploadUtil(file, token); set('thumbnail', url) } catch { setError('Upload failed') }
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const url = await uploadFile(file); set('video_url', url) } catch { setError('Upload failed') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const body = {
      id: form.id,
      title: form.title,
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      thumbnail: form.thumbnail,
      template: form.template,
      custom_component: form.custom_component,
      sort_order: Number(form.sort_order),
      published: Number(form.published),
      description: form.description,
      content: {
        photos: form.photos,
        video: { url: form.video_url, poster: form.video_poster || form.thumbnail },
        process: form.process,
      },
    }
    try {
      const url = isEdit ? `/api/projects/${id}` : '/api/projects'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Save failed') }
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060509' }}>
      <div style={{ borderBottom: '1px solid #2a1f45', padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(7,10,16,0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)' }}>
        <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>
          {isEdit ? 'Edit Project' : 'New Project'}
        </div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <div style={sectionStyle}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Basic Info</h2>

          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title} onChange={e => handleTitleChange(e.target.value)} required
              onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Slug / URL ID *</label>
              <input style={inputStyle} value={form.id} onChange={e => { setSlugManual(true); set('id', slugify(e.target.value)) }} required placeholder="auto-generated"
                onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <input style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Film, Motion, Design…"
                onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tags (comma separated)</label>
            <input style={inputStyle} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="film, motion, narrative"
              onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', lineHeight: 1.6 }}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Template</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.template} onChange={e => set('template', e.target.value)}>
                {TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {form.template === 'custom' && (
              <div>
                <label style={labelStyle}>Component name</label>
                <input style={inputStyle} value={form.custom_component} onChange={e => set('custom_component', e.target.value)} placeholder="myCustom"
                  onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
              </div>
            )}
            <div>
              <label style={labelStyle}>Sort Order</label>
              <input style={inputStyle} type="number" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.published} onChange={e => set('published', e.target.value)}>
                <option value={1}>Published</option>
                <option value={0}>Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Thumbnail</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {form.thumbnail && (
              /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(form.thumbnail) ? (
                <video src={form.thumbnail} autoPlay muted loop playsInline
                  style={{ width: '120px', height: '68px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2a1f45', flexShrink: 0 }} />
              ) : (
                <img src={form.thumbnail} alt="" style={{ width: '120px', height: '68px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2a1f45', flexShrink: 0 }} />
              )
            )}
            <div style={{ flex: 1 }}>
              <input style={inputStyle} value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="Paste a URL, or upload an image or video below"
                onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleThumbnailUpload} />
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
                Upload image or video
              </button>
            </div>
          </div>
        </div>

        {form.template === 'photo' && (
          <div style={sectionStyle}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Photos</h2>
            <AdminPhotoEditor
              photos={form.photos}
              onChange={photos => set('photos', photos)}
              token={token}
            />
          </div>
        )}

        {form.template === 'video' && (
          <div style={sectionStyle}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Video</h2>
            <div>
              <label style={labelStyle}>Video file</label>
              <input style={inputStyle} value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="/uploads/video.mp4 or paste URL"
                onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
              <input ref={videoFileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoUpload} />
              <button type="button" onClick={() => videoFileRef.current?.click()}
                style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
                Upload video
              </button>
            </div>
          </div>
        )}

        {form.template === 'video' && (
          <div style={{ ...sectionStyle, padding: 0, overflow: 'hidden' }}>
            <div className="sunken" style={{ backgroundColor: '#050308' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #160f24', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {PROCESS_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveProcessTab(tab.key)}
                    style={{
                      padding: '0.9rem 1.25rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.72rem',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                      color: activeProcessTab === tab.key ? '#b08fff' : '#7a6898',
                      borderBottom: activeProcessTab === tab.key ? '2px solid #b08fff' : '2px solid transparent',
                      marginBottom: '-1px',
                      transition: 'color 0.2s',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: '1rem' }}>
                <ModuleBuilder
                  modules={form.process[activeProcessTab]?.modules ?? []}
                  onChange={modules => setForm(f => ({ ...f, process: { ...f.process, [activeProcessTab]: { modules } } }))}
                  token={token}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#ff6b6b', padding: '0.6rem 0.9rem', backgroundColor: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '5px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/admin')}
            style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '6px', padding: '0.65rem 1.25rem', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            style={{ background: 'rgba(176,143,255,0.1)', border: '1px solid rgba(176,143,255,0.35)', borderRadius: '6px', padding: '0.65rem 1.5rem', color: '#b08fff', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}

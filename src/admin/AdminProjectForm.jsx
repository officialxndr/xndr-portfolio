import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { motion } from 'framer-motion'
import AdminPhotoEditor from './AdminPhotoEditor.jsx'
import AdminMusicEditor from './AdminMusicEditor.jsx'
import ModuleBuilder from './ModuleBuilder.jsx'
import PageLayoutBuilder from './PageLayoutBuilder.jsx'
import { uploadFile as uploadUtil } from '../utils/upload.js'

const PROCESS_TABS = [
  { key: 'preProduction', label: 'Pre Production' },
  { key: 'projection', label: 'Projection' },
  { key: 'postProduction', label: 'Post Production' },
  { key: 'final', label: 'Final' },
]

const PROCESS_TABS_3D = [
  { key: 'preProduction',  label: 'Pre-Production' },
  { key: 'viewportView',   label: 'Viewport View' },
  { key: 'renderedView',   label: 'Rendered View' },
  { key: 'postProduction', label: 'Post-Production' },
]

const COMMON_TOOLS_3D = [
  'Blender', 'Cinema 4D', 'Houdini', 'After Effects', 'Photoshop',
  'ZBrush', 'Substance Painter', 'Unreal Engine', 'Maya', '3ds Max',
  'Marvelous Designer', 'KeyShot', 'Redshift', 'Octane Render', 'V-Ray',
]

const TEMPLATES = ['video', 'photo', 'coding', 'music', '3d', 'custom']

// ── Native section type definitions per template ──────────────────────────────

const NI = {
  video:       { type: 'native:video',       label: 'Video Player',    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 3l10 4-10 4V3z"/></svg> },
  description: { type: 'native:description', label: 'Description',     icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M2 4h10M2 7h8M2 10h6" strokeLinecap="round"/></svg> },
  process:     { type: 'native:process',     label: 'Process Tabs',    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="2" width="12" height="10" rx="1.5"/><path d="M1 6h12"/><path d="M5 2v4"/></svg> },
  photos:      { type: 'native:photos',      label: 'Photo Gallery',   icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="2" width="12" height="10" rx="1.5"/><circle cx="4.5" cy="5.5" r="1.2" fill="currentColor" stroke="none"/><path d="M1 10l3-3 2.5 2.5 2-1.5L13 11"/></svg> },
  musicVideos: { type: 'native:music-videos',label: 'Music Videos',    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M2 3l10 4-10 4V3z"/></svg> },
  album:       { type: 'native:album',       label: 'Album & Tracks',  icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M14 2v8.5a3 3 0 11-2-2.83V4.5L7 5.5V11a3 3 0 11-2-2.83V3L14 2z"/></svg> },
  github:      { type: 'native:github',      label: 'GitHub Repo',     icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.49c-2.22.48-2.7-.94-2.7-.94-.36-.93-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.81.06 1.23.83 1.23.83.72 1.22 1.88.87 2.34.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"/></svg> },
  finalMedia:  { type: 'native:final-media', label: 'Final Piece',     icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="2" width="12" height="10" rx="1.5"/><path d="M1 9l3-3 2 2 2-2 3 3"/></svg> },
  tools:       { type: 'native:tools',       label: 'Tools & Stats',   icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="5" cy="5" r="3"/><path d="M7.5 7.5l4 4" strokeLinecap="round"/></svg> },
  process3d:   { type: 'native:process-3d',  label: 'Process Tabs',    icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="2" width="12" height="10" rx="1.5"/><path d="M1 6h12"/><path d="M5 2v4"/></svg> },
}

const NATIVE_TYPES = {
  video:  [NI.video, NI.description, NI.process],
  photo:  [NI.description, NI.photos],
  music:  [NI.description, NI.musicVideos, NI.album],
  coding: [NI.description, NI.github],
  '3d':   [NI.description, NI.finalMedia, NI.tools, NI.process3d],
}

function defaultPageSections(template, c = {}) {
  const mid = id => `default-${id}`
  switch (template) {
    case 'video': return [
      { id: mid('video'), type: 'native:video' },
      { id: mid('desc'),  type: 'native:description' },
      ...(c.video_modules ?? []),
      { id: mid('proc'),  type: 'native:process' },
    ]
    case 'photo': return [
      { id: mid('desc'),   type: 'native:description' },
      ...(c.modules_before_photos ?? []),
      { id: mid('photos'), type: 'native:photos' },
    ]
    case 'music': return [
      { id: mid('desc'),   type: 'native:description' },
      { id: mid('videos'), type: 'native:music-videos' },
      { id: mid('album'),  type: 'native:album' },
    ]
    case 'coding': return [
      { id: mid('desc'),   type: 'native:description' },
      ...(c.modules ?? []),
      { id: mid('github'), type: 'native:github' },
      ...(c.modules_after_repo ?? []),
    ]
    case '3d': return [
      { id: mid('desc'),    type: 'native:description' },
      { id: mid('media'),   type: 'native:final-media' },
      { id: mid('tools'),   type: 'native:tools' },
      { id: mid('proc3d'),  type: 'native:process-3d' },
    ]
    default: return []
  }
}

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
  color: '#a090bc',
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

function LayoutBuilderSection({ label, hint, sections, onChange, nativeTypes, token }) {
  return (
    <div style={{ backgroundColor: '#050308', border: '1px solid #2a1f45', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '0.9rem 1rem 0.5rem 1rem' }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a090bc' }}>
          {label}
        </div>
        {hint && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#a090bc', marginTop: '0.25rem' }}>
            {hint}
          </div>
        )}
      </div>
      <div style={{ padding: '0.85rem 1rem 1rem 1rem' }}>
        <PageLayoutBuilder
          sections={sections}
          onChange={onChange}
          nativeTypes={nativeTypes}
          token={token}
        />
      </div>
    </div>
  )
}

export default function AdminProjectForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { token } = useAuth()
  const fileRef = useRef(null)
  const videoFileRef = useRef(null)
  const finalMediaRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeProcessTab, setActiveProcessTab] = useState('preProduction')
  const [activeProcessTab3D, setActiveProcessTab3D] = useState('preProduction')
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
    modules_before_photos: [],
    video_url: '',
    video_poster: '',
    github_url: '',
    modules: [],
    modules_after_repo: [],
    video_modules: [],
    page_sections: defaultPageSections('video'),
    music_videos: [],
    album: { title: '', cover: '', writeup: '', tracks: [] },
    process: {
      preProduction:  { modules: [] },
      projection:     { modules: [] },
      postProduction: { modules: [] },
      final:          { modules: [] },
    },
    final_media_url: '',
    final_media_poster: '',
    tools_3d: '',
    stats_3d: [],
    process_3d: {
      preProduction:  { modules: [] },
      viewportView:   { modules: [] },
      renderedView:   { modules: [] },
      postProduction: { modules: [] },
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
          modules_before_photos: c.modules_before_photos ?? [],
          video_url: c.video?.url ?? '',
          video_poster: c.video?.poster ?? '',
          github_url: c.github_url ?? '',
          modules: c.modules ?? [],
          modules_after_repo: c.modules_after_repo ?? [],
          video_modules: c.video_modules ?? [],
          page_sections: c.page_sections?.length ? c.page_sections : defaultPageSections(p.template, c),
          music_videos: c.music_videos ?? [],
          album: {
            title: c.album?.title ?? '',
            cover: c.album?.cover ?? '',
            writeup: c.album?.writeup ?? '',
            tracks: c.album?.tracks ?? [],
          },
          process: {
            preProduction:  { modules: toModules(c.process?.preProduction) },
            projection:     { modules: toModules(c.process?.projection) },
            postProduction: { modules: toModules(c.process?.postProduction) },
            final:          { modules: toModules(c.process?.final) },
          },
          final_media_url: c.final_media?.url ?? '',
          final_media_poster: c.final_media?.poster ?? '',
          tools_3d: (c.tools ?? []).join(', '),
          stats_3d: c.stats ?? [],
          process_3d: {
            preProduction:  { modules: toModules(c.process_3d?.preProduction) },
            viewportView:   { modules: toModules(c.process_3d?.viewportView) },
            renderedView:   { modules: toModules(c.process_3d?.renderedView) },
            postProduction: { modules: toModules(c.process_3d?.postProduction) },
          },
        })
      })
  }, [id, isEdit])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleTemplateChange = (tmpl) => {
    setForm(f => ({
      ...f,
      template: tmpl,
      page_sections: isEdit ? f.page_sections : defaultPageSections(tmpl),
    }))
  }

  const handleTitleChange = (val) => {
    set('title', val)
    if (!slugManual) set('id', slugify(val))
  }


  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const { url } = await uploadUtil(file, token); set('thumbnail', url) } catch { setError('Upload failed') }
  }

  const handleFinalMediaUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try { const { url } = await uploadUtil(file, token); set('final_media_url', url) } catch { setError('Upload failed') }
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try { const { url } = await uploadUtil(file, token); set('video_url', url) } catch { setError('Upload failed') }
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
        modules_before_photos: form.modules_before_photos,
        video: { url: form.video_url, poster: form.video_poster || form.thumbnail },
        page_sections: form.page_sections.length ? form.page_sections : undefined,
        process: form.process,
        github_url: form.github_url,
        modules: form.modules,
        modules_after_repo: form.modules_after_repo,
        music_videos: form.music_videos,
        album: form.album,
        final_media: form.final_media_url ? {
          url: form.final_media_url,
          poster: form.final_media_poster || form.thumbnail,
          type: /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(form.final_media_url) ? 'video' : 'image',
        } : undefined,
        tools: form.tools_3d ? form.tools_3d.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        stats: form.stats_3d.length ? form.stats_3d.filter(s => s.label || s.value) : undefined,
        process_3d: form.process_3d,
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
        <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a090bc', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: "'Inter', sans-serif", fontSize: '0.78rem' }}>
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
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.template} onChange={e => handleTemplateChange(e.target.value)}>
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
              <input style={inputStyle} value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)} placeholder="Paste a URL, or upload an image, GIF, or video (WebM/MP4) below"
                onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
              <input ref={fileRef} type="file" accept="image/*,video/*,.gif,.webm" style={{ display: 'none' }} onChange={handleThumbnailUpload} />
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
                Upload image, GIF, or video (WebM/MP4)
              </button>
            </div>
          </div>
        </div>

        {form.template === 'photo' && (
          <>
            <LayoutBuilderSection
              label="Page Layout"
              hint="Drag to reorder sections. Add content blocks anywhere between the description and gallery."
              sections={form.page_sections}
              onChange={s => set('page_sections', s)}
              nativeTypes={NATIVE_TYPES.photo}
              token={token}
            />
            <div style={sectionStyle}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Photos</h2>
              <AdminPhotoEditor
                photos={form.photos}
                onChange={photos => set('photos', photos)}
                token={token}
              />
            </div>
          </>
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
                style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
                Upload video
              </button>
            </div>
          </div>
        )}

        {form.template === 'coding' && (
          <div style={sectionStyle}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>GitHub Repository</h2>
            <div>
              <label style={labelStyle}>Repo URL</label>
              <input
                style={inputStyle}
                value={form.github_url}
                onChange={e => set('github_url', e.target.value)}
                placeholder="https://github.com/username/repo"
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'}
              />
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#a090bc', marginTop: '0.4rem', lineHeight: 1.5 }}>
                The site will pull the language breakdown, file tree, and README automatically when this is set.
              </div>
            </div>
          </div>
        )}

        {form.template === 'coding' && (
          <LayoutBuilderSection
            label="Page Layout"
            hint="Drag to reorder sections. Content blocks can be placed before or after the GitHub repo section."
            sections={form.page_sections}
            onChange={s => set('page_sections', s)}
            nativeTypes={NATIVE_TYPES.coding}
            token={token}
          />
        )}

        {form.template === 'music' && (
          <>
            <LayoutBuilderSection
              label="Page Layout"
              hint="Drag to reorder sections. Add content blocks anywhere between description, music videos, and album."
              sections={form.page_sections}
              onChange={s => set('page_sections', s)}
              nativeTypes={NATIVE_TYPES.music}
              token={token}
            />
            <div style={sectionStyle}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Music</h2>
              <AdminMusicEditor
                data={{ music_videos: form.music_videos, album: form.album }}
                onChange={({ music_videos, album }) => setForm(f => ({ ...f, music_videos, album }))}
                token={token}
              />
            </div>
          </>
        )}

        {form.template === 'video' && (
          <LayoutBuilderSection
            label="Page Layout"
            hint="Drag blocks to reorder the page. Add content blocks anywhere between structure elements."
            sections={form.page_sections}
            onChange={s => set('page_sections', s)}
            nativeTypes={NATIVE_TYPES.video}
            token={token}
          />
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
                      color: activeProcessTab === tab.key ? '#b08fff' : '#a090bc',
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

        {/* ── 3D template sections ───────────────────────────────────────── */}

        {form.template === '3d' && (
          <div style={sectionStyle}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Final Piece</h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#a090bc', lineHeight: 1.5 }}>
              The hero render or video that appears at the top of the project page.
            </div>
            <div>
              <label style={labelStyle}>Media URL (image or video)</label>
              <input style={inputStyle} value={form.final_media_url} onChange={e => set('final_media_url', e.target.value)} placeholder="Paste URL or upload below"
                onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
              <input ref={finalMediaRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFinalMediaUpload} />
              <button type="button" onClick={() => finalMediaRef.current?.click()}
                style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
                Upload image or video
              </button>
            </div>
            {/\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(form.final_media_url) && (
              <div>
                <label style={labelStyle}>Video poster (optional)</label>
                <input style={inputStyle} value={form.final_media_poster} onChange={e => set('final_media_poster', e.target.value)} placeholder="Poster image URL"
                  onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
              </div>
            )}
          </div>
        )}

        {form.template === '3d' && (
          <div style={sectionStyle}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Tools Used</h2>
            <div>
              <label style={labelStyle}>Tools (comma separated)</label>
              <input style={inputStyle} value={form.tools_3d} onChange={e => set('tools_3d', e.target.value)} placeholder="Blender, After Effects, Cinema 4D…"
                onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {COMMON_TOOLS_3D.map(tool => {
                const active = form.tools_3d.split(',').map(t => t.trim().toLowerCase()).includes(tool.toLowerCase())
                const toggle3d = () => {
                  const current = form.tools_3d.split(',').map(t => t.trim()).filter(Boolean)
                  if (active) {
                    set('tools_3d', current.filter(t => t.toLowerCase() !== tool.toLowerCase()).join(', '))
                  } else {
                    set('tools_3d', [...current, tool].join(', '))
                  }
                }
                return (
                  <button key={tool} type="button" onClick={toggle3d}
                    style={{
                      padding: '0.3rem 0.7rem',
                      background: active ? 'rgba(176,143,255,0.12)' : 'transparent',
                      border: `1px solid ${active ? 'rgba(176,143,255,0.4)' : '#2a1f45'}`,
                      borderRadius: '999px',
                      color: active ? '#b08fff' : '#a090bc',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tool}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {form.template === '3d' && (
          <div style={sectionStyle}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.25rem' }}>Project Details</h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#a090bc', lineHeight: 1.5 }}>
              Optional stats shown beside the tools — e.g. Render Time, Poly Count, Software Version.
            </div>
            {form.stats_3d.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={s.label}
                  onChange={e => {
                    const next = [...form.stats_3d]
                    next[i] = { ...next[i], label: e.target.value }
                    set('stats_3d', next)
                  }}
                  placeholder="Label"
                  onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={s.value}
                  onChange={e => {
                    const next = [...form.stats_3d]
                    next[i] = { ...next[i], value: e.target.value }
                    set('stats_3d', next)
                  }}
                  placeholder="Value"
                  onFocus={e => e.target.style.borderColor = '#b08fff'} onBlur={e => e.target.style.borderColor = '#2a1f45'}
                />
                <button type="button"
                  onClick={() => set('stats_3d', form.stats_3d.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '4px', padding: '0.4rem 0.6rem', color: '#a090bc', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}>
                  ×
                </button>
              </div>
            ))}
            <button type="button"
              onClick={() => set('stats_3d', [...form.stats_3d, { label: '', value: '' }])}
              style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.4rem 0.85rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
              + Add detail
            </button>
          </div>
        )}

        {form.template === '3d' && (
          <LayoutBuilderSection
            label="Page Layout"
            hint="Drag to reorder sections. Add content blocks anywhere between the description, final piece, tools, and process tabs."
            sections={form.page_sections}
            onChange={s => set('page_sections', s)}
            nativeTypes={NATIVE_TYPES['3d']}
            token={token}
          />
        )}

        {form.template === '3d' && (
          <div style={{ ...sectionStyle, padding: 0, overflow: 'hidden' }}>
            <div className="sunken" style={{ backgroundColor: '#050308', borderRadius: '8px' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #160f24', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {PROCESS_TABS_3D.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveProcessTab3D(tab.key)}
                    style={{
                      padding: '0.9rem 1.25rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '0.72rem',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                      color: activeProcessTab3D === tab.key ? '#b08fff' : '#a090bc',
                      borderBottom: activeProcessTab3D === tab.key ? '2px solid #b08fff' : '2px solid transparent',
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
                  modules={form.process_3d[activeProcessTab3D]?.modules ?? []}
                  onChange={modules => setForm(f => ({ ...f, process_3d: { ...f.process_3d, [activeProcessTab3D]: { modules } } }))}
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
            style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '6px', padding: '0.65rem 1.25rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', cursor: 'pointer' }}>
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

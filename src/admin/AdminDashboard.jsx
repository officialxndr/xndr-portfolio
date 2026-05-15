import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useProjects } from '../hooks/useProjects.js'
import { motion, AnimatePresence } from 'framer-motion'

const col = { fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#a090bc', padding: '0.75rem 1rem', textAlign: 'left', verticalAlign: 'middle' }
const hcol = { ...col, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2a1f45', borderBottom: '1px solid #2a1f45' }
const isVideo = (url) => /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(url ?? '')
const thumbStyle = { width: '56px', height: '32px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #2a1f45' }

export default function AdminDashboard() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const { projects, refetch } = useProjects(false)
  const [deleting, setDeleting] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])

  const allTags = useMemo(() => {
    const set = new Set()
    projects.forEach(p => (p.tags ?? []).forEach(t => t && set.add(t)))
    return [...set].sort()
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (selectedTags.length === 0) return projects
    return projects.filter(p => selectedTags.every(t => (p.tags ?? []).includes(t)))
  }, [projects, selectedTags])

  const availableTags = useMemo(() => {
    const set = new Set()
    filteredProjects.forEach(p => (p.tags ?? []).forEach(t => t && set.add(t)))
    return set
  }, [filteredProjects])

  const sortedTags = useMemo(() => {
    const selected = allTags.filter(t => selectedTags.includes(t))
    const available = allTags.filter(t => !selectedTags.includes(t) && availableTags.has(t))
    const unavailable = allTags.filter(t => !selectedTags.includes(t) && !availableTags.has(t))
    return [...selected, ...available, ...unavailable]
  }, [allTags, selectedTags, availableTags])

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleLogout = () => { logout(); navigate('/admin/login') }

  const togglePublished = async (project) => {
    await fetch(`/api/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ published: project.published ? 0 : 1 }),
    })
    refetch()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    setDeleting(id)
    await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setDeleting(null)
    refetch()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060509' }}>
      <div style={{ borderBottom: '1px solid #2a1f45', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, backgroundColor: 'rgba(7,10,16,0.9)', zIndex: 10 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>Admin</div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/admin/about')}
            style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.45rem 0.9rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}
          >
            About Page
          </button>
          <button
            onClick={() => navigate('/admin/site')}
            style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.45rem 0.9rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}
          >
            Site Settings
          </button>
          <button
            onClick={() => navigate('/admin/projects/new')}
            style={{ background: 'rgba(176,143,255,0.08)', border: '1px solid rgba(176,143,255,0.35)', borderRadius: '5px', padding: '0.45rem 0.9rem', color: '#b08fff', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}
          >
            + New Project
          </button>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a1f45', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem' }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        {allTags.length > 0 && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            {sortedTags.map(tag => {
              const isSelected = selectedTags.includes(tag)
              const isAvailable = availableTags.has(tag)
              const isUnavailable = !isSelected && !isAvailable
              return (
                <button
                  key={tag}
                  onClick={() => !isUnavailable && toggleTag(tag)}
                  style={{
                    background: isSelected ? 'rgba(176,143,255,0.15)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(176,143,255,0.5)' : isUnavailable ? '#1a1428' : '#2a1f45'}`,
                    borderRadius: '999px',
                    padding: '0.3rem 0.75rem',
                    color: isSelected ? '#b08fff' : isUnavailable ? '#2e2545' : '#a090bc',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.7rem',
                    letterSpacing: '0.04em',
                    cursor: isUnavailable ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    opacity: isUnavailable ? 0.4 : 1,
                  }}
                >
                  {tag}
                </button>
              )
            })}
            <AnimatePresence>
              {selectedTags.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSelectedTags([])}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.3rem 0.5rem',
                    color: '#3a2f55',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#a090bc'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3a2f55'}
                >
                  clear ×
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', paddingTop: '4rem', color: '#2a1f45', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}
          >
            No projects yet.{' '}
            <span style={{ color: '#b08fff', cursor: 'pointer' }} onClick={() => navigate('/admin/projects/new')}>
              Add your first project →
            </span>
          </motion.div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#100d1a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2a1f45' }}>
              <thead>
                <tr>
                  <th style={hcol}>Thumbnail</th>
                  <th style={hcol}>Title</th>
                  <th style={hcol}>Category</th>
                  <th style={hcol}>Template</th>
                  <th style={hcol}>Published</th>
                  <th style={hcol}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderTop: i > 0 ? '1px solid #160f24' : 'none' }}
                  >
                    <td style={{ ...col, width: '80px' }}>
                      {p.thumbnail
                        ? isVideo(p.thumbnail)
                          ? <video src={p.thumbnail} muted playsInline style={thumbStyle} />
                          : <img src={p.thumbnail} alt="" style={thumbStyle} />
                        : <div style={{ width: '56px', height: '32px', backgroundColor: '#160f24', borderRadius: '3px' }} />
                      }
                    </td>
                    <td style={{ ...col, color: '#e2e8f0', fontWeight: 500 }}>{p.title}</td>
                    <td style={col}>{p.category}</td>
                    <td style={col}>{p.template}</td>
                    <td style={col}>
                      <button
                        onClick={() => togglePublished(p)}
                        style={{
                          background: p.published ? 'rgba(176,143,255,0.08)' : 'transparent',
                          border: `1px solid ${p.published ? 'rgba(176,143,255,0.35)' : '#2a1f45'}`,
                          borderRadius: '999px',
                          padding: '0.2rem 0.65rem',
                          color: p.published ? '#b08fff' : '#a090bc',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {p.published ? 'Live' : 'Draft'}
                      </button>
                    </td>
                    <td style={{ ...col, whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => navigate(`/admin/projects/${p.id}/edit`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', marginRight: '0.75rem' }}
                        onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                        onMouseLeave={e => e.target.style.color = '#a090bc'}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a1520', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem' }}
                        onMouseEnter={e => e.target.style.color = '#ff6b6b'}
                        onMouseLeave={e => e.target.style.color = '#2a1520'}
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

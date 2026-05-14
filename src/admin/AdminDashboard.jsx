import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useProjects } from '../hooks/useProjects.js'
import { motion } from 'framer-motion'

const col = { fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#7a6898', padding: '0.75rem 1rem', textAlign: 'left', verticalAlign: 'middle' }
const hcol = { ...col, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2a1f45', borderBottom: '1px solid #2a1f45' }
const isVideo = (url) => /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(url ?? '')
const thumbStyle = { width: '56px', height: '32px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #2a1f45' }

export default function AdminDashboard() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const { projects, refetch } = useProjects(false)
  const [deleting, setDeleting] = useState(null)

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
            onClick={() => navigate('/admin/site')}
            style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.45rem 0.9rem', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}
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
                {projects.map((p, i) => (
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
                          color: p.published ? '#b08fff' : '#7a6898',
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
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', marginRight: '0.75rem' }}
                        onMouseEnter={e => e.target.style.color = '#e2e8f0'}
                        onMouseLeave={e => e.target.style.color = '#7a6898'}
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

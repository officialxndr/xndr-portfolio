import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProjects.js'
import { templates } from '../content/templates.js'
import { motion } from 'framer-motion'

export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { project, loading, error } = useProject(id)

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #2a1f45', borderTopColor: '#b08fff', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', color: '#e2e8f0' }}>Not found</div>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '4px', padding: '0.5rem 1.25rem', color: '#7a6898', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem' }}>
          Back home
        </button>
      </div>
    )
  }

  const Template = project.custom_component
    ? templates[project.custom_component]
    : templates[project.template]

  if (!Template) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#7a6898', fontFamily: "'Inter', sans-serif" }}>No template found for "{project.template}"</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ position: 'relative' }}
    >
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        onClick={() => navigate(-1)}
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.75rem',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.9rem 0.45rem 0.65rem',
          background: 'rgba(176,143,255,0.05)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(176,143,255,0.13)',
          borderRadius: '999px',
          cursor: 'pointer',
          color: '#7a6898',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          transition: 'color 0.2s, border-color 0.2s, background 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#e2e8f0'
          e.currentTarget.style.borderColor = 'rgba(176,143,255,0.32)'
          e.currentTarget.style.background = 'rgba(176,143,255,0.10)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#7a6898'
          e.currentTarget.style.borderColor = 'rgba(176,143,255,0.13)'
          e.currentTarget.style.background = 'rgba(176,143,255,0.05)'
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M8 10.5L4 6.5l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </motion.button>

      <Template project={project} />
    </motion.div>
  )
}

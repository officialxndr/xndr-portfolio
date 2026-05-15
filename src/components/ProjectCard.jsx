import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

function isVideo(url) {
  return /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(url ?? '')
}

function isGif(url) {
  return /\.gif(\?.*)?$/i.test(url ?? '')
}

export default function ProjectCard({ project }) {
  const navigate = useNavigate()
  const thumb = project.thumbnail ?? ''
  const video = isVideo(thumb)
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {})
  }, [thumb])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35 }}
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <motion.div
        whileHover={{ scale: 1.025 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'rgba(176, 143, 255, 0.07)',
          backdropFilter: thumb ? 'none' : 'blur(28px)',
          WebkitBackdropFilter: thumb ? 'none' : 'blur(28px)',
          border: '1px solid rgba(176, 143, 255, 0.18)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
        className="group"
      >
        {video ? (
          <video
            ref={videoRef}
            src={thumb}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : thumb ? (
          <img
            src={thumb}
            alt={project.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #100d1a 0%, #160f24 100%)',
            }}
          />
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(7,10,16,0)',
            transition: 'background 0.3s',
          }}
          className="group-hover:!bg-[rgba(7,10,16,0.25)]"
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '6px',
            boxShadow: 'inset 0 0 0 1px rgba(176,143,255,0)',
            transition: 'box-shadow 0.3s',
          }}
          className="group-hover:!shadow-[inset_0_0_0_1px_rgba(176,143,255,0.38)]"
        />
      </motion.div>

      <div style={{ marginTop: '0.65rem', paddingLeft: '0.1rem' }}>
        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '0.92rem',
            fontWeight: 600,
            color: '#e2e8f0',
            letterSpacing: '-0.01em',
          }}
        >
          {project.title}
        </div>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.72rem',
            color: '#7a6898',
            marginTop: '0.2rem',
            letterSpacing: '0.04em',
          }}
        >
          {project.category}
        </div>
      </div>
    </motion.div>
  )
}

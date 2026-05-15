import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModuleRenderer from '../modules/ModuleRenderer.jsx'

const PROCESS_TABS = [
  { key: 'preProduction', label: 'Pre Production' },
  { key: 'projection', label: 'Projection' },
  { key: 'postProduction', label: 'Post Production' },
  { key: 'final', label: 'Final' },
]

function VideoPlayer({ src, poster }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [muted, setMuted] = useState(false)

  const toggle = () => {
    if (!ref.current) return
    if (playing) { ref.current.pause(); setPlaying(false) }
    else { ref.current.play(); setPlaying(true) }
  }

  const onTimeUpdate = () => {
    if (!ref.current) return
    setProgress(ref.current.currentTime / ref.current.duration || 0)
  }

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    if (ref.current) { ref.current.currentTime = pct * ref.current.duration }
  }

  const enterFullscreen = () => {
    const v = ref.current
    if (!v) return
    if (v.requestFullscreen) v.requestFullscreen()
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen()
  }

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#100d1a', border: '1px solid #2a1f45' }}>
      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
        <video
          ref={ref}
          src={src}
          poster={poster}
          onTimeUpdate={onTimeUpdate}
          onEnded={() => setPlaying(false)}
          muted={muted}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#060509' }}
        />
        <div
          onClick={toggle}
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <AnimatePresence>
            {!playing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  backgroundColor: 'rgba(7,10,16,0.75)',
                  border: '1px solid rgba(176,143,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 4l12 6-12 6V4z" fill="#b08fff" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ padding: '0.6rem 0.75rem', backgroundColor: '#0b0814', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898', display: 'flex', padding: '2px' }}>
          {playing
            ? <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="2" width="3.5" height="10"/><rect x="8.5" y="2" width="3.5" height="10"/></svg>
            : <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2l10 5-10 5V2z"/></svg>
          }
        </button>
        <div onClick={seek} style={{ flex: 1, height: '6px', backgroundColor: '#2a1f45', borderRadius: '3px', cursor: 'pointer', position: 'relative' }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: '#b08fff', borderRadius: '3px', transition: 'width 0.1s', position: 'relative' }}>
            <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#b08fff', boxShadow: '0 0 6px rgba(176,143,255,0.5)', pointerEvents: 'none' }} />
          </div>
        </div>
        <button onClick={() => setMuted(m => !m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898', display: 'flex', padding: '2px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M1 5h3l4-3v10l-4-3H1V5z"/>
            {!muted && <path d="M9 4a3.5 3.5 0 010 6" stroke="currentColor" strokeWidth="1.2" fill="none"/>}
            {muted && <path d="M9 5l3 4M12 5l-3 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>}
          </svg>
        </button>
        <button onClick={enterFullscreen} title="Fullscreen" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898', display: 'flex', padding: '2px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function VideoTemplate({ project }) {
  const [activeTab, setActiveTab] = useState('preProduction')
  const content = project.content ?? {}
  const video = content.video ?? {}
  const process = content.process ?? {}
  const activeTabData = process[activeTab] ?? {}

  const hasContent = (tab) => {
    const d = process[tab.key]
    return d?.modules?.length > 0 || d?.text
  }
  const availableTabs = PROCESS_TABS.filter(hasContent)

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: '6rem',
        paddingBottom: '4rem',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.68rem',
              letterSpacing: '0.2em',
              color: '#b08fff',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            {project.category}
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: '#e2e8f0',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            marginBottom: '2.5rem',
          }}
        >
          {project.title}
        </h1>

        {video.url && (
          <div style={{ marginBottom: '3rem' }}>
            <VideoPlayer src={video.url} poster={video.poster || project.thumbnail} />
          </div>
        )}

        {project.description && (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              color: '#7a6898',
              lineHeight: 1.7,
              marginBottom: '3rem',
              maxWidth: '65ch',
            }}
          >
            {project.description}
          </p>
        )}

        {availableTabs.length > 0 && (
          <div
            style={{
              borderRadius: '12px',
              border: '1px solid rgba(176,143,255,0.13)',
              overflow: 'hidden',
              background: 'rgba(176,143,255,0.05)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid rgba(176,143,255,0.10)',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                background: 'rgba(176,143,255,0.03)',
              }}
            >
              {availableTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '1rem 1.5rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    color: activeTab === tab.key ? '#b08fff' : '#7a6898',
                    borderBottom: activeTab === tab.key ? '2px solid #b08fff' : '2px solid transparent',
                    marginBottom: '-1px',
                    transition: 'color 0.2s',
                    boxShadow: activeTab === tab.key ? '0 0 16px rgba(176,143,255,0.08)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {activeTabData.modules?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {activeTabData.modules.map(mod => (
                        <ModuleRenderer key={mod.id} module={mod} />
                      ))}
                    </div>
                  ) : activeTabData.text ? (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#8a9ab0', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>
                      {activeTabData.text}
                    </p>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

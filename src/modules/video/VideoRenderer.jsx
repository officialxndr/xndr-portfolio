import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function MiniPlayer({ src, poster }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [muted, setMuted] = useState(false)

  const toggle = () => {
    if (!ref.current) return
    playing ? ref.current.pause() : ref.current.play()
    setPlaying(p => !p)
  }

  const seek = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    if (ref.current) ref.current.currentTime = ((e.clientX - r.left) / r.width) * ref.current.duration
  }

  const enterFullscreen = () => {
    const v = ref.current
    if (!v) return
    if (v.requestFullscreen) v.requestFullscreen()
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen()
  }

  return (
    <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid #2a1f45', backgroundColor: '#060509' }}>
      <div style={{ position: 'relative', paddingTop: '56.25%' }}>
        <video
          ref={ref} src={src} poster={poster} muted={muted}
          onTimeUpdate={() => setProgress((ref.current?.currentTime / ref.current?.duration) || 0)}
          onEnded={() => setPlaying(false)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#060509' }}
        />
        <div onClick={toggle} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <AnimatePresence>
            {!playing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(7,10,16,0.75)', border: '1px solid rgba(176,143,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 3.5l10 5.5-10 5.5V3.5z" fill="#b08fff"/></svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#0b0814', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898', display: 'flex' }}>
          {playing
            ? <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><rect x="1" y="1" width="4" height="11"/><rect x="8" y="1" width="4" height="11"/></svg>
            : <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor"><path d="M2 1.5l10 5L2 11.5V1.5z"/></svg>
          }
        </button>
        <div onClick={seek} style={{ flex: 1, height: '6px', backgroundColor: '#2a1f45', borderRadius: '3px', cursor: 'pointer', position: 'relative' }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: '#b08fff', borderRadius: '3px', transition: 'width 0.1s', position: 'relative' }}>
            <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#b08fff', boxShadow: '0 0 6px rgba(176,143,255,0.5)', pointerEvents: 'none' }} />
          </div>
        </div>
        <button onClick={() => setMuted(m => !m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898', display: 'flex' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
            <path d="M1 4.5h3l3.5-3v10L4 8.5H1v-4z"/>
            {!muted && <path d="M9 4a3 3 0 010 5" stroke="currentColor" strokeWidth="1.2" fill="none"/>}
            {muted && <path d="M9 4.5l2.5 4M11.5 4.5l-2.5 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>}
          </svg>
        </button>
        <button onClick={enterFullscreen} title="Fullscreen" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898', display: 'flex' }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4.5V1h3.5M8.5 1H12v3.5M12 8.5V12H8.5M4.5 12H1V8.5"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function VideoRenderer({ data }) {
  if (!data?.url) return null
  return <MiniPlayer src={data.url} poster={data.poster} />
}

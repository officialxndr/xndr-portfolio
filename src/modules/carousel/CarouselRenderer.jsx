import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CarouselRenderer({ data }) {
  const slides = data?.slides ?? []
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const trackRef = useRef(null)

  const goTo = useCallback((i) => {
    if (!slides.length) return
    const next = (i + slides.length) % slides.length
    setActive(next)
  }, [slides.length])

  const next = useCallback(() => goTo(active + 1), [active, goTo])
  const prev = useCallback(() => goTo(active - 1), [active, goTo])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, next, prev])

  if (!slides.length) return null

  const current = slides[active]

  return (
    <>
      <div
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #2a1f45',
          backgroundColor: '#060509',
          position: 'relative',
        }}
      >
        <div
          ref={trackRef}
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            backgroundColor: '#050308',
            cursor: 'zoom-in',
          }}
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={current.url + active}
              src={current.url}
              alt={current.caption || ''}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </AnimatePresence>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev() }}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(7,10,16,0.75)',
                  border: '1px solid rgba(176,143,255,0.25)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#b08fff',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next() }}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(7,10,16,0.75)',
                  border: '1px solid rgba(176,143,255,0.25)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#b08fff',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}

          <div style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.85rem',
            fontFamily: "'Syne', sans-serif",
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: '#7a6898',
            backgroundColor: 'rgba(7,10,16,0.65)',
            padding: '0.2rem 0.5rem',
            borderRadius: '3px',
            backdropFilter: 'blur(6px)',
          }}>
            {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
          </div>
        </div>

        {current.caption && (
          <div style={{
            padding: '0.7rem 0.95rem',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.78rem',
            color: '#8a9ab0',
            lineHeight: 1.6,
            borderTop: '1px solid #160f24',
            backgroundColor: '#0a1420',
          }}>
            {current.caption}
          </div>
        )}

        {slides.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '0.4rem',
            padding: '0.6rem 0.85rem',
            overflowX: 'auto',
            backgroundColor: '#0a1420',
            borderTop: current.caption ? '1px solid #160f24' : '1px solid #160f24',
            scrollbarWidth: 'none',
          }}>
            {slides.map((slide, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                style={{
                  flexShrink: 0,
                  width: '56px',
                  height: '34px',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  border: i === active ? '1px solid #b08fff' : '1px solid #2a1f45',
                  cursor: 'pointer',
                  padding: 0,
                  background: 'none',
                  transition: 'border-color 0.15s, opacity 0.15s',
                  opacity: i === active ? 1 : 0.6,
                }}
              >
                <img src={slide.url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightbox(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              backgroundColor: 'rgba(4,6,10,0.97)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightbox(false) }}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898' }}
            >
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            {slides.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev() }}
                  style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(13,21,32,0.7)', border: '1px solid #2a1f45', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7a6898' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={(e) => { e.stopPropagation(); next() }}
                  style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(13,21,32,0.7)', border: '1px solid #2a1f45', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7a6898' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </>
            )}

            <motion.img
              key={active}
              src={current.url}
              alt={current.caption || ''}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '4px' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

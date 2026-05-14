import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'

const EXIF_LABELS = [
  { key: 'camera',       label: 'Camera' },
  { key: 'lens',         label: 'Lens' },
  { key: 'fStop',        label: 'Aperture' },
  { key: 'shutterSpeed', label: 'Shutter' },
  { key: 'iso',          label: 'ISO' },
  { key: 'focalLength',  label: 'Focal Length' },
  { key: 'dateTaken',    label: 'Date' },
]

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  const photo = photos[index]
  const exif = photo?.exif ?? {}
  const hasExif = EXIF_LABELS.some(e => exif[e.key])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onNext, onPrev])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        backgroundColor: 'rgba(4,6,10,0.97)',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); onPrev() }}
          style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(13,21,32,0.7)', border: '1px solid #2a1f45', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7a6898' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      {index < photos.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onNext() }}
          style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(13,21,32,0.7)', border: '1px solid #2a1f45', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7a6898' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      <button onClick={onClose}
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#7a6898' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
      </button>

      <AnimatePresence mode="wait">
        <motion.div key={index}
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', flexDirection: 'column', maxWidth: '90vw', maxHeight: '90vh', gap: '1rem', alignItems: 'center' }}
        >
          <img src={photo.url} alt={photo.note || ''} style={{ maxWidth: '82vw', maxHeight: '72vh', objectFit: 'contain', borderRadius: '4px', display: 'block' }} />

          {(photo.note || hasExif) && (
            <div className="sunken" style={{ backgroundColor: '#050308', borderRadius: '8px', border: '1px solid #160f24', padding: '1.1rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '82vw', width: '100%' }}>
              {photo.note && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#8a9ab0', lineHeight: 1.7, margin: 0 }}>
                  {photo.note}
                </p>
              )}
              {hasExif && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', paddingTop: photo.note ? '0.75rem' : 0, borderTop: photo.note ? '1px solid #160f24' : 'none' }}>
                  {EXIF_LABELS.map(e => exif[e.key] ? (
                    <div key={e.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.12rem' }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7a6898' }}>{e.label}</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.8rem', color: '#e2e8f0' }}>{exif[e.key]}</div>
                    </div>
                  ) : null)}
                </div>
              )}
            </div>
          )}

          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#2a1f45', letterSpacing: '0.08em' }}>
            {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Story item (alternating) ─────────────────────────────────────────────────

function StoryItem({ photo, index, onClick }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })
  const isEven = index % 2 === 0
  const exif = photo.exif ?? {}
  const hasExif = EXIF_LABELS.some(e => exif[e.key])
  const hasInfo = photo.note || hasExif

  const ease = [0.16, 1, 0.3, 1]

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: isEven ? 'row' : 'row-reverse',
        gap: '4rem',
        alignItems: 'center',
        padding: '3rem 0',
        borderBottom: '1px solid #100d1a',
      }}
    >
      {/* Photo */}
      <motion.div
        initial={{ opacity: 0, x: isEven ? -40 : 40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8, ease }}
        onClick={onClick}
        style={{
          flex: hasInfo ? '0 0 58%' : '1',
          borderRadius: '6px',
          overflow: 'hidden',
          cursor: 'zoom-in',
          border: '1px solid #2a1f45',
        }}
      >
        <motion.img
          src={photo.url}
          alt={photo.note || ''}
          loading="lazy"
          initial={{ scale: 1.06 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 1.1, ease }}
          style={{ width: '100%', display: 'block' }}
        />
      </motion.div>

      {/* Info panel */}
      {hasInfo && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.18, ease }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.62rem', letterSpacing: '0.2em', color: '#2a1f45', textTransform: 'uppercase' }}>
            {String(index + 1).padStart(2, '0')}
          </div>

          {photo.note && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#8a9ab0', lineHeight: 1.85, margin: 0 }}>
              {photo.note}
            </p>
          )}

          {hasExif && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {EXIF_LABELS.map(e => exif[e.key] ? (
                <div key={e.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #100d1a', paddingBottom: '0.5rem' }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a6898' }}>{e.label}</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.8rem', color: '#e2e8f0' }}>{exif[e.key]}</span>
                </div>
              ) : null)}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ─── Photo item ───────────────────────────────────────────────────────────────

function PhotoItem({ photo, onClick, style }) {
  return (
    <div onClick={onClick} style={{ cursor: 'zoom-in', ...style }}>
      <div style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <img
          src={photo.url}
          alt={photo.note || ''}
          loading="lazy"
          style={{ width: '100%', display: 'block' }}
        />
      </div>
      {photo.note && (
        <div style={{
          marginTop: '0.4rem',
          fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
          color: '#7a6898', lineHeight: 1.5,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {photo.note}
        </div>
      )}
    </div>
  )
}

// ─── Main template ────────────────────────────────────────────────────────────

const LAYOUTS = [
  {
    key: 'masonry',
    label: 'Masonry',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="0" y="0" width="6" height="9" rx="1"/>
        <rect x="0" y="10" width="6" height="6" rx="1"/>
        <rect x="7" y="0" width="9" height="5" rx="1"/>
        <rect x="7" y="6" width="9" height="10" rx="1"/>
      </svg>
    ),
  },
  {
    key: 'grid',
    label: 'Grid',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="0" y="0" width="7" height="7" rx="1"/>
        <rect x="9" y="0" width="7" height="7" rx="1"/>
        <rect x="0" y="9" width="7" height="7" rx="1"/>
        <rect x="9" y="9" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
]

export default function PhotoTemplate({ project }) {
  const [layout, setLayout] = useState('masonry')
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const photos = project.content?.photos ?? []

  const openLightbox = (i) => setLightboxIdx(i)
  const closeLightbox = () => setLightboxIdx(null)
  const prevPhoto = useCallback(() => setLightboxIdx(i => Math.max(0, i - 1)), [])
  const nextPhoto = useCallback(() => setLightboxIdx(i => Math.min(photos.length - 1, i + 1)), [photos.length])

  return (
    <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: layout === 'story' ? '960px' : '1200px', margin: '0 auto', padding: '0 2rem', transition: 'max-width 0.4s ease' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', letterSpacing: '0.2em', color: '#b08fff', textTransform: 'uppercase', opacity: 0.7 }}>
              {project.category}
            </span>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#e2e8f0', letterSpacing: '-0.02em', lineHeight: 1, marginTop: '0.4rem' }}>
              {project.title}
            </h1>
            {photos.length > 0 && (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#2a1f45', marginTop: '0.6rem', letterSpacing: '0.08em' }}>
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </div>
            )}
          </div>

          {/* Layout toggle */}
          <div style={{ display: 'flex', gap: 0, border: '1px solid #2a1f45', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
            {LAYOUTS.map((mode, i) => (
              <button
                key={mode.key}
                onClick={() => setLayout(mode.key)}
                title={mode.label}
                style={{
                  padding: '0.5rem 0.85rem',
                  background: layout === mode.key ? 'rgba(176,143,255,0.08)' : 'transparent',
                  border: 'none',
                  borderRight: i < LAYOUTS.length - 1 ? '1px solid #2a1f45' : 'none',
                  cursor: 'pointer',
                  color: layout === mode.key ? '#b08fff' : '#7a6898',
                  display: 'flex', alignItems: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {mode.icon}
              </button>
            ))}
          </div>
        </div>

        {project.description && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#7a6898', lineHeight: 1.75, marginBottom: '3rem', maxWidth: '60ch' }}>
            {project.description}
          </p>
        )}

        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#2a1f45', fontFamily: "'Inter', sans-serif", fontSize: '0.85rem' }}>
            No photos added yet.
          </div>
        ) : layout === 'story' ? (
          <div>
            {photos.map((photo, i) => (
              <StoryItem key={photo.url + i} photo={photo} index={i} onClick={() => openLightbox(i)} />
            ))}
          </div>
        ) : layout === 'masonry' ? (
          <div style={{ columns: 'auto 280px', columnGap: '0.75rem' }}>
            {photos.map((photo, i) => (
              <PhotoItem
                key={photo.url + i}
                photo={photo}
                onClick={() => openLightbox(i)}
                style={{ breakInside: 'avoid', marginBottom: '0.75rem', display: 'block' }}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {photos.map((photo, i) => (
              <div key={photo.url + i}
                style={{ cursor: 'zoom-in', borderRadius: '4px', overflow: 'hidden', position: 'relative', paddingTop: '75%', backgroundColor: '#100d1a' }}
                onClick={() => openLightbox(i)}
              >
                <GridItem photo={photo} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom fade — images already in place, gradient creates the scroll reveal feeling */}
      {lightboxIdx === null && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '260px',
          background: 'linear-gradient(to bottom, rgba(7,10,16,0) 0%, rgba(7,10,16,0.92) 100%)',
          pointerEvents: 'none',
          zIndex: 10,
        }} />
      )}

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox photos={photos} index={lightboxIdx} onClose={closeLightbox} onPrev={prevPhoto} onNext={nextPhoto} />
        )}
      </AnimatePresence>
    </div>
  )
}

function GridItem({ photo, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })

  return (
    <motion.img
      ref={ref}
      src={photo.url}
      alt={photo.note || ''}
      loading="lazy"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.55, delay: (index % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}

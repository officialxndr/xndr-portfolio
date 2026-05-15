import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModuleRenderer from '../modules/ModuleRenderer.jsx'

// ─── Music video player ──────────────────────────────────────────────────────

function MusicVideoPlayer({ src, poster, title }) {
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
    if (ref.current) ref.current.currentTime = pct * ref.current.duration
  }

  const enterFullscreen = () => {
    const v = ref.current
    if (!v) return
    if (v.requestFullscreen) v.requestFullscreen()
    else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen()
  }

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '0.65rem', letterSpacing: '0.02em' }}>
          {title}
        </div>
      )}
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
          <div onClick={toggle} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(secs) {
  if (!secs || !isFinite(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function SectionHeader({ children }) {
  return (
    <h2 style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: '0.72rem',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: '#b08fff',
      opacity: 0.7,
      marginBottom: '1.25rem',
      fontWeight: 500,
    }}>
      {children}
    </h2>
  )
}

// ─── Sticky bottom player ────────────────────────────────────────────────────

function StickyPlayer({
  track, album, isPlaying, currentTime, duration,
  onToggle, onNext, onPrev, onSeek, volume, onVolume,
}) {
  const cover = track.cover || album.cover
  const pct = duration ? (currentTime / duration) * 100 : 0

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    onSeek(ratio)
  }

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        background: 'linear-gradient(180deg, rgba(13,8,24,0.65) 0%, rgba(10,6,18,0.85) 100%)',
        borderTop: '1px solid rgba(176,143,255,0.18)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.25rem',
      }}>
        {/* Cover + track info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: '0 0 auto', maxWidth: '32%' }}>
          {cover ? (
            <img src={cover} alt="" style={{
              width: '46px', height: '46px', objectFit: 'cover', borderRadius: '5px',
              border: '1px solid rgba(176,143,255,0.22)', flexShrink: 0,
              boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            }}/>
          ) : (
            <div style={{
              width: '46px', height: '46px', borderRadius: '5px',
              background: 'rgba(176,143,255,0.08)',
              border: '1px solid rgba(176,143,255,0.18)',
              flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#b08fff',
            }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14 2v8.5a3 3 0 11-2-2.83V4.5L7 5.5V11a3 3 0 11-2-2.83V3L14 2z"/>
              </svg>
            </div>
          )}
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: '0.82rem',
              color: '#e2e8f0', fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {track.title || 'Untitled'}
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontSize: '0.7rem',
              color: '#7a6898', marginTop: '0.15rem',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {album.title || ''}
            </div>
          </div>
        </div>

        {/* Center: controls + timeline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
            <button onClick={onPrev}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9ab0', display: 'flex', padding: '4px', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.color = '#8a9ab0'}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 3v10l8-5-8-5z" transform="rotate(180 8 8)"/>
                <rect x="3" y="3" width="1.5" height="10"/>
              </svg>
            </button>
            <button onClick={onToggle}
              style={{
                background: 'rgba(176,143,255,0.13)', border: '1px solid rgba(176,143,255,0.4)',
                borderRadius: '50%', width: '38px', height: '38px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#e2e8f0',
                transition: 'all 0.15s',
                boxShadow: isPlaying ? '0 0 14px rgba(176,143,255,0.35)' : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(176,143,255,0.22)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(176,143,255,0.13)' }}
            >
              {isPlaying
                ? <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="2" width="3.5" height="10"/><rect x="8.5" y="2" width="3.5" height="10"/></svg>
                : <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ transform: 'translateX(1px)' }}><path d="M3 2l10 5-10 5V2z"/></svg>
              }
            </button>
            <button onClick={onNext}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a9ab0', display: 'flex', padding: '4px', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.color = '#8a9ab0'}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 3v10l8-5-8-5z"/>
                <rect x="11.5" y="3" width="1.5" height="10"/>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', maxWidth: '540px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.68rem', color: '#7a6898', minWidth: '34px', textAlign: 'right' }}>
              {formatTime(currentTime)}
            </span>
            <div onClick={handleSeek}
              style={{ flex: 1, height: '6px', background: 'rgba(176,143,255,0.12)', borderRadius: '3px', cursor: 'pointer', position: 'relative' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: 'linear-gradient(90deg, #b08fff 0%, #d8c5ff 100%)',
                borderRadius: '3px',
                transition: 'width 0.12s linear',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d8c5ff', boxShadow: '0 0 6px rgba(176,143,255,0.5)', pointerEvents: 'none' }} />
              </div>
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.68rem', color: '#7a6898', minWidth: '34px' }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto', minWidth: '120px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" style={{ color: '#7a6898' }}>
            <path d="M1 5h3l4-3v10l-4-3H1V5z"/>
            {volume > 0 && <path d="M9 4a3.5 3.5 0 010 6" stroke="currentColor" strokeWidth="1.2" fill="none"/>}
          </svg>
          <input type="range" min="0" max="1" step="0.01" value={volume}
            onChange={e => onVolume(parseFloat(e.target.value))}
            style={{ width: '90px', accentColor: '#b08fff', cursor: 'pointer' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Track row ───────────────────────────────────────────────────────────────

function TrackRow({ track, index, isActive, isPlaying, onClick }) {
  const [hover, setHover] = useState(false)
  const showPlay = hover || isActive
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr auto',
        gap: '1rem',
        alignItems: 'center',
        padding: '0.7rem 1rem',
        borderRadius: '6px',
        cursor: 'pointer',
        background: isActive ? 'rgba(176,143,255,0.08)' : hover ? 'rgba(176,143,255,0.04)' : 'transparent',
        border: '1px solid',
        borderColor: isActive ? 'rgba(176,143,255,0.22)' : 'transparent',
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isActive ? '#b08fff' : '#7a6898',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.78rem',
      }}>
        {showPlay ? (
          isActive && isPlaying ? (
            <svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="2" width="3.5" height="10"/><rect x="8.5" y="2" width="3.5" height="10"/></svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2l10 5-10 5V2z"/></svg>
          )
        ) : (
          String(index + 1).padStart(2, '0')
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: '0.88rem',
          color: isActive ? '#e2e8f0' : '#c5d2e0', fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {track.title || 'Untitled'}
        </div>
        {track.subtitle && (
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: '0.7rem',
            color: '#7a6898', marginTop: '0.15rem',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {track.subtitle}
          </div>
        )}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.74rem',
        color: '#7a6898',
      }}>
        {track.duration || '—'}
      </div>
    </div>
  )
}

// ─── Main template ───────────────────────────────────────────────────────────

export default function MusicTemplate({ project }) {
  const content = project.content ?? {}
  const musicVideos = content.music_videos ?? []
  const album = useMemo(() => ({
    title: content.album?.title ?? '',
    cover: content.album?.cover ?? '',
    writeup: content.album?.writeup ?? '',
    tracks: content.album?.tracks ?? [],
  }), [content.album])
  const tracks = album.tracks

  const sections = content.page_sections?.length
    ? content.page_sections
    : [
        { id: 'dd', type: 'native:description' },
        { id: 'dv', type: 'native:music-videos' },
        { id: 'da', type: 'native:album' },
      ]

  const audioRef = useRef(null)
  const [currentIdx, setCurrentIdx] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.85)

  const currentTrack = currentIdx !== null ? tracks[currentIdx] : null

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  // When the selected track changes, load + auto-play
  useEffect(() => {
    if (currentIdx === null || !audioRef.current) return
    const t = tracks[currentIdx]
    if (!t?.audio_url) return
    audioRef.current.src = t.audio_url
    audioRef.current.load()
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
  }, [currentIdx, tracks])

  const handleClickTrack = (idx) => {
    if (idx === currentIdx) {
      // Toggle play/pause on the active track
      if (audioRef.current?.paused) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
      } else {
        audioRef.current?.pause()
        setIsPlaying(false)
      }
    } else {
      setCurrentIdx(idx)
    }
  }

  const togglePlay = useCallback(() => {
    if (currentIdx === null || !audioRef.current) return
    if (audioRef.current.paused) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [currentIdx])

  const nextTrack = useCallback(() => {
    if (!tracks.length) return
    setCurrentIdx(i => i === null ? 0 : (i + 1) % tracks.length)
  }, [tracks.length])

  const prevTrack = useCallback(() => {
    if (!tracks.length) return
    setCurrentIdx(i => i === null ? 0 : (i - 1 + tracks.length) % tracks.length)
  }, [tracks.length])

  const seek = useCallback((ratio) => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = ratio * duration
    }
  }, [duration])

  return (
    <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: currentTrack ? '8rem' : '4rem' }}>
      {/* Hidden audio element drives playback */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={nextTrack}
        preload="metadata"
      />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', letterSpacing: '0.2em', color: '#b08fff', textTransform: 'uppercase', opacity: 0.7 }}>
            {project.category}
          </span>
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#e2e8f0', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '1.5rem' }}>
          {project.title}
        </h1>

        {sections.filter(s => s.visible !== false).map(section => {
          if (section.type === 'native:description') {
            return project.description ? (
              <p key={section.id} style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.92rem', color: '#8a9ab0', lineHeight: 1.75, marginBottom: '3.5rem', maxWidth: '65ch' }}>
                {project.description}
              </p>
            ) : null
          }
          if (section.type === 'native:music-videos') {
            return musicVideos.length > 0 ? (
              <section key={section.id} style={{ marginBottom: '4rem' }}>
                <SectionHeader>{musicVideos.length === 1 ? 'Music Video' : 'Music Videos'}</SectionHeader>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
                  {musicVideos.map((v, i) => (
                    <MusicVideoPlayer key={v.id ?? i} src={v.url} poster={v.poster} title={v.title} />
                  ))}
                </div>
              </section>
            ) : null
          }
          if (section.type === 'native:album') {
            return (album.title || album.cover || tracks.length > 0 || album.writeup) ? (
          <section style={{ marginBottom: '3rem' }}>
            <SectionHeader>Album</SectionHeader>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 240px) 1fr',
              gap: '2.25rem',
              alignItems: 'start',
              marginBottom: '2.5rem',
            }}>
              {/* Cover */}
              <div style={{
                position: 'relative',
                borderRadius: '10px', overflow: 'hidden',
                border: '1px solid #2a1f45',
                aspectRatio: '1 / 1',
                background: 'linear-gradient(135deg, #100d1a 0%, #050308 100%)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.55)',
              }}>
                {album.cover ? (
                  <img src={album.cover} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#352848' }}>
                    <svg width="56" height="56" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M14 2v8.5a3 3 0 11-2-2.83V4.5L7 5.5V11a3 3 0 11-2-2.83V3L14 2z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Album text */}
              <div>
                {album.title && (
                  <h3 style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    color: '#e2e8f0', letterSpacing: '-0.01em', lineHeight: 1.15,
                    marginBottom: '0.85rem',
                  }}>
                    {album.title}
                  </h3>
                )}
                {tracks.length > 0 && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#7a6898', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                    {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
                  </div>
                )}
                {album.writeup && (
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.88rem',
                    color: '#8a9ab0',
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                  }}>
                    {album.writeup}
                  </p>
                )}
              </div>
            </div>

            {/* Track list */}
            {tracks.length > 0 && (
              <div style={{
                backgroundColor: '#050308',
                border: '1px solid #160f24',
                borderRadius: '10px',
                padding: '0.6rem',
                display: 'flex', flexDirection: 'column', gap: '0.15rem',
              }}>
                {tracks.map((t, i) => (
                  <TrackRow
                    key={t.id ?? i}
                    track={t}
                    index={i}
                    isActive={currentIdx === i}
                    isPlaying={currentIdx === i && isPlaying}
                    onClick={() => handleClickTrack(i)}
                  />
                ))}
              </div>
            )}

            {/* Current-track writeup */}
            <AnimatePresence mode="wait">
              {currentTrack?.writeup && (
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    marginTop: '1.5rem',
                    backgroundColor: '#050308',
                    border: '1px solid rgba(176,143,255,0.18)',
                    borderRadius: '10px',
                    padding: '1.5rem 1.75rem',
                  }}
                >
                  <div style={{
                    fontFamily: "'Syne', sans-serif", fontSize: '0.62rem',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: '#b08fff', opacity: 0.7, marginBottom: '0.8rem',
                  }}>
                    Track {String((currentIdx ?? 0) + 1).padStart(2, '0')} — {currentTrack.title}
                  </div>
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.88rem',
                    color: '#8a9ab0',
                    lineHeight: 1.85,
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                  }}>
                    {currentTrack.writeup}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
            ) : null
          }
          return (
            <div key={section.id} style={{ marginBottom: '2rem' }}>
              <ModuleRenderer module={section} />
            </div>
          )
        })}
      </div>

      {/* Sticky player */}
      <AnimatePresence>
        {currentTrack && (
          <StickyPlayer
            track={currentTrack}
            album={album}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onToggle={togglePlay}
            onNext={nextTrack}
            onPrev={prevTrack}
            onSeek={seek}
            volume={volume}
            onVolume={setVolume}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

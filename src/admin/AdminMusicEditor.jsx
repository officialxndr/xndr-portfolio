import { useRef, useState } from 'react'
import { uploadFile } from '../utils/upload.js'

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

function formatTime(secs) {
  if (!secs || !isFinite(secs)) return ''
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const inputStyle = {
  width: '100%',
  padding: '0.45rem 0.7rem',
  backgroundColor: '#060509',
  border: '1px solid #2a1f45',
  borderRadius: '5px',
  color: '#e2e8f0',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.8rem',
  outline: 'none',
}

const smallInput = { ...inputStyle, padding: '0.32rem 0.55rem', fontSize: '0.74rem' }

const labelStyle = {
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.62rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#a090bc',
  display: 'block',
  marginBottom: '0.32rem',
}

const cardStyle = {
  backgroundColor: '#08101a',
  border: '1px solid #2a1f45',
  borderRadius: '7px',
  padding: '0.85rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
}

const sectionTitleStyle = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '0.72rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#a090bc',
  margin: 0,
}

const addBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'center',
  width: '100%', padding: '0.55rem 1rem',
  background: 'transparent',
  border: '1px dashed #2a1f45',
  borderRadius: '6px',
  color: '#a090bc',
  fontFamily: "'Inter', sans-serif", fontSize: '0.75rem',
  cursor: 'pointer', transition: 'all 0.15s',
}

// ─── Music videos editor ─────────────────────────────────────────────────────

function VideoItem({ video, index, total, token, onChange, onRemove, onMove }) {
  const videoRef = useRef(null)
  const posterRef = useRef(null)

  const uploadVideo = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const { url } = await uploadFile(f, token)
      onChange({ ...video, url })
    } catch {}
    e.target.value = ''
  }

  const uploadPoster = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const { url } = await uploadFile(f, token)
      onChange({ ...video, poster: url })
    } catch {}
    e.target.value = ''
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.65rem', color: '#a090bc', letterSpacing: '0.1em' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={video.title ?? ''}
          onChange={e => onChange({ ...video, title: e.target.value })}
          placeholder="Video title"
          onFocus={e => e.target.style.borderColor = '#b08fff'}
          onBlur={e => e.target.style.borderColor = '#2a1f45'}
        />
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a090bc', padding: '2px 4px', fontSize: '11px', opacity: index === 0 ? 0.3 : 1 }}>↑</button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a090bc', padding: '2px 4px', fontSize: '11px', opacity: index === total - 1 ? 0.3 : 1 }}>↓</button>
        <button type="button" onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a1520', padding: '2px 5px', fontSize: '12px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
          onMouseLeave={e => e.currentTarget.style.color = '#2a1520'}>✕</button>
      </div>

      <div>
        <label style={labelStyle}>Video URL</label>
        <input
          style={inputStyle}
          value={video.url ?? ''}
          onChange={e => onChange({ ...video, url: e.target.value })}
          placeholder="/uploads/video.mp4 or paste URL"
          onFocus={e => e.target.style.borderColor = '#b08fff'}
          onBlur={e => e.target.style.borderColor = '#2a1f45'}
        />
        <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={uploadVideo} />
        <button type="button" onClick={() => videoRef.current?.click()}
          style={{ marginTop: '0.4rem', background: 'none', border: '1px solid #2a1f45', borderRadius: '4px', padding: '0.32rem 0.75rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', cursor: 'pointer' }}>
          Upload video
        </button>
      </div>

      <div>
        <label style={labelStyle}>Poster (optional)</label>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
          {video.poster && (
            <img src={video.poster} alt="" style={{ width: '70px', height: '40px', objectFit: 'cover', borderRadius: '3px', border: '1px solid #2a1f45', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <input
              style={inputStyle}
              value={video.poster ?? ''}
              onChange={e => onChange({ ...video, poster: e.target.value })}
              placeholder="Image URL"
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
            <input ref={posterRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPoster} />
            <button type="button" onClick={() => posterRef.current?.click()}
              style={{ marginTop: '0.4rem', background: 'none', border: '1px solid #2a1f45', borderRadius: '4px', padding: '0.32rem 0.75rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', cursor: 'pointer' }}>
              Upload poster
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function VideosEditor({ videos, onChange, token }) {
  const add = () => onChange([...videos, { id: newId(), title: '', url: '', poster: '' }])
  const update = (id, v) => onChange(videos.map(x => x.id === id ? v : x))
  const remove = (id) => onChange(videos.filter(x => x.id !== id))
  const move = (idx, dir) => {
    const arr = [...videos]
    const tgt = idx + dir
    if (tgt < 0 || tgt >= arr.length) return
    ;[arr[idx], arr[tgt]] = [arr[tgt], arr[idx]]
    onChange(arr)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {videos.map((v, i) => (
        <VideoItem
          key={v.id}
          video={v}
          index={i}
          total={videos.length}
          token={token}
          onChange={updated => update(v.id, updated)}
          onRemove={() => remove(v.id)}
          onMove={dir => move(i, dir)}
        />
      ))}
      <button type="button" onClick={add} style={addBtnStyle}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#b08fff'; e.currentTarget.style.color = '#b08fff' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a1f45'; e.currentTarget.style.color = '#a090bc' }}
      >
        + Add music video
      </button>
    </div>
  )
}

// ─── Track item ──────────────────────────────────────────────────────────────

function TrackItem({ track, index, total, token, onChange, onRemove, onMove }) {
  const audioRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const uploadAudio = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setUploading(true)
    try {
      const { url } = await uploadFile(f, token)
      const probe = new Audio(url)
      const updated = { ...track, audio_url: url, title: track.title || f.name.replace(/\.[^.]+$/, '') }
      probe.addEventListener('loadedmetadata', () => {
        const dur = formatTime(probe.duration)
        if (dur && !track.duration) onChange({ ...updated, duration: dur })
        else onChange(updated)
      })
      probe.addEventListener('error', () => onChange(updated))
      onChange(updated)
    } catch {} finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button type="button" onClick={() => setExpanded(e => !e)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a090bc', padding: '2px', display: 'flex' }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
            <path d="M3 2l4 3-4 3V2z"/>
          </svg>
        </button>
        <span style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.72rem', color: '#a090bc' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={track.title ?? ''}
          onChange={e => onChange({ ...track, title: e.target.value })}
          placeholder="Track title"
          onFocus={e => e.target.style.borderColor = '#b08fff'}
          onBlur={e => e.target.style.borderColor = '#2a1f45'}
        />
        <input
          style={{ ...smallInput, width: '64px', textAlign: 'center' }}
          value={track.duration ?? ''}
          onChange={e => onChange({ ...track, duration: e.target.value })}
          placeholder="3:42"
          onFocus={e => e.target.style.borderColor = '#b08fff'}
          onBlur={e => e.target.style.borderColor = '#2a1f45'}
        />
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a090bc', padding: '2px 4px', fontSize: '11px', opacity: index === 0 ? 0.3 : 1 }}>↑</button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a090bc', padding: '2px 4px', fontSize: '11px', opacity: index === total - 1 ? 0.3 : 1 }}>↓</button>
        <button type="button" onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a1520', padding: '2px 5px', fontSize: '12px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
          onMouseLeave={e => e.currentTarget.style.color = '#2a1520'}>✕</button>
      </div>

      {expanded && (
        <>
          <div>
            <label style={labelStyle}>Audio file</label>
            <input
              style={inputStyle}
              value={track.audio_url ?? ''}
              onChange={e => onChange({ ...track, audio_url: e.target.value })}
              placeholder="/uploads/track.mp3 or paste URL"
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
            <input ref={audioRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={uploadAudio} />
            <button type="button" onClick={() => audioRef.current?.click()} disabled={uploading}
              style={{ marginTop: '0.4rem', background: 'none', border: '1px solid #2a1f45', borderRadius: '4px', padding: '0.32rem 0.75rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', cursor: uploading ? 'wait' : 'pointer' }}>
              {uploading ? 'Uploading…' : 'Upload audio'}
            </button>
            {track.audio_url && (
              <audio src={track.audio_url} controls style={{ width: '100%', marginTop: '0.5rem', height: '32px' }} />
            )}
          </div>

          <div>
            <label style={labelStyle}>Write-up</label>
            <textarea
              style={{ ...inputStyle, minHeight: '70px', resize: 'vertical', lineHeight: 1.6 }}
              value={track.writeup ?? ''}
              onChange={e => onChange({ ...track, writeup: e.target.value })}
              placeholder="Track notes — story, inspiration, credits…"
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main editor ─────────────────────────────────────────────────────────────

const AUDIO_EXTS = /\.(mp3|wav|flac|aac|ogg|m4a|aiff|wma|opus)$/i

function getAudioDuration(url) {
  return new Promise((resolve) => {
    const a = new Audio(url)
    const done = () => resolve(formatTime(a.duration) || '')
    a.addEventListener('loadedmetadata', done)
    a.addEventListener('error', () => resolve(''))
    setTimeout(() => resolve(''), 6000)
  })
}

export default function AdminMusicEditor({ data, onChange, token }) {
  const musicVideos = data.music_videos ?? []
  const album = data.album ?? { title: '', cover: '', writeup: '', tracks: [] }
  const tracks = album.tracks ?? []

  const coverRef = useRef(null)
  const folderInputRef = useRef(null)
  const [folderProgress, setFolderProgress] = useState(null)

  const setVideos = (music_videos) => onChange({ ...data, music_videos })
  const setAlbum = (partial) => onChange({ ...data, album: { ...album, ...partial } })
  const setTracks = (newTracks) => setAlbum({ tracks: newTracks })

  const uploadCover = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const { url } = await uploadFile(f, token)
      setAlbum({ cover: url })
    } catch {}
    e.target.value = ''
  }

  const handleFolderUpload = async (e) => {
    const files = Array.from(e.target.files ?? [])
      .filter(f => f.type.startsWith('audio/') || AUDIO_EXTS.test(f.name))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    e.target.value = ''
    if (!files.length) return

    setFolderProgress({ done: 0, total: files.length })
    const newTracks = []
    for (let i = 0; i < files.length; i++) {
      try {
        const { url } = await uploadFile(files[i], token)
        const duration = await getAudioDuration(url)
        newTracks.push({
          id: newId(),
          title: files[i].name.replace(/^\d+[\s._-]+/, '').replace(/\.[^.]+$/, ''),
          audio_url: url,
          duration,
          writeup: '',
        })
      } catch {}
      setFolderProgress({ done: i + 1, total: files.length })
    }
    setTracks([...tracks, ...newTracks])
    setFolderProgress(null)
  }

  const addTrack = () => setTracks([...tracks, { id: newId(), title: '', audio_url: '', duration: '', writeup: '' }])
  const updateTrack = (id, t) => setTracks(tracks.map(x => x.id === id ? t : x))
  const removeTrack = (id) => setTracks(tracks.filter(x => x.id !== id))
  const moveTrack = (idx, dir) => {
    const arr = [...tracks]
    const tgt = idx + dir
    if (tgt < 0 || tgt >= arr.length) return
    ;[arr[idx], arr[tgt]] = [arr[tgt], arr[idx]]
    setTracks(arr)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Music videos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <h3 style={sectionTitleStyle}>Music videos</h3>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#a090bc', marginTop: '-0.25rem' }}>
          Add one or many — each renders as its own player above the album.
        </div>
        <VideosEditor videos={musicVideos} onChange={setVideos} token={token} />
      </div>

      {/* Album info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={sectionTitleStyle}>Album</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0.85rem', alignItems: 'start' }}>
          {/* Cover */}
          <div>
            <div style={{
              width: '110px', height: '110px',
              borderRadius: '6px',
              border: '1px solid #2a1f45',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #100d1a 0%, #050308 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#a090bc',
            }}>
              {album.cover
                ? <img src={album.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor"><path d="M14 2v8.5a3 3 0 11-2-2.83V4.5L7 5.5V11a3 3 0 11-2-2.83V3L14 2z"/></svg>
              }
            </div>
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadCover} />
            <button type="button" onClick={() => coverRef.current?.click()}
              style={{ marginTop: '0.45rem', background: 'none', border: '1px solid #2a1f45', borderRadius: '4px', padding: '0.32rem 0.6rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', cursor: 'pointer', width: '110px' }}>
              Upload cover
            </button>
          </div>

          {/* Title / writeup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div>
              <label style={labelStyle}>Album title</label>
              <input
                style={inputStyle}
                value={album.title}
                onChange={e => setAlbum({ title: e.target.value })}
                placeholder="Album name"
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'}
              />
            </div>
            <div>
              <label style={labelStyle}>Cover URL</label>
              <input
                style={inputStyle}
                value={album.cover}
                onChange={e => setAlbum({ cover: e.target.value })}
                placeholder="/uploads/cover.webp or paste URL"
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'}
              />
            </div>
            <div>
              <label style={labelStyle}>Album write-up</label>
              <textarea
                style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', lineHeight: 1.6 }}
                value={album.writeup}
                onChange={e => setAlbum({ writeup: e.target.value })}
                placeholder="Notes about the album — concept, process, dedication…"
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <h3 style={sectionTitleStyle}>Tracks</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tracks.map((t, i) => (
            <TrackItem
              key={t.id}
              track={t}
              index={i}
              total={tracks.length}
              token={token}
              onChange={updated => updateTrack(t.id, updated)}
              onRemove={() => removeTrack(t.id)}
              onMove={dir => moveTrack(i, dir)}
            />
          ))}
        </div>
        <input
          ref={(el) => { folderInputRef.current = el; if (el) el.setAttribute('webkitdirectory', '') }}
          type="file"
          accept="audio/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFolderUpload}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" onClick={addTrack} style={{ ...addBtnStyle, flex: 1 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#b08fff'; e.currentTarget.style.color = '#b08fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a1f45'; e.currentTarget.style.color = '#a090bc' }}
          >
            + Add track
          </button>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            disabled={!!folderProgress}
            style={{ ...addBtnStyle, flex: 1, opacity: folderProgress ? 0.6 : 1, cursor: folderProgress ? 'wait' : 'pointer' }}
            onMouseEnter={e => { if (!folderProgress) { e.currentTarget.style.borderColor = '#b08fff'; e.currentTarget.style.color = '#b08fff' } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a1f45'; e.currentTarget.style.color = '#a090bc' }}
          >
            {folderProgress
              ? `Uploading ${folderProgress.done}/${folderProgress.total}…`
              : '+ Upload folder'}
          </button>
        </div>
      </div>
    </div>
  )
}

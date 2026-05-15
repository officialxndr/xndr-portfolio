import { useRef, useState } from 'react'
import { uploadFile } from '../utils/upload.js'

const EXIF_LABELS = [
  { key: 'camera',       label: 'Camera' },
  { key: 'lens',         label: 'Lens' },
  { key: 'fStop',        label: 'Aperture' },
  { key: 'shutterSpeed', label: 'Shutter' },
  { key: 'iso',          label: 'ISO' },
  { key: 'focalLength',  label: 'Focal Length' },
  { key: 'dateTaken',    label: 'Date' },
]

const inputStyle = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  backgroundColor: '#060509',
  border: '1px solid #2a1f45',
  borderRadius: '5px',
  color: '#e2e8f0',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.82rem',
  outline: 'none',
  resize: 'vertical',
}

export default function AdminPhotoEditor({ photos, onChange, token }) {
  const fileRef = useRef(null)
  const folderRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [expandedIdx, setExpandedIdx] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const uploadFiles = async (files) => {
    setUploading(true)
    setUploadProgress(0)
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    let done = 0
    const results = await Promise.all(
      arr.map(async file => {
        const { url, exif } = await uploadFile(file, token)
        done += 1
        setUploadProgress(Math.round((done / arr.length) * 100))
        return { url, note: '', exif }
      })
    )
    onChange([...photos, ...results])
    setUploading(false)
    setUploadProgress(0)
  }

  const handleFiles = (e) => uploadFiles(e.target.files)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    uploadFiles(e.dataTransfer.files)
  }

  const updateNote = (i, note) => {
    onChange(photos.map((p, idx) => idx === i ? { ...p, note } : p))
  }

  const removePhoto = (i) => {
    onChange(photos.filter((_, idx) => idx !== i))
    if (expandedIdx === i) setExpandedIdx(null)
    else if (expandedIdx > i) setExpandedIdx(expandedIdx - 1)
  }

  const movePhoto = (from, to) => {
    if (to < 0 || to >= photos.length) return
    const next = [...photos]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
    setExpandedIdx(to)
  }

  const active = expandedIdx !== null ? photos[expandedIdx] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `1px dashed ${dragOver ? '#b08fff' : '#2a1f45'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: dragOver ? 'rgba(176,143,255,0.04)' : 'transparent',
          transition: 'border-color 0.15s, background-color 0.15s',
        }}
      >
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#a090bc' }}>
              Uploading… {uploadProgress}%
            </div>
            <div style={{ width: '200px', height: '3px', backgroundColor: '#2a1f45', borderRadius: '2px' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: '#b08fff', borderRadius: '2px', transition: 'width 0.15s' }} />
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: '#a090bc', marginBottom: '0.85rem' }}>
              Drag photos here, or
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ background: 'rgba(176,143,255,0.08)', border: '1px solid rgba(176,143,255,0.35)', borderRadius: '5px', padding: '0.45rem 1rem', color: '#b08fff', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
                Select photos
              </button>
              <input ref={folderRef} type="file" accept="image/*" multiple webkitdirectory="" style={{ display: 'none' }} onChange={handleFiles} />
              <button type="button" onClick={() => folderRef.current?.click()}
                style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '5px', padding: '0.45rem 1rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}>
                Select folder
              </button>
            </div>
          </>
        )}
      </div>

      {photos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

          {/* Thumbnail strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '0.4rem' }}>
            {photos.map((photo, i) => (
              <div
                key={i}
                onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                style={{
                  position: 'relative',
                  paddingTop: '75%',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: expandedIdx === i ? '1px solid #b08fff' : '1px solid #2a1f45',
                  transition: 'border-color 0.15s',
                  boxShadow: expandedIdx === i ? '0 0 10px rgba(176,143,255,0.15)' : 'none',
                }}
              >
                <img
                  src={photo.url}
                  alt=""
                  loading="lazy"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {photo.note && (
                  <div style={{ position: 'absolute', bottom: 3, right: 3, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#b08fff' }} />
                )}
              </div>
            ))}
          </div>

          {/* Editor panel — always in DOM, shown/hidden instantly via display */}
          <div style={{ display: active ? 'flex' : 'none', backgroundColor: '#050308', border: '1px solid #160f24', borderRadius: '8px', padding: '1.25rem', gap: '1.25rem', flexWrap: 'wrap' }}>
            {active && (
              <>
                <img
                  src={active.url}
                  alt=""
                  loading="lazy"
                  style={{ width: '140px', height: '105px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2a1f45', flexShrink: 0 }}
                />

                <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a090bc', display: 'block', marginBottom: '0.35rem' }}>
                      Note
                    </label>
                    <textarea
                      style={{ ...inputStyle, minHeight: '68px' }}
                      value={active.note}
                      onChange={e => updateNote(expandedIdx, e.target.value)}
                      placeholder="Caption or note…"
                      onFocus={e => e.target.style.borderColor = '#b08fff'}
                      onBlur={e => e.target.style.borderColor = '#2a1f45'}
                    />
                  </div>

                  {active.exif && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem' }}>
                      {EXIF_LABELS.map(e => {
                        const val = active.exif[e.key]
                        if (!val) return null
                        return (
                          <div key={e.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.58rem', color: '#a090bc', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{e.label}</div>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.78rem', color: '#8a9ab0' }}>{val}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 'auto', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => movePhoto(expandedIdx, expandedIdx - 1)} disabled={expandedIdx === 0}
                      style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '4px', padding: '0.3rem 0.6rem', color: '#a090bc', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: expandedIdx === 0 ? 0.3 : 1 }}>
                      ← Move left
                    </button>
                    <button type="button" onClick={() => movePhoto(expandedIdx, expandedIdx + 1)} disabled={expandedIdx === photos.length - 1}
                      style={{ background: 'none', border: '1px solid #2a1f45', borderRadius: '4px', padding: '0.3rem 0.6rem', color: '#a090bc', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: expandedIdx === photos.length - 1 ? 0.3 : 1 }}>
                      Move right →
                    </button>
                    <button type="button" onClick={() => removePhoto(expandedIdx)}
                      style={{ background: 'none', border: '1px solid #2a1520', borderRadius: '4px', padding: '0.3rem 0.6rem', color: '#3a1a20', fontSize: '0.72rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginLeft: 'auto' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.borderColor = 'rgba(255,107,107,0.35)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#3a1a20'; e.currentTarget.style.borderColor = '#2a1520' }}>
                      Remove
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

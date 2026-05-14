import { useRef } from 'react'
import { uploadFile } from '../../utils/upload.js'

const inputStyle = {
  width: '100%',
  padding: '0.28rem 0.45rem',
  backgroundColor: '#060509',
  border: '1px solid #2a1f45',
  borderRadius: '4px',
  color: '#e2e8f0',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.72rem',
  outline: 'none',
}

export default function StoryboardEditor({ data, onChange, token }) {
  const fileRef = useRef(null)
  const frames = data?.frames ?? []

  const upload = async (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    const results = await Promise.all(
      arr.map(async file => {
        const { url } = await uploadFile(file, token)
        return { url, caption: '' }
      })
    )
    onChange({ ...data, frames: [...frames, ...results] })
  }

  const updateCaption = (i, caption) =>
    onChange({ ...data, frames: frames.map((f, idx) => idx === i ? { ...f, caption } : f) })

  const removeFrame = (i) =>
    onChange({ ...data, frames: frames.filter((_, idx) => idx !== i) })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem' }}>
        {frames.map((frame, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ position: 'relative', paddingTop: '65%', borderRadius: '3px', overflow: 'hidden', border: '1px solid #2a1f45', backgroundColor: '#100d1a' }}>
              <img src={frame.url} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => removeFrame(i)}
                style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(7,10,16,0.85)', border: 'none', borderRadius: '3px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7a6898', fontSize: '9px' }}
              >✕</button>
              <div style={{ position: 'absolute', bottom: 3, left: 5, fontFamily: "'Syne', sans-serif", fontSize: '0.55rem', color: '#7a6898' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
            <input
              style={inputStyle}
              value={frame.caption}
              onChange={e => updateCaption(i, e.target.value)}
              placeholder="Caption…"
              onFocus={e => e.target.style.borderColor = '#b08fff'}
              onBlur={e => e.target.style.borderColor = '#2a1f45'}
            />
          </div>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => upload(e.target.files)} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{ alignSelf: 'flex-start', background: 'rgba(176,143,255,0.06)', border: '1px solid rgba(176,143,255,0.25)', borderRadius: '4px', padding: '0.35rem 0.85rem', color: '#b08fff', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', cursor: 'pointer' }}
      >
        + Add frames
      </button>
    </div>
  )
}

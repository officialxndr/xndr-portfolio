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

export default function CarouselEditor({ data, onChange, token }) {
  const fileRef = useRef(null)
  const slides = data?.slides ?? []

  const upload = async (files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    const results = await Promise.all(
      arr.map(async file => {
        const { url } = await uploadFile(file, token)
        return { url, caption: '' }
      })
    )
    onChange({ ...data, slides: [...slides, ...results] })
  }

  const updateCaption = (i, caption) =>
    onChange({ ...data, slides: slides.map((s, idx) => idx === i ? { ...s, caption } : s) })

  const removeSlide = (i) =>
    onChange({ ...data, slides: slides.filter((_, idx) => idx !== i) })

  const moveSlide = (i, dir) => {
    const tgt = i + dir
    if (tgt < 0 || tgt >= slides.length) return
    const arr = [...slides]
    ;[arr[i], arr[tgt]] = [arr[tgt], arr[i]]
    onChange({ ...data, slides: arr })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {slides.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {slides.map((slide, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', backgroundColor: '#050308', border: '1px solid #160f24', borderRadius: '4px', padding: '0.35rem' }}>
              <div style={{ position: 'relative', width: '70px', height: '44px', flexShrink: 0, borderRadius: '3px', overflow: 'hidden', border: '1px solid #2a1f45', backgroundColor: '#100d1a' }}>
                <img src={slide.url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 2, left: 4, fontFamily: "'Syne', sans-serif", fontSize: '0.55rem', color: '#a090bc' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
              <input
                style={inputStyle}
                value={slide.caption}
                onChange={e => updateCaption(i, e.target.value)}
                placeholder="Caption (optional)…"
                onFocus={e => e.target.style.borderColor = '#b08fff'}
                onBlur={e => e.target.style.borderColor = '#2a1f45'}
              />
              <div style={{ display: 'flex', gap: '0.15rem', flexShrink: 0 }}>
                <button type="button" onClick={() => moveSlide(i, -1)} disabled={i === 0}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a090bc', padding: '2px 4px', fontSize: '11px', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                <button type="button" onClick={() => moveSlide(i, 1)} disabled={i === slides.length - 1}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a090bc', padding: '2px 4px', fontSize: '11px', opacity: i === slides.length - 1 ? 0.3 : 1 }}>↓</button>
                <button type="button" onClick={() => removeSlide(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a1520', padding: '2px 5px', fontSize: '11px' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                  onMouseLeave={e => e.currentTarget.style.color = '#2a1520'}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { upload(e.target.files); e.target.value = '' }} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{ alignSelf: 'flex-start', background: 'rgba(176,143,255,0.06)', border: '1px solid rgba(176,143,255,0.25)', borderRadius: '4px', padding: '0.35rem 0.85rem', color: '#b08fff', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', cursor: 'pointer' }}
      >
        + Add slides
      </button>
    </div>
  )
}

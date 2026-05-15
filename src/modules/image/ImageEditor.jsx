import { useRef } from 'react'
import { uploadFile } from '../../utils/upload.js'

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
}

export default function ImageEditor({ data, onChange, token }) {
  const fileRef = useRef(null)

  const upload = async (file) => {
    const { url } = await uploadFile(file, token)
    onChange({ ...data, url })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {data?.url && (
        <img src={data.url} alt="" loading="lazy" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #2a1f45', backgroundColor: '#060509' }} />
      )}

      <input
        style={inputStyle}
        value={data?.url ?? ''}
        onChange={e => onChange({ ...data, url: e.target.value })}
        placeholder="Paste image URL or upload below"
        onFocus={e => e.target.style.borderColor = '#b08fff'}
        onBlur={e => e.target.style.borderColor = '#2a1f45'}
      />

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid #2a1f45', borderRadius: '4px', padding: '0.35rem 0.85rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', cursor: 'pointer' }}
      >
        Upload image
      </button>

      <div>
        <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a090bc', display: 'block', marginBottom: '0.3rem' }}>Caption</label>
        <input
          style={inputStyle}
          value={data?.caption ?? ''}
          onChange={e => onChange({ ...data, caption: e.target.value })}
          placeholder="Optional caption…"
          onFocus={e => e.target.style.borderColor = '#b08fff'}
          onBlur={e => e.target.style.borderColor = '#2a1f45'}
        />
      </div>
    </div>
  )
}

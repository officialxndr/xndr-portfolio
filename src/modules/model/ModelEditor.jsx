import { useRef, useState } from 'react'
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

const label = (text) => (
  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a6898', marginBottom: '0.3rem' }}>
    {text}
  </div>
)

export default function ModelEditor({ data, onChange, token }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const upload = async (file) => {
    setUploading(true)
    try {
      const { url } = await uploadFile(file, token)
      onChange({ ...data, url })
    } catch {
      // silently fail — user can paste URL manually
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* URL input */}
      <div>
        {label('Model URL (.glb, .gltf, .stl, .fbx)')}
        <input
          style={inputStyle}
          value={data?.url ?? ''}
          onChange={e => onChange({ ...data, url: e.target.value })}
          placeholder="Paste URL or upload below"
          onFocus={e => e.target.style.borderColor = '#b08fff'}
          onBlur={e => e.target.style.borderColor = '#2a1f45'}
        />
      </div>

      {/* Upload */}
      <input
        ref={fileRef}
        type="file"
        accept=".glb,.gltf,.stl,.fbx"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) upload(f)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: '1px solid #2a1f45',
          borderRadius: '4px',
          padding: '0.35rem 0.85rem',
          color: '#7a6898',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.72rem',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#b08fff'; e.currentTarget.style.color = '#b08fff' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a1f45'; e.currentTarget.style.color = '#7a6898' }}
      >
        {uploading ? 'Uploading…' : 'Upload model'}
      </button>

      {/* Caption */}
      <div>
        {label('Caption (optional)')}
        <input
          style={inputStyle}
          value={data?.caption ?? ''}
          onChange={e => onChange({ ...data, caption: e.target.value })}
          placeholder="Optional caption…"
          onFocus={e => e.target.style.borderColor = '#b08fff'}
          onBlur={e => e.target.style.borderColor = '#2a1f45'}
        />
      </div>

      {/* Info note */}
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#352848', lineHeight: 1.55 }}>
        Supports GLB, GLTF, STL, and FBX formats. Drag to rotate, scroll to zoom on the public page.
      </div>
    </div>
  )
}

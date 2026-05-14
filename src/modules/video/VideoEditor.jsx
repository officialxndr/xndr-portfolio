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

export default function VideoEditor({ data, onChange, token }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file) => {
    setUploading(true)
    setError('')
    try {
      const { url } = await uploadFile(file, token)
      onChange({ ...data, url })
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={data?.url ?? ''}
          onChange={e => onChange({ ...data, url: e.target.value })}
          placeholder="Paste a video URL or upload below"
          onFocus={e => e.target.style.borderColor = '#b08fff'}
          onBlur={e => e.target.style.borderColor = '#2a1f45'}
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{
          alignSelf: 'flex-start',
          background: uploading ? 'transparent' : 'none',
          border: '1px solid #2a1f45',
          borderRadius: '4px',
          padding: '0.35rem 0.85rem',
          color: uploading ? '#7a6898' : '#7a6898',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.72rem',
          cursor: uploading ? 'not-allowed' : 'pointer',
        }}
      >
        {uploading ? 'Uploading…' : 'Upload video file'}
      </button>

      {error && (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#ff6b6b' }}>{error}</div>
      )}

      {data?.url && (
        <video
          src={data.url}
          muted
          playsInline
          style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #2a1f45', backgroundColor: '#060509' }}
        />
      )}
    </div>
  )
}

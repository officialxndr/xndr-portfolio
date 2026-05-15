import { useRef } from 'react'
import { uploadFile } from '../../utils/upload.js'

const inputStyle = {
  width: '100%',
  padding: '0.45rem 0.65rem',
  backgroundColor: '#060509',
  border: '1px solid #2a1f45',
  borderRadius: '5px',
  color: '#e2e8f0',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.8rem',
  outline: 'none',
}

const label = (text) => (
  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a090bc', display: 'block', marginBottom: '0.3rem' }}>
    {text}
  </span>
)

function SidePanel({ title, sideData, onChange, token, fileRef }) {
  const upload = async (file) => {
    const { url } = await uploadFile(file, token)
    onChange({ ...(sideData ?? {}), url })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {label(title)}
      {sideData?.url && (
        <img src={sideData.url} alt="" style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #2a1f45', backgroundColor: '#060509' }} />
      )}
      <input
        style={inputStyle}
        value={sideData?.url ?? ''}
        onChange={e => onChange({ ...(sideData ?? {}), url: e.target.value })}
        placeholder="Paste URL…"
        onFocus={e => e.target.style.borderColor = '#b08fff'}
        onBlur={e => e.target.style.borderColor = '#2a1f45'}
      />
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
      <button type="button" onClick={() => fileRef.current?.click()}
        style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid #2a1f45', borderRadius: '4px', padding: '0.28rem 0.7rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', cursor: 'pointer' }}>
        Upload
      </button>
      {label('Slide label')}
      <input
        style={inputStyle}
        value={sideData?.label ?? title}
        onChange={e => onChange({ ...(sideData ?? {}), label: e.target.value })}
        placeholder={title}
        onFocus={e => e.target.style.borderColor = '#b08fff'}
        onBlur={e => e.target.style.borderColor = '#2a1f45'}
      />
    </div>
  )
}

export default function BeforeAfterEditor({ data, onChange, token }) {
  const beforeRef = useRef(null)
  const afterRef  = useRef(null)

  const set = (side, val) => onChange({ ...data, [side]: val })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', alignItems: 'start' }}>
        <SidePanel title="Before" sideData={data?.before} onChange={v => set('before', v)} token={token} fileRef={beforeRef} />
        <SidePanel title="After"  sideData={data?.after}  onChange={v => set('after',  v)} token={token} fileRef={afterRef}  />
      </div>

      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.68rem', color: '#a090bc', opacity: 0.7 }}>
        Both images should share the same aspect ratio for best results.
      </div>

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
    </div>
  )
}

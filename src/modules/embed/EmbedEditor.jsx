const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.7rem',
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

const ASPECT_RATIOS = [
  { value: '16/9',  label: '16:9 — Widescreen' },
  { value: '4/3',   label: '4:3 — Standard' },
  { value: '1/1',   label: '1:1 — Square' },
  { value: '9/16',  label: '9:16 — Vertical' },
  { value: '21/9',  label: '21:9 — Ultrawide' },
]

export default function EmbedEditor({ data, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div>
        {label('URL or embed code')}
        <textarea
          style={{ ...inputStyle, minHeight: '72px', resize: 'vertical', lineHeight: 1.5, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.73rem' }}
          value={data?.url ?? ''}
          onChange={e => onChange({ ...data, url: e.target.value })}
          placeholder={`Paste a URL or <iframe> embed code\n\nYouTube, Vimeo, Figma, Sketchfab, CodePen…`}
          onFocus={e => e.target.style.borderColor = '#b08fff'}
          onBlur={e => e.target.style.borderColor = '#2a1f45'}
        />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.67rem', color: '#a090bc', marginTop: '0.3rem', opacity: 0.7 }}>
          YouTube and Vimeo watch links are auto-converted to embed URLs.
        </div>
      </div>

      <div>
        {label('Aspect ratio')}
        <select
          style={{ ...inputStyle, cursor: 'pointer' }}
          value={data?.aspectRatio ?? '16/9'}
          onChange={e => onChange({ ...data, aspectRatio: e.target.value })}
        >
          {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
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

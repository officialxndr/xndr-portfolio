export default function TextEditor({ data, onChange }) {
  return (
    <textarea
      style={{
        width: '100%',
        minHeight: '100px',
        padding: '0.6rem 0.75rem',
        backgroundColor: '#060509',
        border: '1px solid #2a1f45',
        borderRadius: '5px',
        color: '#e2e8f0',
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.82rem',
        lineHeight: 1.7,
        outline: 'none',
        resize: 'vertical',
      }}
      value={data?.text ?? ''}
      onChange={e => onChange({ ...data, text: e.target.value })}
      placeholder="Write your notes here…"
      onFocus={e => e.target.style.borderColor = '#b08fff'}
      onBlur={e => e.target.style.borderColor = '#2a1f45'}
    />
  )
}

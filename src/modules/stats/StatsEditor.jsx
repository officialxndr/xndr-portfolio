const inputStyle = {
  width: '100%',
  padding: '0.42rem 0.6rem',
  backgroundColor: '#060509',
  border: '1px solid #2a1f45',
  borderRadius: '5px',
  color: '#e2e8f0',
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.8rem',
  outline: 'none',
}

const newStat = () => ({ label: '', value: '' })

export default function StatsEditor({ data, onChange }) {
  const stats = data?.stats ?? [newStat()]

  const update = (i, key, val) =>
    onChange({ ...data, stats: stats.map((s, idx) => idx === i ? { ...s, [key]: val } : s) })
  const remove = (i) =>
    onChange({ ...data, stats: stats.filter((_, idx) => idx !== i) })
  const add = () =>
    onChange({ ...data, stats: [...stats, newStat()] })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 28px', gap: '0.4rem', marginBottom: '0.1rem' }}>
        <div />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a090bc' }}>Label</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#a090bc' }}>Value</span>
        <div />
      </div>

      {stats.map((s, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 28px', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.65rem', color: '#a090bc', textAlign: 'center' }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <input
            style={inputStyle}
            value={s.label}
            onChange={e => update(i, 'label', e.target.value)}
            placeholder="Runtime"
            onFocus={e => e.target.style.borderColor = '#b08fff'}
            onBlur={e => e.target.style.borderColor = '#2a1f45'}
          />
          <input
            style={inputStyle}
            value={s.value}
            onChange={e => update(i, 'value', e.target.value)}
            placeholder="3:42"
            onFocus={e => e.target.style.borderColor = '#b08fff'}
            onBlur={e => e.target.style.borderColor = '#2a1f45'}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a1520', fontSize: '13px', padding: 0, display: 'flex', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
            onMouseLeave={e => e.currentTarget.style.color = '#2a1520'}
          >✕</button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        style={{ alignSelf: 'flex-start', marginTop: '0.15rem', background: 'none', border: '1px dashed #2a1f45', borderRadius: '4px', padding: '0.3rem 0.8rem', color: '#a090bc', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', cursor: 'pointer', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#b08fff'; e.currentTarget.style.color = '#b08fff' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a1f45'; e.currentTarget.style.color = '#a090bc' }}
      >
        + Add stat
      </button>
    </div>
  )
}

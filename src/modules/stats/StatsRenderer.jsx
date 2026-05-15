export default function StatsRenderer({ data }) {
  const stats = (data?.stats ?? []).filter(s => s.label || s.value)
  if (!stats.length) return null

  return (
    <div style={{
      backgroundColor: '#050308',
      border: '1px solid #160f24',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            padding: '0.75rem 1.25rem',
            borderBottom: i < stats.length - 1 ? '1px solid #0d0a17' : 'none',
          }}
        >
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#a090bc',
          }}>
            {s.label}
          </span>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#e2e8f0',
            letterSpacing: '-0.01em',
          }}>
            {s.value}
          </span>
        </div>
      ))}
    </div>
  )
}

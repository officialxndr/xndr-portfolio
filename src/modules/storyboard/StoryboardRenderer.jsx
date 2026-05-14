export default function StoryboardRenderer({ data }) {
  const frames = data?.frames ?? []
  if (!frames.length) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
      {frames.map((frame, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ position: 'relative', paddingTop: '62%', borderRadius: '4px', overflow: 'hidden', border: '1px solid #2a1f45', backgroundColor: '#100d1a' }}>
            <div style={{ position: 'absolute', top: '6px', left: '8px', fontFamily: "'Syne', sans-serif", fontSize: '0.58rem', color: '#7a6898', letterSpacing: '0.1em', zIndex: 1 }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            {frame.url && (
              <img src={frame.url} alt={frame.caption || ''} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          {frame.caption && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#7a6898', lineHeight: 1.45 }}>
              {frame.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

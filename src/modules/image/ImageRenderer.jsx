export default function ImageRenderer({ data }) {
  if (!data?.url) return null
  return (
    <figure style={{ margin: 0 }}>
      <img
        src={data.url}
        alt={data.caption || ''}
        style={{ width: '100%', borderRadius: '4px', display: 'block', border: '1px solid #2a1f45' }}
      />
      {data.caption && (
        <figcaption style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#7a6898', marginTop: '0.5rem', lineHeight: 1.5 }}>
          {data.caption}
        </figcaption>
      )}
    </figure>
  )
}

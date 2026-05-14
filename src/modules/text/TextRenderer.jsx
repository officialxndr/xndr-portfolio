export default function TextRenderer({ data }) {
  if (!data?.text) return null
  return (
    <p style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.9rem',
      color: '#8a9ab0',
      lineHeight: 1.85,
      whiteSpace: 'pre-wrap',
      margin: 0,
    }}>
      {data.text}
    </p>
  )
}

function resolveEmbedUrl(raw) {
  if (!raw?.trim()) return ''

  // Extract src from pasted <iframe> code
  const iframeSrc = raw.match(/\bsrc=["']([^"']+)["']/i)
  if (iframeSrc) return iframeSrc[1]

  const url = raw.trim()

  // YouTube: watch?v=ID or youtu.be/ID or shorts/ID
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`

  // Vimeo: vimeo.com/ID or vimeo.com/channels/.../ID
  const vimeo = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  // Figma: already /embed or /file — pass through
  if (url.includes('figma.com')) return url

  // Sketchfab model page → embed
  const sketchfab = url.match(/sketchfab\.com\/3d-models\/[^/]+-([a-f0-9]{32})/)
  if (sketchfab) return `https://sketchfab.com/models/${sketchfab[1]}/embed`

  // CodePen: /pen/ → /embed/
  const codepen = url.match(/codepen\.io\/([^/]+)\/pen\/([^/?#]+)/)
  if (codepen) return `https://codepen.io/${codepen[1]}/embed/${codepen[2]}?default-tab=result`

  // Return as-is if it looks like a direct embed URL
  return url.startsWith('http') ? url : ''
}

function parseRatio(str) {
  const parts = (str ?? '16/9').split('/').map(Number)
  const w = parts[0] || 16
  const h = parts[1] || 9
  return (h / w * 100).toFixed(4)
}

export default function EmbedRenderer({ data }) {
  const src = resolveEmbedUrl(data?.url)
  if (!src) return null

  const paddingPct = parseRatio(data?.aspectRatio)

  return (
    <figure style={{ margin: 0 }}>
      <div style={{
        position: 'relative',
        paddingTop: `${paddingPct}%`,
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0a0612',
        border: '1px solid #2a1f45',
      }}>
        <iframe
          src={src}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {data?.caption && (
        <figcaption style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#a090bc', marginTop: '0.5rem', lineHeight: 1.5 }}>
          {data.caption}
        </figcaption>
      )}
    </figure>
  )
}

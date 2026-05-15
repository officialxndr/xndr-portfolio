import { useState, useRef, useCallback } from 'react'

export default function BeforeAfterRenderer({ data }) {
  const [pos, setPos]   = useState(50)
  const containerRef    = useRef(null)

  const getPos = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return 50
    return Math.max(2, Math.min(98, (clientX - rect.left) / rect.width * 100))
  }, [])

  const onPointerDown = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setPos(getPos(e.clientX))
  }
  const onPointerMove = (e) => {
    if (e.buttons === 0) return
    setPos(getPos(e.clientX))
  }

  const hasImages = data?.before?.url || data?.after?.url
  if (!hasImages) return null

  return (
    <figure style={{ margin: 0 }}>
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '6px',
          border: '1px solid #2a1f45',
          cursor: 'col-resize',
          userSelect: 'none',
          touchAction: 'none',
          backgroundColor: '#0a0612',
        }}
      >
        {/* Before image — sets container height */}
        {data.before?.url && (
          <img
            src={data.before.url}
            alt={data.before.label || 'Before'}
            draggable={false}
            style={{ display: 'block', width: '100%' }}
          />
        )}

        {/* After image — absolutely fills the same space, clipped */}
        {data.after?.url && (
          <div
            style={{
              position: 'absolute', inset: 0,
              clipPath: `inset(0 ${100 - pos}% 0 0)`,
              transition: 'clip-path 0s',
            }}
          >
            <img
              src={data.after.url}
              alt={data.after.label || 'After'}
              draggable={false}
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Side labels */}
        {data.before?.label && (
          <div style={{ position: 'absolute', top: 10, left: 12, fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', letterSpacing: '0.08em', color: '#e2e8f0', background: 'rgba(4,6,10,0.65)', padding: '0.15rem 0.55rem', borderRadius: '3px', backdropFilter: 'blur(6px)', pointerEvents: 'none' }}>
            {data.before.label}
          </div>
        )}
        {data.after?.label && (
          <div style={{ position: 'absolute', top: 10, right: 12, fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', letterSpacing: '0.08em', color: '#e2e8f0', background: 'rgba(4,6,10,0.65)', padding: '0.15rem 0.55rem', borderRadius: '3px', backdropFilter: 'blur(6px)', pointerEvents: 'none' }}>
            {data.after.label}
          </div>
        )}

        {/* Divider line */}
        <div
          style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${pos}%`, transform: 'translateX(-50%)',
            width: '2px',
            background: 'rgba(176,143,255,0.75)',
            pointerEvents: 'none',
          }}
        >
          {/* Handle */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'rgba(7,10,16,0.7)',
            border: '1.5px solid rgba(176,143,255,0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="rgba(176,143,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 5H1M11 5h4M3 2l-2 3 2 3M13 2l2 3-2 3"/>
            </svg>
          </div>
        </div>
      </div>

      {data.caption && (
        <figcaption style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: '#a090bc', marginTop: '0.5rem', lineHeight: 1.5 }}>
          {data.caption}
        </figcaption>
      )}
    </figure>
  )
}

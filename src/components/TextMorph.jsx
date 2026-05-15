import { useCallback, useEffect, useRef } from 'react'

const SPAN_STYLE = {
  position: 'absolute',
  width: '100%',
  display: 'inline-block',
  textAlign: 'center',
  color: '#ffffff',
  fontFamily: "'Inter', sans-serif",
  fontSize: '5rem',
  lineHeight: 1,
  fontWeight: 300,
  letterSpacing: '0.08em',
  userSelect: 'none',
}

function useMorphingText(texts, morphTime) {
  const textIndexRef = useRef(0)
  const morphRef = useRef(0)
  const cooldownRef = useRef(0)
  const timeRef = useRef(new Date())
  const text1Ref = useRef(null)
  const text2Ref = useRef(null)

  const setStyles = useCallback(
    (fraction) => {
      const el1 = text1Ref.current
      const el2 = text2Ref.current
      if (!el1 || !el2) return

      el2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
      el2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`

      const inv = 1 - fraction
      el1.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`
      el1.style.opacity = `${Math.pow(inv, 0.4) * 100}%`

      el1.textContent = texts[textIndexRef.current % texts.length]
      el2.textContent = texts[(textIndexRef.current + 1) % texts.length]
    },
    [texts],
  )

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current
    cooldownRef.current = 0

    let fraction = morphRef.current / morphTime
    if (fraction > 1) {
      cooldownRef.current = morphTime / 3
      fraction = 1
    }

    setStyles(fraction)
    if (fraction === 1) textIndexRef.current++
  }, [setStyles, morphTime])

  const doCooldown = useCallback(() => {
    morphRef.current = 0
    const el1 = text1Ref.current
    const el2 = text2Ref.current
    if (el1 && el2) {
      el2.style.filter = 'none'
      el2.style.opacity = '100%'
      el1.style.filter = 'none'
      el1.style.opacity = '0%'
    }
  }, [])

  useEffect(() => {
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      const now = new Date()
      const dt = (now.getTime() - timeRef.current.getTime()) / 1000
      timeRef.current = now
      cooldownRef.current -= dt
      if (cooldownRef.current <= 0) doMorph()
      else doCooldown()
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [doMorph, doCooldown])

  return { text1Ref, text2Ref }
}

export default function TextMorph({ texts, morphTime = 1.5 }) {
  const { text1Ref, text2Ref } = useMorphingText(texts, morphTime)

  if (!texts || texts.length === 0) return null

  if (texts.length === 1) {
    return <div style={{ ...SPAN_STYLE, position: 'relative' }}>{texts[0]}</div>
  }

  return (
    <div
      style={{
        position: 'relative',
        width: 'min(640px, 90vw)',
        height: '5rem',
        filter: 'url(#threshold) blur(0.6px)',
      }}
    >
      <span ref={text1Ref} style={SPAN_STYLE} />
      <span ref={text2Ref} style={SPAN_STYLE} />
      <svg style={{ position: 'fixed', width: 0, height: 0 }}>
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

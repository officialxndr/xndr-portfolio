import { useState, useRef, useEffect } from 'react'
import ModuleRenderer from '../ModuleRenderer.jsx'

const DOT = 14
const ACCENT = '#b08fff'
const LINE = '#2a1f45'

function Dot({ active }) {
  return (
    <div style={{
      width: DOT, height: DOT,
      borderRadius: '50%',
      border: `1.5px solid ${ACCENT}`,
      backgroundColor: active ? ACCENT : '#050308',
      flexShrink: 0,
      boxShadow: active ? '0 0 10px rgba(176,143,255,0.45)' : 'none',
      transition: 'background-color 0.3s, box-shadow 0.3s',
      zIndex: 1,
    }} />
  )
}

const SD_STYLES = `
  @keyframes tl-in-down { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes tl-in-up   { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }
`

// ─── Shared scroll-driven hook ────────────────────────────────────────────────
// Returns activeStep (0-indexed), lineProgress (0-100), and a ref for scroll dir.
// Also handles optional snap-to-step after scroll idle.

function useScrollDriven(containerRef, stepsLength, snap) {
  const [activeStep, setActiveStep] = useState(0)
  const [lineProgress, setLineProgress] = useState(0)
  const prevStepRef = useRef(0)
  const scrollDirRef = useRef(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let locked = false
    let unlockCleanup = null
    let touchStartY = 0
    let touchStartStep = 0

    const getInfo = () => {
      const rect = el.getBoundingClientRect()
      const scrolled = -rect.top
      const scrollable = el.offsetHeight - window.innerHeight
      const progress = scrollable > 0 ? Math.max(0, Math.min(1, scrolled / scrollable)) : 0
      // N-1 equal intervals: step i sits at progress = i/(N-1), so step N-1 is at full scroll
      const step = Math.max(0, Math.min(stepsLength - 1, Math.round(progress * (stepsLength - 1))))
      return { scrolled, scrollable, progress, step, absTop: rect.top + window.scrollY }
    }

    const goToStep = (next) => {
      const { absTop, scrollable } = getInfo()
      if (scrollable <= 0) return
      locked = true
      scrollDirRef.current = next >= prevStepRef.current
      const frac = stepsLength > 1 ? next / (stepsLength - 1) : 0
      window.scrollTo({ top: absTop + frac * scrollable, behavior: 'smooth' })
      // Hold lock until the animation finishes so rapid notches only advance one step
      unlockCleanup?.()
      const unlock = () => { locked = false; unlockCleanup = null }
      if ('onscrollend' in window) {
        window.addEventListener('scrollend', unlock, { once: true })
        unlockCleanup = () => window.removeEventListener('scrollend', unlock)
      } else {
        const t = setTimeout(unlock, 500)
        unlockCleanup = () => clearTimeout(t)
      }
    }

    const onScroll = () => {
      const { scrollable, progress, step } = getInfo()
      if (scrollable <= 0) return
      if (!locked) scrollDirRef.current = step >= prevStepRef.current
      prevStepRef.current = step
      setActiveStep(step)
      setLineProgress(progress * 100)
    }

    const onWheel = (e) => {
      const { scrolled, scrollable, step } = getInfo()
      if (scrolled < 0 || scrolled > scrollable) return
      const dir = e.deltaY > 0 ? 1 : -1
      const target = step + dir
      if (target < 0 || target >= stepsLength) return  // at boundary — let scroll propagate
      e.preventDefault()
      if (locked) return
      goToStep(target)
    }

    const onTouchStart = (e) => {
      const { step } = getInfo()
      touchStartY = e.touches[0].clientY
      touchStartStep = step
    }

    const onTouchMove = (e) => {
      const { scrolled, scrollable } = getInfo()
      if (scrolled < 0 || scrolled > scrollable) return
      const dy = touchStartY - e.touches[0].clientY
      if (Math.abs(dy) < 5) return
      const dir = dy > 0 ? 1 : -1
      if (dir > 0 && touchStartStep >= stepsLength - 1) return  // last step — allow scroll out
      if (dir < 0 && touchStartStep <= 0) return               // first step — allow scroll out
      e.preventDefault()
    }

    const onTouchEnd = (e) => {
      if (locked) return
      const { scrolled, scrollable } = getInfo()
      if (scrolled < 0 || scrolled > scrollable) return
      const dy = touchStartY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 30) return
      const dir = dy > 0 ? 1 : -1
      const target = touchStartStep + dir
      if (target < 0 || target >= stepsLength) return
      goToStep(target)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    if (snap) {
      window.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('touchstart', onTouchStart, { passive: true })
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('touchend', onTouchEnd, { passive: true })
    }
    onScroll()

    return () => {
      unlockCleanup?.()
      window.removeEventListener('scroll', onScroll)
      if (snap) {
        window.removeEventListener('wheel', onWheel)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('touchend', onTouchEnd)
      }
    }
  }, [stepsLength, snap])

  return { activeStep, lineProgress, scrollDirRef }
}

// ─── Active step content panel (shared between SD components) ─────────────────

function SDContent({ step, scrollingDown, fullWidth }) {
  return (
    <div
      key={step?.id} // key change triggers fade animation on the wrapper
      style={{ animation: `${scrollingDown ? 'tl-in-down' : 'tl-in-up'} 0.35s ease both` }}
    >
      {(step?.label || step?.date || step?.title) && (
        <div style={{ marginBottom: '1.5rem' }}>
          {step?.label && (
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT, opacity: 0.8, marginBottom: '0.3rem' }}>
              {step.label}
            </div>
          )}
          {step?.date && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#7a6898', marginBottom: '0.4rem' }}>
              {step.date}
            </div>
          )}
          {step?.title && (
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: fullWidth ? 'clamp(1.5rem, 6vw, 2.5rem)' : 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>
              {step.title}
            </h2>
          )}
        </div>
      )}
      {(step?.modules ?? []).map(mod => (
        <div key={mod.id} style={{ marginBottom: '1.25rem' }}>
          <ModuleRenderer module={mod} />
        </div>
      ))}
    </div>
  )
}

// ─── Horizontal progress strip (used on mobile + SD horizontal) ───────────────

function HorizontalProgressStrip({ steps, activeStep, lineProgress, labels }) {
  return (
    <div style={{ position: 'relative', height: DOT + (labels ? 56 : 4) }}>
      {/* Background line */}
      <div style={{ position: 'absolute', top: Math.floor(DOT / 2), left: 0, right: 0, height: 1, background: LINE }} />
      {/* Fill line */}
      <div style={{ position: 'absolute', top: Math.floor(DOT / 2), left: 0, height: 1, width: `${lineProgress}%`, background: `linear-gradient(to right, ${ACCENT}, rgba(176,143,255,0.6))`, transition: 'width 0.12s ease-out' }} />
      {/* Dots + optional labels */}
      {steps.map((step, i) => {
        const pct = steps.length > 1 ? (i / (steps.length - 1)) * 100 : 50
        const active = i <= activeStep
        const current = i === activeStep
        const maxW = `${Math.max(60, Math.floor(80 / steps.length))}px`
        return (
          <div key={step.id || i} style={{ position: 'absolute', left: `${pct}%`, top: 0, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
            <div style={{ zIndex: 1 }}><Dot active={active} /></div>
            {labels && (
              <div style={{ textAlign: 'center', maxWidth: maxW, overflow: 'hidden' }}>
                {step.label && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.52rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: active ? ACCENT : '#3a2f4c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.3s' }}>
                    {step.label}
                  </div>
                )}
                {step.date && (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', color: active ? '#a090bc' : '#3a2f4c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.3s' }}>
                    {step.date}
                  </div>
                )}
                {step.title && (
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: current ? '0.72rem' : '0.62rem', fontWeight: current ? 700 : 400, color: current ? '#e2e8f0' : active ? '#7a6898' : '#3a2f4c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em', transition: 'all 0.3s' }}>
                    {step.title}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Static vertical ──────────────────────────────────────────────────────────

function VerticalTimeline({ steps }) {
  return (
    <div style={{ position: 'relative', paddingLeft: `${DOT + 20}px` }}>
      <div style={{ position: 'absolute', left: Math.floor(DOT / 2), top: DOT / 2, bottom: 0, width: 1, background: `linear-gradient(to bottom, rgba(176,143,255,0.45), rgba(42,31,69,0.1))` }} />
      {steps.map((step, i) => (
        <div key={step.id || i} style={{ position: 'relative', paddingBottom: i < steps.length - 1 ? '3rem' : 0 }}>
          <div style={{ position: 'absolute', left: -(DOT + 20), top: 3 }}>
            <Dot active={i === 0} />
          </div>
          <div style={{ marginBottom: (step.modules ?? []).length ? '1rem' : 0 }}>
            {step.label && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT, opacity: 0.7, marginBottom: '0.15rem' }}>{step.label}</div>}
            {step.date && <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.65rem', color: '#7a6898', marginBottom: '0.25rem' }}>{step.date}</div>}
            {step.title && <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>{step.title}</div>}
          </div>
          {(step.modules ?? []).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {step.modules.map(mod => <ModuleRenderer key={mod.id} module={mod} />)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Scroll-driven vertical ───────────────────────────────────────────────────

function ScrollDrivenTimeline({ steps, snap }) {
  const containerRef = useRef(null)
  const { activeStep, lineProgress, scrollDirRef } = useScrollDriven(containerRef, steps.length, snap)

  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const h = e => setIsMobile(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const scrollingDown = scrollDirRef.current
  const step = steps[activeStep]
  const navH = 'min(65vh, 480px)'

  return (
    <div ref={containerRef} style={{ height: `${steps.length * 100}vh`, position: 'relative' }}>
      <style>{SD_STYLES}</style>

      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {isMobile ? (
          // ── Mobile: progress strip on top, full-width content below ──
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem 0 2rem', gap: '1.25rem' }}>
            <div>
              <HorizontalProgressStrip steps={steps} activeStep={activeStep} lineProgress={lineProgress} labels={false} />
              {/* Step counter + meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: '#4a3f5c', letterSpacing: '0.08em' }}>
                  {String(activeStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                </span>
                {step?.date && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: '#7a6898' }}>{step.date}</span>}
                {step?.label && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, opacity: 0.8 }}>{step.label}</span>}
              </div>
            </div>

            <div key={activeStep} style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', animation: `${scrollingDown ? 'tl-in-down' : 'tl-in-up'} 0.3s ease both` }}>
              {step?.title && (
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.4rem, 7vw, 2rem)', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0 0 1.25rem' }}>
                  {step.title}
                </h2>
              )}
              {(step?.modules ?? []).map(mod => (
                <div key={mod.id} style={{ marginBottom: '1rem' }}>
                  <ModuleRenderer module={mod} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          // ── Desktop: vertical dot nav on left, content on right ──
          <div style={{ display: 'flex', gap: '3rem', width: '100%', padding: '2rem 0', boxSizing: 'border-box', alignItems: 'center' }}>
            {/* Left nav */}
            <div style={{ width: 200, flexShrink: 0, position: 'relative', height: navH }}>
              {steps.length > 1 && (
                <>
                  <div style={{ position: 'absolute', left: Math.floor(DOT / 2), top: 0, bottom: 0, width: 1, background: LINE }} />
                  <div style={{ position: 'absolute', left: Math.floor(DOT / 2), top: 0, width: 1, height: `${lineProgress}%`, background: `linear-gradient(to bottom, ${ACCENT}, rgba(176,143,255,0.55))`, transition: 'height 0.12s ease-out' }} />
                </>
              )}
              {steps.map((s, i) => {
                const pct = steps.length > 1 ? (i / (steps.length - 1)) * 100 : 50
                const active = i <= activeStep
                const current = i === activeStep
                return (
                  <div key={s.id || i} style={{ position: 'absolute', top: `${pct}%`, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.85rem', left: 0, right: 0 }}>
                    <div style={{ flexShrink: 0, zIndex: 1 }}><Dot active={active} /></div>
                    <div>
                      {s.label && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: active ? ACCENT : '#3a2f4c', marginBottom: '0.1rem', transition: 'color 0.3s' }}>{s.label}</div>}
                      {s.date && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: active ? '#a090bc' : '#3a2f4c', marginBottom: '0.12rem', transition: 'color 0.3s' }}>{s.date}</div>}
                      {s.title && <div style={{ fontFamily: "'Syne', sans-serif", fontSize: current ? '0.88rem' : '0.73rem', fontWeight: current ? 700 : 400, color: current ? '#e2e8f0' : active ? '#7a6898' : '#3a2f4c', letterSpacing: '-0.01em', transition: 'all 0.3s' }}>{s.title}</div>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right content */}
            <div style={{ flex: 1, maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto', scrollbarWidth: 'none' }}>
              <div key={activeStep} style={{ animation: `${scrollingDown ? 'tl-in-down' : 'tl-in-up'} 0.35s ease both` }}>
                <SDContent step={step} scrollingDown={scrollingDown} fullWidth={false} />
              </div>
            </div>
          </div>
        )}

        {/* Step counter — desktop only (mobile has inline counter) */}
        {!isMobile && (
          <div style={{ position: 'absolute', bottom: '1.5rem', right: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: '#4a3f5c', letterSpacing: '0.1em' }}>
            {String(activeStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Static horizontal ────────────────────────────────────────────────────────

function HorizontalTimeline({ steps }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div style={{ overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <div style={{ display: 'flex', minWidth: 'max-content' }}>
          {steps.map((step, i) => (
            <button key={step.id || i} type="button" onClick={() => setActive(i)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 160, flex: '0 0 160px', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0.75rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: DOT + 4, marginBottom: '0.6rem' }}>
                <div style={{ flex: 1, height: 1, background: i === 0 ? 'transparent' : LINE }} />
                <Dot active={i === active} />
                <div style={{ flex: 1, height: 1, background: i === steps.length - 1 ? 'transparent' : LINE }} />
              </div>
              <div style={{ textAlign: 'center', padding: '0 0.5rem' }}>
                {step.label && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.58rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: i === active ? ACCENT : '#4a3f5c', marginBottom: '0.12rem', transition: 'color 0.2s' }}>{step.label}</div>}
                {step.date && <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.63rem', color: i === active ? '#a090bc' : '#4a3f5c', marginBottom: '0.2rem', transition: 'color 0.2s' }}>{step.date}</div>}
                {step.title && <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.83rem', fontWeight: 600, color: i === active ? '#e2e8f0' : '#7a6898', transition: 'color 0.2s' }}>{step.title}</div>}
              </div>
            </button>
          ))}
        </div>
      </div>
      {steps[active] && (steps[active].modules ?? []).length > 0 && (
        <div style={{ marginTop: '1.25rem', padding: '1.5rem', backgroundColor: '#050308', border: '1px solid #160f24', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {steps[active].modules.map(mod => <ModuleRenderer key={mod.id} module={mod} />)}
        </div>
      )}
    </div>
  )
}

// ─── Scroll-driven horizontal ─────────────────────────────────────────────────

function ScrollDrivenHorizontalTimeline({ steps, snap }) {
  const containerRef = useRef(null)
  const { activeStep, lineProgress, scrollDirRef } = useScrollDriven(containerRef, steps.length, snap)
  const scrollingDown = scrollDirRef.current
  const step = steps[activeStep]

  return (
    <div ref={containerRef} style={{ height: `${steps.length * 100}vh`, position: 'relative' }}>
      <style>{SD_STYLES}</style>

      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '2rem 0', gap: '2rem' }}>
        {/* Dot strip with labels */}
        <HorizontalProgressStrip steps={steps} activeStep={activeStep} lineProgress={lineProgress} labels={true} />

        {/* Active step content — full width */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
          <div key={activeStep} style={{ animation: `${scrollingDown ? 'tl-in-down' : 'tl-in-up'} 0.35s ease both` }}>
            <SDContent step={step} scrollingDown={scrollingDown} fullWidth={true} />
          </div>
        </div>

        {/* Step counter */}
        <div style={{ position: 'absolute', bottom: '1.5rem', right: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: '#4a3f5c', letterSpacing: '0.1em' }}>
          {String(activeStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
        </div>
      </div>
    </div>
  )
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function TimelineRenderer({ data }) {
  const steps = (data?.steps ?? []).filter(s => s.title || s.label || s.date || (s.modules ?? []).length)
  if (!steps.length) return null

  const snap = data?.snap ?? false
  const scrollDriven = data?.scrollDriven ?? false

  if (data?.direction === 'horizontal') {
    return scrollDriven
      ? <ScrollDrivenHorizontalTimeline steps={steps} snap={snap} />
      : <HorizontalTimeline steps={steps} />
  }
  return scrollDriven
    ? <ScrollDrivenTimeline steps={steps} snap={snap} />
    : <VerticalTimeline steps={steps} />
}

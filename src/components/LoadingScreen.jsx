import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const WORD = 'Loading'

// Switch between: 'circuit' | 'heartbeat' | 'binary'
const VARIANT = 'circuit'

// ── Circuit Trace ────────────────────────────────────────────────────────────

const CIRCUIT_PATH = "M 0,10 L 35,10 L 35,4 L 75,4 L 75,16 L 115,16 L 115,4 L 155,4 L 155,10 L 220,10"
const CIRCUIT_NODES = [
  { cx: 35,  cy: 4  },
  { cx: 75,  cy: 16 },
  { cx: 115, cy: 4  },
  { cx: 155, cy: 4  },
]

function CircuitBar() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <svg width="220" height="20" viewBox="0 0 220 20" fill="none">
        <defs>
          <filter id="cglow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ghost track */}
        <path d={CIRCUIT_PATH} stroke="rgba(176,143,255,0.08)" strokeWidth="1.5"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* animated trace */}
        <motion.path
          d={CIRCUIT_PATH}
          stroke="rgba(176,143,255,0.85)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#cglow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.0, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* junction pads */}
        {CIRCUIT_NODES.map(({ cx, cy }, i) => (
          <motion.circle
            key={i}
            cx={cx} cy={cy} r={3}
            fill="rgba(220,200,255,0.9)"
            filter="url(#cglow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7] }}
            transition={{ duration: 0.3, delay: 0.7 + i * 0.38 }}
          />
        ))}
      </svg>
    </motion.div>
  )
}

// ── Heartbeat / EKG ──────────────────────────────────────────────────────────

const EKG_PATH = "M 0,12 L 72,12 L 77,12 L 82,2 L 86,22 L 91,12 L 220,12"

function HeartbeatBar() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <svg width="220" height="24" viewBox="0 0 220 24" fill="none">
        <defs>
          <filter id="hglow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ghost baseline */}
        <line x1="0" y1="12" x2="220" y2="12"
          stroke="rgba(176,143,255,0.08)" strokeWidth="1.5" />

        {/* animated EKG — linear ease feels like a real monitor scrolling */}
        <motion.path
          d={EKG_PATH}
          stroke="rgba(176,143,255,0.85)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#hglow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.0, delay: 0.35, ease: 'linear' }}
        />
      </svg>
    </motion.div>
  )
}

// ── Binary Bit-Flip ──────────────────────────────────────────────────────────

function BinaryBar() {
  const [displays, setDisplays] = useState(Array(8).fill('0'))
  const [settled, setSettled]   = useState(Array(8).fill(false))

  useEffect(() => {
    const timeouts = []
    for (let i = 0; i < 8; i++) {
      timeouts.push(setTimeout(() => {
        let count = 0
        const iv = setInterval(() => {
          setDisplays(prev => {
            const n = [...prev]
            n[i] = count % 2 === 0 ? '1' : '0'
            return n
          })
          count++
          if (count >= 6) {
            clearInterval(iv)
            setDisplays(prev => { const n = [...prev]; n[i] = '1'; return n })
            setSettled(prev => { const n = [...prev]; n[i] = true; return n })
          }
        }, 60)
      }, 300 + i * 220))
    }
    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', gap: '10px' }}
    >
      {displays.map((bit, i) => (
        <motion.span
          key={i}
          animate={{
            color: settled[i]
              ? ['rgba(235,220,255,1)', 'rgba(176,143,255,0.8)']
              : 'rgba(176,143,255,0.18)',
            textShadow: settled[i]
              ? ['0 0 14px rgba(176,143,255,1)', '0 0 4px rgba(176,143,255,0.35)']
              : 'none',
          }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '1.1rem',
            fontWeight: 700,
            minWidth: '12px',
            textAlign: 'center',
          }}
        >
          {bit}
        </motion.span>
      ))}
    </motion.div>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function LoadingScreen({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2400)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1.5rem',
      }}
    >
      {/* Rippling letters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ display: 'flex', alignItems: 'flex-end' }}
      >
        {[...WORD].map((char, i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.13, ease: 'easeInOut' }}
            style={{
              display: 'inline-block',
              fontFamily: "'Syne', sans-serif",
              fontSize: '1.35rem',
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(176,143,255,1)',
              textShadow: '0 0 48px rgba(176,143,255,0.35)',
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>

      {VARIANT === 'circuit'   && <CircuitBar />}
      {VARIANT === 'heartbeat' && <HeartbeatBar />}
      {VARIANT === 'binary'    && <BinaryBar />}
    </motion.div>
  )
}

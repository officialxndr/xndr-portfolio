import { useEffect } from 'react'
import { motion } from 'framer-motion'

const WORD = 'Loading'

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
            transition={{
              repeat: Infinity,
              duration: 1.8,
              delay: i * 0.13,
              ease: 'easeInOut',
            }}
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

      {/* Thin underline that fills across */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '4rem',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(176,143,255,0.5), transparent)',
          transformOrigin: 'center',
        }}
      />
    </motion.div>
  )
}

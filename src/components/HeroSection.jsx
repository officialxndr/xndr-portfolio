import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function HeroSection({ heroVideo, logo }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.play().catch(() => {})
  }, [heroVideo])

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {heroVideo ? (
        <video
          ref={videoRef}
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        />
      ) : null}

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(7,10,16,0.2) 0%, rgba(7,10,16,0.4) 50%, rgba(7,10,16,0.95) 100%)',
          zIndex: 1,
        }}
      />

      {logo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              maxWidth: 'min(340px, 55vw)',
              maxHeight: '180px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
            }}
          />
        </motion.div>
      )}

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          style={{ color: '#2a1f45' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

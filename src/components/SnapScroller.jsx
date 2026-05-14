import { useRef, useEffect, useCallback, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import React from 'react'

const THRESHOLD = 50
const WORK_ID = 'work'

export default function SnapScroller({ children, id }) {
  const containerRef = useRef(null)
  const currentIdx = useRef(0)
  const accumulated = useRef(0)
  const isAnimating = useRef(false)
  const resetTimer = useRef(null)
  const touchStartY = useRef(null)
  const y = useMotionValue(0)
  const childCount = React.Children.count(children)

  // Use actual pixel height so iOS Safari URL-bar doesn't cause a gap
  const [viewH, setViewH] = useState(window.innerHeight)
  useEffect(() => {
    const onResize = () => setViewH(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const snapTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(childCount - 1, index))
    isAnimating.current = true
    currentIdx.current = clamped
    animate(y, -clamped * window.innerHeight, {
      type: 'spring',
      stiffness: 260,
      damping: 32,
      onComplete: () => { isAnimating.current = false },
    })
  }, [y, childCount])

  const handleDelta = useCallback((delta) => {
    if (isAnimating.current) return
    accumulated.current += delta
    clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => {
      if (!isAnimating.current) {
        accumulated.current = 0
        snapTo(currentIdx.current)
      }
    }, 130)
    if (Math.abs(accumulated.current) >= THRESHOLD) {
      clearTimeout(resetTimer.current)
      const dir = accumulated.current > 0 ? 1 : -1
      accumulated.current = 0
      snapTo(currentIdx.current + dir)
    }
  }, [snapTo])

  // Returns true if the snap scroller should intercept this scroll event.
  // On the last section we only intercept when at the top and scrolling up (back to hero).
  const shouldIntercept = useCallback((scrollingDown) => {
    if (currentIdx.current !== childCount - 1) return true
    const section = document.getElementById(WORK_ID)
    if (!section) return true
    const atTop = section.scrollTop <= 2   // iOS scrollTop is fractional, never exact 0
    return atTop && !scrollingDown
  }, [childCount])

  const handleWheel = useCallback((e) => {
    const scrollingDown = e.deltaY > 0
    if (!shouldIntercept(scrollingDown)) {
      accumulated.current = 0
      return
    }
    e.preventDefault()
    handleDelta(e.deltaY)
  }, [handleDelta, shouldIntercept])

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === null) return
    const delta = touchStartY.current - e.touches[0].clientY
    const scrollingDown = delta > 0

    if (!shouldIntercept(scrollingDown)) {
      accumulated.current = 0
      touchStartY.current = e.touches[0].clientY   // keep reference fresh
      return
    }

    e.preventDefault()
    touchStartY.current = e.touches[0].clientY
    handleDelta(delta * 2.5)
  }, [handleDelta, shouldIntercept])

  useEffect(() => {
    const el = containerRef.current
    el.addEventListener('wheel', handleWheel, { passive: false })
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handleWheel, handleTouchStart, handleTouchMove])

  return (
    <div
      ref={containerRef}
      id={id}
      style={{ height: viewH, overflow: 'hidden', position: 'relative' }}
    >
      <motion.div style={{ y }}>
        {React.Children.map(children, (child, i) => (
          <div key={i} style={{ height: viewH, overflow: 'hidden' }}>
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

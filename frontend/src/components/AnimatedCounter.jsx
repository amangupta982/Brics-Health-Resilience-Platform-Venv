import { useEffect, useState, useRef } from 'react'

export default function AnimatedCounter({ value, duration = 800, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const start = prev.current
    const end = typeof value === 'number' ? value : parseFloat(value) || 0
    if (start === end) {
      setDisplay(end)
      return
    }

    let startTime = null
    let frameId = null

    function tick(now) {
      if (startTime === null) startTime = now
      const elapsed = Math.max(0, now - startTime)
      const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 1
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      const current = start + (end - start) * eased
      setDisplay(progress >= 1 ? end : current)

      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      } else {
        prev.current = end
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => {
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [value, duration])

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()
  return <>{prefix}{formatted}{suffix}</>
}

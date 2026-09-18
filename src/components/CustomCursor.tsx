import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * CustomCursor — a soft, trailing blob cursor inspired by Dennis Snellenberg
 * and Brandon Bartram portfolios. Follows the mouse with a spring delay,
 * scales up on interactive elements, and hides on touch devices.
 *
 * Add `data-cursor="pointer"` to any element for the enlarged hover state.
 * Add `data-cursor="text"` for a smaller "read" mode.
 */
export default function CustomCursor() {
  const [visible, setVisible] = useState(false)
  const [hoverType, setHoverType] = useState<'default' | 'pointer' | 'text'>('default')
  const isTouchDevice = useRef(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

  useEffect(() => {
    // Detect touch devices — hide custom cursor
    isTouchDevice.current = window.matchMedia('(pointer: coarse)').matches
    if (isTouchDevice.current) return

    const onMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const onMouseLeave = () => setVisible(false)
    const onMouseEnter = () => setVisible(true)

    // Delegate hover detection via event delegation on the document
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const cursorAttr = target.closest('[data-cursor]')?.getAttribute('data-cursor')
      // Also detect standard interactive elements
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, [tabindex]')
      if (cursorAttr === 'text') {
        setHoverType('text')
      } else if (cursorAttr === 'pointer' || isInteractive) {
        setHoverType('pointer')
      } else {
        setHoverType('default')
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)
    document.addEventListener('mouseover', onMouseOver)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
      document.removeEventListener('mouseover', onMouseOver)
    }
  }, [mouseX, mouseY, visible])

  // Respect reduced motion preference
  const prefersReduced = useRef(false)
  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Don't render on touch devices or reduced motion
  if (isTouchDevice.current || prefersReduced.current) return null

  const size = hoverType === 'pointer' ? 56 : hoverType === 'text' ? 16 : 32
  const opacity = hoverType === 'pointer' ? 0.18 : hoverType === 'text' ? 0.35 : 0.22

  return (
    <motion.div
      className="fixed top-0 left-0 z-[200] pointer-events-none mix-blend-screen"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        width: size,
        height: size,
        opacity: visible ? opacity : 0,
      }}
      transition={{
        width: { type: 'spring', stiffness: 300, damping: 25 },
        height: { type: 'spring', stiffness: 300, damping: 25 },
        opacity: { duration: 0.2 },
      }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background: hoverType === 'text'
            ? 'rgba(148, 163, 184, 0.7)'
            : 'radial-gradient(circle, rgba(16,185,129,0.8) 0%, rgba(59,130,246,0.4) 50%, transparent 70%)',
          filter: 'blur(1px)',
          boxShadow: hoverType === 'pointer'
            ? '0 0 30px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.1)'
            : '0 0 15px rgba(16,185,129,0.2)',
        }}
      />
    </motion.div>
  )
}

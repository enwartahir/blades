import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function ScrollPrompt() {
  const innerRef = useRef()

  useEffect(() => {
    gsap.to(innerRef.current, {
      y: 10,
      duration: 1.3,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      delay: 2.2,
    })
  }, [])

  return (
    <div style={{
      position: 'absolute',
      bottom: '44px',
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div ref={innerRef} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.65rem',
          letterSpacing: '3px',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}>
          Scroll to explore
        </span>
        <div style={{
          width: '1px',
          height: '36px',
          background: 'linear-gradient(to bottom, #445566, transparent)',
        }} />
      </div>
    </div>
  )
}

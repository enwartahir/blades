import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function HeroOverlay() {
  const labelRef = useRef()
  const line1Ref = useRef()
  const line2Ref = useRef()
  const subRef = useRef()

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.6 })
    tl.from(labelRef.current, {
      opacity: 0,
      y: -16,
      duration: 0.9,
      ease: 'power2.out',
    })
      .from(line1Ref.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
      }, '-=0.4')
      .from(line2Ref.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
      }, '-=0.75')
      .from(subRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.5')
  }, [])

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 5vw',
      pointerEvents: 'none',
    }}>
      <p ref={labelRef} style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.7rem',
        letterSpacing: '7px',
        color: '#88aacc',
        textTransform: 'uppercase',
        marginBottom: '28px',
      }}>
        Genshin Impact — Sword Collection
      </p>

      <h1 ref={line1Ref} style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3.2rem, 9vw, 7.5rem)',
        fontWeight: 900,
        color: '#ffffff',
        lineHeight: 0.88,
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        marginBottom: '8px',
      }}>
        Ten Legendary
      </h1>

      <h1 ref={line2Ref} style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3.2rem, 9vw, 7.5rem)',
        fontWeight: 900,
        color: '#ffffff',
        lineHeight: 0.88,
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        marginBottom: '40px',
      }}>
        Weapons
      </h1>

      <p ref={subRef} style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.8rem',
        letterSpacing: '2px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
      }}>
        Scroll to enter the collection ↓
      </p>
    </div>
  )
}

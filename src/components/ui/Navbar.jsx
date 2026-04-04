import { useEffect, useRef, useState } from 'react'
import { SWORDS } from '../../data/swords'

const navLinkStyle = {
  background: 'transparent',
  border: 'none',
  color: '#889aaa',
  fontFamily: 'var(--font-body)',
  fontSize: '0.75rem',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  cursor: 'pointer',
  padding: '4px 0',
  transition: 'color 0.2s',
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setDropdownOpen(false)
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: scrolled ? 'rgba(5,10,20,0.92)' : 'rgba(5,10,20,0.35)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 5vw',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'background 0.5s',
    }}>
      {/* Logo */}
      <div
        onClick={() => scrollTo('hero')}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.9rem',
          fontWeight: 700,
          letterSpacing: '5px',
          color: '#88aacc',
          textTransform: 'uppercase',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        Teyvat Blades
      </div>

      {/* Center links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
        <button
          style={navLinkStyle}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#889aaa' }}
          onClick={() => scrollTo('hero')}
        >
          Home
        </button>

        {/* Collection dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: '5px' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#889aaa' }}
            onClick={() => setDropdownOpen(v => !v)}
          >
            Collection
            <span style={{ fontSize: '0.55rem', opacity: 0.5, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▾</span>
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(5,10,20,0.97)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
              padding: '8px 0',
              minWidth: '210px',
              zIndex: 200,
            }}>
              {SWORDS.map((sword, i) => (
                <button
                  key={i}
                  onClick={() => scrollTo(`sword-section-${i}`)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '9px 20px',
                    background: 'transparent',
                    border: 'none',
                    color: '#889aaa',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    letterSpacing: '1px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'color 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#889aaa'; e.currentTarget.style.background = 'transparent' }}
                >
                  {sword.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          style={navLinkStyle}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#889aaa' }}
          onClick={() => scrollTo('outro')}
        >
          About
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={() => scrollTo('sword-section-0')}
        style={{
          background: 'transparent',
          border: '1px solid rgba(68,136,255,0.35)',
          color: '#4488ff',
          padding: '8px 22px',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(68,136,255,0.8)'; e.currentTarget.style.color = '#88aaff' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(68,136,255,0.35)'; e.currentTarget.style.color = '#4488ff' }}
      >
        Enter Collection →
      </button>
    </nav>
  )
}

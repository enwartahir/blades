export default function OutroOverlay() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

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
      gap: '20px',
      pointerEvents: 'none',
    }}>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.65rem',
        letterSpacing: '7px',
        color: '#88aacc',
        textTransform: 'uppercase',
      }}>
        The Collection
      </p>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)',
        fontWeight: 900,
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        Ten Blades.<br />One Legend.
      </h2>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontStyle: 'italic',
        fontWeight: 300,
        color: 'var(--text-secondary)',
        maxWidth: '400px',
        lineHeight: 1.75,
        fontSize: '0.92rem',
      }}>
        From the humblest blade to the mightiest weapon of the realm — every sword has a story. Every story has a hero.
      </p>

      <button
        onClick={scrollToTop}
        style={{
          marginTop: '8px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.18)',
          color: '#889aaa',
          padding: '12px 34px',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          transition: 'border-color 0.2s, color 0.2s',
          pointerEvents: 'auto',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = '#889aaa' }}
      >
        ↑ Back to Top
      </button>
    </div>
  )
}

import { ELEMENT_COLORS, ELEMENT_ICONS } from '../../data/swords'

export default function SwordOverlay({ sword, index }) {
  const isLeft = index % 2 === 0
  const elementColor = ELEMENT_COLORS[sword.element]
  const elementIcon = ELEMENT_ICONS[sword.element]

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < sword.rarity ? '#ffcc44' : '#2a3a44', fontSize: '1rem', marginRight: '2px' }}>★</span>
  ))

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      [isLeft ? 'left' : 'right']: '6vw',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none',
    }}>
      <div id={`sword-overlay-${index}`} style={{ opacity: 0, maxWidth: '380px' }}>
        {/* Element badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '4px 13px',
          border: `1px solid ${elementColor}55`,
          marginBottom: '18px',
        }}>
          <span style={{ fontSize: '0.75rem' }}>{elementIcon}</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.6rem',
            letterSpacing: '3px',
            color: elementColor,
            textTransform: 'uppercase',
          }}>
            {sword.element}
          </span>
        </div>

        {/* Sword name */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
          fontWeight: 900,
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '-0.02em',
          lineHeight: 0.9,
          marginBottom: '14px',
        }}>
          {sword.name}
        </h2>

        {/* Rarity stars */}
        <div style={{ marginBottom: '18px' }}>{stars}</div>

        {/* Lore */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(0.82rem, 1.2vw, 0.98rem)',
          color: 'var(--text-secondary)',
          lineHeight: 1.75,
          marginBottom: '22px',
        }}>
          {sword.lore}
        </p>

        {/* Divider */}
        <div style={{
          width: '48px',
          height: '1px',
          background: elementColor,
          opacity: 0.45,
          marginBottom: '18px',
        }} />

        {/* Stats */}
        <div style={{ display: 'flex', gap: '28px' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.58rem',
              letterSpacing: '2px',
              color: 'var(--text-muted)',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}>
              Base ATK
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#ffffff',
            }}>
              {sword.stats.atk}
            </div>
          </div>
          {sword.stats.substat !== '—' && (
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.58rem',
                letterSpacing: '2px',
                color: 'var(--text-muted)',
                marginBottom: '4px',
                textTransform: 'uppercase',
              }}>
                Substat
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: elementColor,
              }}>
                {sword.stats.substat}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

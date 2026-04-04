import Scene from './components/Scene'
import Navbar from './components/ui/Navbar'
import HeroOverlay from './components/ui/HeroOverlay'
import SwordOverlay from './components/ui/SwordOverlay'
import ScrollPrompt from './components/ui/ScrollPrompt'
import OutroOverlay from './components/ui/OutroOverlay'
import { SWORDS } from './data/swords'

export default function App() {
  return (
    <>
      {/* Fixed 3D canvas — always behind everything */}
      <Scene />

      {/* Fixed navbar */}
      <Navbar />

      {/* Scrollable content layer — pointer-events: none on container,
          interactive elements opt back in with pointer-events: auto */}
      <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'none' }}>

        {/* Hero — 100vh */}
        <section id="hero" style={{ height: '100vh', position: 'relative' }}>
          <HeroOverlay />
          <ScrollPrompt />
        </section>

        {/* Sword sections — 10 × 120vh = 1200vh */}
        {SWORDS.map((sword, i) => (
          <section
            key={i}
            id={`sword-section-${i}`}
            style={{ height: '120vh', position: 'relative' }}
          >
            <SwordOverlay sword={sword} index={i} />
          </section>
        ))}

        {/* Outro — 100vh */}
        <section id="outro" style={{ height: '100vh', position: 'relative' }}>
          <OutroOverlay />
        </section>

      </div>
    </>
  )
}

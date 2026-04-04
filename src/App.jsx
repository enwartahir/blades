import Scene from "./components/Scene";
import Navbar from "./components/ui/Navbar";
import HeroOverlay from "./components/ui/HeroOverlay";
import SwordOverlay from "./components/ui/SwordOverlay";
import ScrollPrompt from "./components/ui/ScrollPrompt";
import OutroOverlay from "./components/ui/OutroOverlay";
import { SWORDS } from "./data/swords";

export default function App() {
  return (
    <>
      <Scene />
      <Navbar />

      <div style={{ position: "relative", zIndex: 10, pointerEvents: "none" }}>
        <section id="hero" style={{ height: "100vh", position: "relative" }}>
          <HeroOverlay />
          <ScrollPrompt />
        </section>

        {/* 500vh per sword — each phase gets ~150vh of comfortable scroll */}
        {SWORDS.map((sword, i) => (
          <section
            key={i}
            id={`sword-section-${i}`}
            style={{ height: "500vh", position: "relative" }}
          >
            <SwordOverlay sword={sword} index={i} />
          </section>
        ))}

        <section id="outro" style={{ height: "100vh", position: "relative" }}>
          <OutroOverlay />
        </section>
      </div>
    </>
  );
}

import { Suspense } from "react";
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
        {/* Hero */}
        <section id="hero" style={{ height: "100vh", position: "relative" }}>
          <HeroOverlay />
          <ScrollPrompt />
        </section>

        {/* Each sword gets 500vh — plenty of room for approach + orbit + pass
            without feeling rushed. Each phase gets ~150-200vh of scroll. */}
        {SWORDS.map((sword, i) => (
          <section
            key={i}
            id={`sword-section-${i}`}
            style={{ height: "350vh", position: "relative" }}
          >
            <SwordOverlay sword={sword} index={i} />
          </section>
        ))}

        {/* Outro */}
        <section id="outro" style={{ height: "100vh", position: "relative" }}>
          <OutroOverlay />
        </section>
      </div>
    </>
  );
}

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SwordModel from "./SwordModel";
import Smoke from "./Smoke";
import {
  SWORDS,
  ELEMENT_COLORS,
  SWORD_POSITIONS,
  CAMERA_PATH_LENGTH,
} from "../data/swords";
import { scrollState } from "../store/scrollState";

const _color = new THREE.Color();

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ─── Camera Rig ───────────────────────────────────────────────────────────────
// Three phases per sword (localT 0→1):
//
//  APPROACH  0.00 → 0.40  Camera moves straight forward on X=0 to sweet spot
//  HOLD      0.40 → 0.70  Camera STOPS at sweet spot. Does NOT move.
//                          Sword auto-rotates — this IS the "scene rotating"
//                          effect. No camera X movement ever.
//  PASS      0.70 → 1.00  Camera blasts straight forward on X=0 through sword.
//                          lookAt stays on sword so sword stays centered.
//
// X is ALWAYS 0. Camera only ever moves on Z axis.

function CameraRig({ onSwordChange, onPhaseChange }) {
  const smoothPos = useRef(new THREE.Vector3(0, 0, 5));
  const smoothLook = useRef(new THREE.Vector3(0, 0, -5));
  const lastIndex = useRef(-1);
  const lastPhase = useRef("approach");
  const approachStartZ = useRef(5);

  useFrame(({ camera }) => {
    const raw = scrollState.scrollProgress || 0;
    const totalZ = raw * CAMERA_PATH_LENGTH;

    const si = Math.min(Math.floor(totalZ / 30), SWORDS.length - 1);
    const localT = Math.min((totalZ - si * 30) / 30, 1);

    const phase = localT < 0.4 ? "approach" : localT < 0.7 ? "hold" : "pass";

    if (si !== lastIndex.current) {
      lastIndex.current = si;
      scrollState.currentSwordIndex = si;
      scrollState.elementColorHex = ELEMENT_COLORS[SWORDS[si].element];
      approachStartZ.current = camera.position.z;
      smoothPos.current.set(0, 0, camera.position.z);
      smoothLook.current.set(0, 0, SWORD_POSITIONS[si].z);
      onSwordChange(si);
      lastPhase.current = "approach";
      console.log(
        `[SWORD] ${si} approachStart: ${camera.position.z.toFixed(2)}`,
      );
    }

    if (phase !== lastPhase.current) {
      lastPhase.current = phase;
      onPhaseChange(si, phase);
      console.log(`[PHASE] ${phase} localT: ${localT.toFixed(3)}`);
    }

    const swordZ = SWORD_POSITIONS[si].z;
    const sweetSpot = swordZ + 5;
    const passEndZ = swordZ - 10;

    let rawZ, lookZ;

    if (localT < 0.4) {
      const t = easeInOut(localT / 0.4);
      rawZ = approachStartZ.current + (sweetSpot - approachStartZ.current) * t;
      lookZ = swordZ;
      console.log(
        `[APPROACH] camZ: ${rawZ.toFixed(2)} sweetSpot: ${sweetSpot.toFixed(2)}`,
      );
    } else if (localT < 0.7) {
      rawZ = sweetSpot;
      lookZ = swordZ;
    } else {
      const t = easeInOut((localT - 0.7) / 0.3);
      rawZ = sweetSpot + (passEndZ - sweetSpot) * t;

      // KEY FIX: look FORWARD always — never at the sword
      // Looking at swordZ flips camera 180° once camZ passes swordZ
      // Looking ahead of camera means sword naturally recedes into fog behind
      lookZ = rawZ - 8;
      console.log(
        `[PASS] t: ${t.toFixed(3)} camZ: ${rawZ.toFixed(2)} lookZ: ${lookZ.toFixed(2)}`,
      );
    }

    smoothPos.current.lerp(new THREE.Vector3(0, 0, rawZ), 0.06);
    smoothLook.current.lerp(new THREE.Vector3(0, 0, lookZ), 0.06);

    camera.position.copy(smoothPos.current);
    camera.lookAt(smoothLook.current);

    scrollState.camPos.x = camera.position.x;
    scrollState.camPos.y = camera.position.y;
    scrollState.camPos.z = camera.position.z;
  });

  return null;
}

function ElementLight() {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    _color.set(scrollState.elementColorHex);
    ref.current.color.lerp(_color, 0.04);
  });
  return (
    <pointLight ref={ref} position={[0, 2, 2]} intensity={3} color="#334488" />
  );
}

function RimLight() {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    _color.set(scrollState.elementColorHex);
    ref.current.color.lerp(_color, 0.04);
  });
  return (
    <spotLight
      ref={ref}
      position={[0, -5, 2]}
      angle={0.5}
      penumbra={1}
      intensity={4}
      color="#334488"
    />
  );
}

function FollowLight() {
  const ref = useRef();
  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.position.set(
      camera.position.x,
      camera.position.y + 2,
      camera.position.z - 2,
    );
    _color.set(scrollState.elementColorHex);
    ref.current.color.lerp(_color, 0.04);
  });
  return <pointLight ref={ref} intensity={2} distance={20} color="#334488" />;
}

export default function Scene() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNext, setShowNext] = useState(false);

  const handleSwordChange = (index) => {
    console.log(`[REACT] Sword → ${index}`);
    setCurrentIndex(index);
    setShowNext(false);
  };

  // Fires once per phase transition — not every frame
  const handlePhaseChange = (index, phase) => {
    const inPass = phase === "pass";
    console.log(
      `[REACT] Phase → ${phase}, showNext: ${inPass && index < SWORDS.length - 1}`,
    );
    setShowNext(inPass && index < SWORDS.length - 1);
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8, // was 1.8 — lower value stops the oscillation bounce
      onUpdate: (self) => {
        scrollState.scrollProgress = self.progress;
        scrollState.heroMode = self.progress < 0.02;
      },
    });

    // Sword overlay text is synced to the SAME localT the camera rig uses
    // (see CameraRig above) — enter finishes / hold begins at localT 0.4,
    // exactly when the camera stops, and exit begins at localT 0.7,
    // exactly when the camera starts moving again. Runs on gsap's ticker
    // since these DOM nodes are outside the R3F canvas and can't use
    // useFrame.
    const updateOverlays = () => {
      const totalZ = (scrollState.scrollProgress || 0) * CAMERA_PATH_LENGTH;
      SWORDS.forEach((_, i) => {
        const isLeft = i % 2 === 0;
        const localT = totalZ / 30 - i;
        let opacity, x, y;
        if (localT <= 0) {
          opacity = 0;
          x = isLeft ? -40 : 40;
          y = 0;
        } else if (localT < 0.4) {
          const p = localT / 0.4;
          opacity = p;
          x = (isLeft ? -40 : 40) * (1 - p);
          y = 0;
        } else if (localT < 0.7) {
          opacity = 1;
          x = 0;
          y = 0;
        } else if (localT < 1) {
          const p = (localT - 0.7) / 0.3;
          opacity = 1 - p;
          x = (isLeft ? 30 : -30) * p;
          y = -24 * p;
        } else {
          opacity = 0;
          x = isLeft ? 30 : -30;
          y = -24;
        }
        gsap.set(`#sword-overlay-${i}`, { opacity, x, y });
      });
    };

    gsap.ticker.add(updateOverlays);
    ScrollTrigger.refresh();
    return () => {
      gsap.ticker.remove(updateOverlays);
      ScrollTrigger.killAll();
    };
  }, []);

  const nextIndex = Math.min(currentIndex + 1, SWORDS.length - 1);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
      }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      }}
    >
      <fog attach="fog" args={["#050a14", 10, 30]} />

      <CameraRig
        onSwordChange={handleSwordChange}
        onPhaseChange={handlePhaseChange}
      />

      <ambientLight intensity={0.18} color="#0a1020" />
      <pointLight position={[0, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-8, -4, 3]} intensity={1.0} color="#334488" />
      <pointLight position={[8, -4, 3]} intensity={0.8} color="#220033" />

      <ElementLight />
      <RimLight />
      <FollowLight />

      <Smoke />

      <Suspense fallback={null}>
        <SwordModel key={`sword-${currentIndex}`} swordIndex={currentIndex} />
        {showNext && currentIndex !== nextIndex && (
          <SwordModel key={`sword-${nextIndex}`} swordIndex={nextIndex} />
        )}
      </Suspense>

      <Environment preset="night" />
    </Canvas>
  );
}

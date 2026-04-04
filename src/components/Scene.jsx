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
// Per sword — 4 strict phases, camera X always returns to 0 before pass:
//
//  APPROACH  0.00 → 0.40  Straight forward on Z=0 axis toward sword
//  ORBIT     0.40 → 0.65  Pivot right around sword, camera X goes positive
//  REALIGN   0.65 → 0.80  Camera X returns to 0, still looking at sword
//  PASS      0.80 → 1.00  Straight forward on Z=0 axis through sword, close
//
// Next sword only becomes visible after PASS phase starts (localT > 0.80)

function CameraRig({ onSwordChange, onPhaseChange }) {
  const smoothPos = useRef(new THREE.Vector3(0, 0, 5));
  const smoothLook = useRef(new THREE.Vector3(0, 0, -8));
  const lastIndex = useRef(-1);

  useFrame(({ camera }) => {
    const raw = scrollState.scrollProgress || 0;
    const totalZ = raw * CAMERA_PATH_LENGTH;

    const swordIndex = Math.min(Math.floor(totalZ / 30), SWORDS.length - 1);
    const localZ = totalZ - swordIndex * 30;
    const localT = Math.min(localZ / 30, 1);

    if (swordIndex !== lastIndex.current) {
      lastIndex.current = swordIndex;
      scrollState.currentSwordIndex = swordIndex;
      scrollState.elementColorHex = ELEMENT_COLORS[SWORDS[swordIndex].element];
      onSwordChange(swordIndex, localT);
    }

    // Also fire phase updates every frame so visibility updates correctly
    onPhaseChange(swordIndex, localT);

    const sword = SWORD_POSITIONS[swordIndex];
    const sz = sword.z; // sword world Z

    // Camera Z positions:
    const approachStartZ =
      swordIndex === 0 ? 5 : SWORD_POSITIONS[swordIndex - 1].z - 6; // just past previous sword
    const sweetSpotZ = sz + 5; // sweet spot: 5 units in front of sword
    const passEndZ = sz - 6; // well past the sword

    // Orbit parameters
    const orbitRadius = 5;
    const orbitMaxAngle = Math.PI / 2; // 90 degrees right

    let targetPos = new THREE.Vector3();
    let targetLook = new THREE.Vector3();

    if (localT < 0.4) {
      // ── APPROACH: straight in on X=0 ──────────────────────────────────────
      const t = easeInOut(localT / 0.4);
      targetPos.set(0, 0, approachStartZ + (sweetSpotZ - approachStartZ) * t);
      targetLook.set(0, 0, sz);
    } else if (localT < 0.65) {
      // ── ORBIT: camera pivots right, X goes from 0 to +radius ──────────────
      const t = easeInOut((localT - 0.4) / 0.25);
      const angle = t * orbitMaxAngle;
      const cx = Math.sin(angle) * orbitRadius;
      const cz = sz + Math.cos(angle) * orbitRadius;

      targetPos.set(cx, 0, cz);
      targetLook.set(0, 0, sz); // always look at sword center X=0
    } else if (localT < 0.8) {
      // ── REALIGN: bring X back to 0 cleanly before pass ────────────────────
      // At end of orbit: camera is at (orbitRadius, 0, sz) — full 90 degrees
      const t = easeInOut((localT - 0.65) / 0.15);
      const startX = Math.sin(orbitMaxAngle) * orbitRadius; // = orbitRadius
      const startZ = sz + Math.cos(orbitMaxAngle) * orbitRadius; // = sz + 0 = sz

      // Move X from orbitRadius back to 0
      // Move Z from sz forward to sweetSpotZ (reset approach position)
      targetPos.set(
        startX * (1 - t), // X: orbitRadius → 0
        0,
        startZ + (sweetSpotZ - startZ) * t, // Z: sz → sweetSpotZ
      );
      targetLook.set(0, 0, sz);
    } else {
      // ── PASS: straight forward on X=0, sword rushes past very close ───────
      const t = easeInOut((localT - 0.8) / 0.2);
      targetPos.set(
        0, // dead center, no X offset
        0,
        sweetSpotZ + (passEndZ - sweetSpotZ) * t,
      );
      // Look straight ahead down the path
      targetLook.set(0, 0, sz - 20);
    }

    smoothPos.current.lerp(targetPos, 0.055);
    smoothLook.current.lerp(targetLook, 0.055);

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
  // Only ever show current sword.
  // Next sword only appears once current is in PASS phase (localT > 0.80)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNext, setShowNext] = useState(false);

  const handleSwordChange = (index) => {
    setCurrentIndex(index);
    setShowNext(false);
  };

  const handlePhaseChange = (index, localT) => {
    // Show next sword only once we're in PASS phase
    // This way next sword is never visible during orbit
    const inPass = localT >= 0.8;
    setShowNext(inPass && index < SWORDS.length - 1);
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.8,
      onUpdate: (self) => {
        scrollState.scrollProgress = self.progress;
        scrollState.heroMode = self.progress < 0.02;
      },
    });

    SWORDS.forEach((_, i) => {
      const isLeft = i % 2 === 0;
      gsap
        .timeline({
          scrollTrigger: {
            trigger: `#sword-section-${i}`,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        })
        .fromTo(
          `#sword-overlay-${i}`,
          { opacity: 0, x: isLeft ? -40 : 40 },
          { opacity: 1, x: 0, duration: 0.3, ease: "none" },
        )
        .to(`#sword-overlay-${i}`, { opacity: 1, duration: 0.4 })
        .to(`#sword-overlay-${i}`, {
          opacity: 0,
          x: isLeft ? 30 : -30,
          duration: 0.3,
          ease: "none",
        });
    });

    ScrollTrigger.refresh();
    return () => ScrollTrigger.killAll();
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
      {/* Fog: starts fading at 10, fully hidden at 30 */}
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
        {/* Current sword — always visible */}
        <SwordModel key={`sword-${currentIndex}`} swordIndex={currentIndex} />

        {/* Next sword — only visible once current is in PASS phase */}
        {showNext && (
          <SwordModel key={`sword-${nextIndex}`} swordIndex={nextIndex} />
        )}
      </Suspense>

      <Environment preset="night" />
    </Canvas>
  );
}

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
// Phases per sword (localT 0→1 over 30 Z-units):
//
//  APPROACH  0.00 → 0.45  Straight forward on X=0 toward sword sweet spot
//  ORBIT     0.45 → 0.70  Pivot right around sword
//  PASS      0.70 → 1.00  Camera snaps back to X=0 and blasts straight through
//
// CRITICAL: No React setState inside here. Only writes to scrollState plain obj.
// Sword visibility is handled purely by fog — swords outside fog range are
// invisible naturally. No mount/unmount tricks.

function CameraRig({ onIndexChange }) {
  const smoothPos = useRef(new THREE.Vector3(0, 0, 5));
  const smoothLook = useRef(new THREE.Vector3(0, 0, -5));
  const lastIndex = useRef(-1);
  // Store raw target each frame — lerp smoothly toward it
  const rawPos = useRef(new THREE.Vector3(0, 0, 5));
  const rawLook = useRef(new THREE.Vector3(0, 0, -5));

  useFrame(({ camera }) => {
    const progress = scrollState.scrollProgress || 0;
    const totalZ = progress * CAMERA_PATH_LENGTH;

    // Which sword are we in, and how far through it (0→1)
    const si = Math.min(Math.floor(totalZ / 30), SWORDS.length - 1);
    const localT = Math.min((totalZ - si * 30) / 30, 1);

    // Update index — but only write to plain scrollState, never setState here
    if (si !== lastIndex.current) {
      lastIndex.current = si;
      scrollState.currentSwordIndex = si;
      scrollState.elementColorHex = ELEMENT_COLORS[SWORDS[si].element];
      // This is the ONLY setState call — once per sword switch, not per frame
      onIndexChange(si);
    }

    const swordZ = SWORD_POSITIONS[si].z;
    const sweetSpot = swordZ + 5; // 5 units in front of sword
    const prevZ = si === 0 ? 5 : SWORD_POSITIONS[si - 1].z - 5;
    const orbitR = 5;

    if (localT < 0.45) {
      // ── APPROACH ────────────────────────────────────────────────────────────
      const t = easeInOut(localT / 0.45);
      rawPos.current.set(0, 0, prevZ + (sweetSpot - prevZ) * t);
      rawLook.current.set(0, 0, swordZ);
    } else if (localT < 0.7) {
      // ── ORBIT ───────────────────────────────────────────────────────────────
      const t = easeInOut((localT - 0.45) / 0.25);
      const angle = t * (Math.PI / 2);
      rawPos.current.set(
        Math.sin(angle) * orbitR,
        0,
        swordZ + Math.cos(angle) * orbitR,
      );
      rawLook.current.set(0, 0, swordZ);
    } else {
      // ── PASS ────────────────────────────────────────────────────────────────
      // Orbit ended with camera at angle PI/2:
      //   pos = (orbitR, 0, swordZ)  i.e. directly to the right of sword
      // We need to go from there to straight ahead on X=0 cleanly.
      //
      // Split pass into two micro-phases:
      //   0.70 → 0.78  Snap X back to 0 while holding Z near sword
      //   0.78 → 1.00  Blast straight forward through sword on X=0
      //
      // By splitting we avoid the backwards jerk — X correction is fast and
      // invisible because it happens while sword is close/large (filling screen)
      const passT = (localT - 0.7) / 0.3; // 0→1 within pass

      if (passT < 0.27) {
        // Micro phase 1: X correction
        const t2 = easeInOut(passT / 0.27);
        rawPos.current.set(
          orbitR * (1 - t2), // X: orbitR → 0
          0,
          swordZ, // Z holds steady at sword level
        );
        rawLook.current.set(0, 0, swordZ - 3);
      } else {
        // Micro phase 2: blast through
        const t2 = easeInOut((passT - 0.27) / 0.73);
        const endZ = swordZ - 8;
        rawPos.current.set(
          0, // X=0, dead center
          0,
          swordZ + (endZ - swordZ) * t2, // Z: sword level → past sword
        );
        rawLook.current.set(0, 0, swordZ - 20);
      }
    }

    // Smooth lerp — keeps motion cinematic
    // Use tighter lerp on pos so it feels responsive, looser on look
    smoothPos.current.lerp(rawPos.current, 0.06);
    smoothLook.current.lerp(rawLook.current, 0.04);

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
  // React state only — which pair of swords to keep mounted
  // We always keep current + next mounted.
  // Fog handles visibility — swords too far away are naturally hidden.
  // No per-frame setState. This only fires once per sword change.
  const [mountedPair, setMountedPair] = useState([0, 1]);

  const handleIndexChange = (index) => {
    const next = Math.min(index + 1, SWORDS.length - 1);
    setMountedPair([index, next]);
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 2,
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
      {/* Fog naturally hides next sword until camera is close enough.
          Near: 12 — fog starts. Far: 28 — fully hidden.
          Next sword at z = swordZ - 30 is 30+ units away = invisible in fog. */}
      <fog attach="fog" args={["#050a14", 12, 28]} />

      <CameraRig onIndexChange={handleIndexChange} />

      <ambientLight intensity={0.18} color="#0a1020" />
      <pointLight position={[0, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-8, -4, 3]} intensity={1.0} color="#334488" />
      <pointLight position={[8, -4, 3]} intensity={0.8} color="#220033" />

      <ElementLight />
      <RimLight />
      <FollowLight />

      <Smoke />

      <Suspense fallback={null}>
        {/* Always mount current + next pair.
            Fog hides next until we're close enough.
            key ensures each sword gets fresh drag state on mount. */}
        {mountedPair.map((i) => (
          <SwordModel key={`s-${i}`} swordIndex={i} />
        ))}
      </Suspense>

      <Environment preset="night" />
    </Canvas>
  );
}

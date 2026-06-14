import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ELEMENT_COLORS } from "../data/swords";
import Smoke from "./Smoke";

// Loads + normalizes the GLB the same way SingleSword does on the homepage,
// then adds its own auto-rotate + drag-to-tilt (window-level, same feel as
// SwordModel, but ignores clicks on links/buttons so page nav still works).
function ViewerSword({ file }) {
  const { scene } = useGLTF(`/models/${file}`);
  const groupRef = useRef();
  const dragOffset = useRef({ x: 0, y: 0 });
  const smoothDrag = useRef({ x: 0, y: 0 });

  const { cloned, scale, offset } = useMemo(() => {
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 2.5 / maxDim : 1;
    const offset = new THREE.Vector3(
      -center.x * s,
      -center.y * s,
      -center.z * s,
    );
    return { cloned, scale: s, offset };
  }, [scene]);

  useEffect(() => {
    let dragging = false;
    let prev = { x: 0, y: 0 };

    const start = (e) => {
      if (e.target.closest?.("a, button")) return;
      dragging = true;
      prev = { x: e.clientX, y: e.clientY };
    };
    const move = (e) => {
      if (!dragging) return;
      dragOffset.current.y += (e.clientX - prev.x) * 0.013;
      dragOffset.current.x += (e.clientY - prev.y) * 0.013;
      dragOffset.current.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, dragOffset.current.x),
      );
      prev = { x: e.clientX, y: e.clientY };
    };
    const end = () => {
      dragging = false;
    };

    window.addEventListener("pointerdown", start);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    smoothDrag.current.x +=
      (dragOffset.current.x - smoothDrag.current.x) * 0.08;
    smoothDrag.current.y +=
      (dragOffset.current.y - smoothDrag.current.y) * 0.08;
    groupRef.current.rotation.y = t * 0.18 + smoothDrag.current.y;
    groupRef.current.rotation.x = smoothDrag.current.x;
  });

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      <group scale={scale} position={offset}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

// Lights, halo glow, and smoke — all tinted to the sword's element and
// scaled by its `glow` value. Smoke is the exact component the homepage uses.
function ViewerScene({ sword }) {
  const accent = ELEMENT_COLORS[sword.element];
  const glow = sword.glow;
  const haloTex = useTexture("/smoke.png");

  return (
    <>
      <ambientLight intensity={glow < 0.15 ? 0.45 : 0.22} color="#3a5571" />
      <directionalLight
        color={accent}
        intensity={0.3 + glow * 0.5}
        position={[-3, 2, 2]}
      />
      <pointLight
        color={accent}
        intensity={1.5 * glow + 0.3}
        distance={10}
        decay={2}
        position={[0, 1, 1.4]}
      />

      <sprite
        position={[0, 0.2, -0.6]}
        scale={[3 + glow * 4, 3.6 + glow * 5, 1]}
      >
        <spriteMaterial
          map={haloTex}
          color={accent}
          transparent
          opacity={0.35 * glow + 0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <Smoke />
      <ViewerSword file={sword.file} />
    </>
  );
}

// transparent=true is for the thumbnail generator (renders onto an
// alpha background so it composites onto the collection cards).
export default function SwordViewer({ sword, transparent = false }) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 4.6], fov: 36, near: 0.1, far: 60 }}
      gl={{ alpha: transparent, antialias: true, preserveDrawingBuffer: true }}
      dpr={[1, 2]}
    >
      {!transparent && <color attach="background" args={["#050a14"]} />}
      <fog attach="fog" args={["#050a14", 5, 13]} />
      <Suspense fallback={null}>
        <ViewerScene sword={sword} />
      </Suspense>
    </Canvas>
  );
}

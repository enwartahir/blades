import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SWORDS, SWORD_POSITIONS } from "../data/swords";

// Each sword has its own completely isolated drag state.
// dragOffset is per-instance — never shared between swords.
// When a new sword mounts (key=swordIndex) it always starts fresh: rotation 0.

function SingleSword({ file }) {
  const { scene } = useGLTF(`/models/${file}`);

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

  return (
    <group scale={scale} position={offset}>
      <primitive object={cloned} />
    </group>
  );
}

export default function SwordModel({ swordIndex }) {
  const sword = SWORDS[swordIndex];
  const worldPos = SWORD_POSITIONS[swordIndex];
  const groupRef = useRef();

  // ── Per-sword isolated drag state ──────────────────────────────────────────
  // These refs are created fresh every time this component mounts.
  // Since key=swordIndex, each sword gets its own mount — own drag state.
  // A sword that the user tilted will stay tilted in its world position,
  // but the NEXT sword mounts fresh with rotation 0.
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 }); // target rotation
  const smoothDrag = useRef({ x: 0, y: 0 }); // interpolated rotation

  useEffect(() => {
    const onDown = (e) => {
      isDragging.current = true;
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e) => {
      if (!isDragging.current) return;
      dragOffset.current.y += (e.clientX - prevMouse.current.x) * 0.013;
      dragOffset.current.x += (e.clientY - prevMouse.current.y) * 0.013;
      dragOffset.current.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, dragOffset.current.x),
      );
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      isDragging.current = false;
    };
    const onTouchStart = (e) => {
      isDragging.current = true;
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchMove = (e) => {
      if (!isDragging.current) return;
      dragOffset.current.y +=
        (e.touches[0].clientX - prevMouse.current.x) * 0.013;
      dragOffset.current.x +=
        (e.touches[0].clientY - prevMouse.current.y) * 0.013;
      dragOffset.current.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, dragOffset.current.x),
      );
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onTouchEnd = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Smooth drag interpolation
    smoothDrag.current.x +=
      (dragOffset.current.x - smoothDrag.current.x) * 0.08;
    smoothDrag.current.y +=
      (dragOffset.current.y - smoothDrag.current.y) * 0.08;

    // Auto-rotate slowly + user drag on top
    groupRef.current.rotation.y = t * 0.22 + smoothDrag.current.y;
    groupRef.current.rotation.x = smoothDrag.current.x;

    // Gentle float — offset by swordIndex so swords don't all bob in sync
    groupRef.current.position.y =
      worldPos.y + Math.sin(t * 0.7 + swordIndex * 1.3) * 0.15;
  });

  return (
    <group ref={groupRef} position={[worldPos.x, worldPos.y, worldPos.z]}>
      <SingleSword file={sword.file} />
    </group>
  );
}

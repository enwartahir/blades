import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Jellyfish({ position = [0, 0, 0], scale = 1 }) {
  const groupRef = useRef();
  const tentaclesRef = useRef([]);

  // Animate the jellyfish
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle floating
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.3;
      // Pulsing scale (breathing effect)
      const pulse = 1 + Math.sin(t * 2) * 0.05;
      groupRef.current.scale.set(scale * pulse, scale * pulse, scale * pulse);
    }
    // Animate tentacles
    tentaclesRef.current.forEach((t_ref, i) => {
      if (t_ref) {
        t_ref.rotation.x = Math.sin(t * 1.5 + i * 0.5) * 0.3;
        t_ref.rotation.z = Math.cos(t * 1.2 + i * 0.7) * 0.2;
      }
    });
  });

  const tentaclePositions = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return [Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3];
    });
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {/* Bell / dome */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#88ccff"
          emissive="#0044ff"
          emissiveIntensity={0.4}
          transparent
          opacity={0.5}
          roughness={0}
          transmission={0.8}
          thickness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner glow dome */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.45, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#aaddff"
          emissive="#00aaff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.3}
          roughness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tentacles */}
      {tentaclePositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => (tentaclesRef.current[i] = el)}
          position={pos}
        >
          <cylinderGeometry args={[0.015, 0.005, 1.5, 4]} />
          <meshPhysicalMaterial
            color="#aaddff"
            emissive="#0066ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* Center trailing tentacle */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.005, 2, 6]} />
        <meshPhysicalMaterial
          color="#cceeff"
          emissive="#00aaff"
          emissiveIntensity={0.6}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

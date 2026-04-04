import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Ocean() {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const shader = {
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#001830") },
      uColorB: { value: new THREE.Color("#006994") },
    },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float elevation = sin(pos.x * 2.0 + uTime * 0.5) * 0.1
                        + sin(pos.y * 3.0 + uTime * 0.3) * 0.05;
        pos.z += elevation;
        vElevation = elevation;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uTime;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        float mixStrength = (vElevation + 0.1) * 5.0;
        vec3 color = mix(uColorA, uColorB, mixStrength);
        // Add shimmer
        float shimmer = sin(vUv.x * 20.0 + uTime) * sin(vUv.y * 20.0 + uTime * 0.7) * 0.05;
        color += shimmer;
        gl_FragColor = vec4(color, 0.6);
      }
    `,
  };

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[30, 30, 64, 64]} />
      <shaderMaterial args={[shader]} transparent side={2} />
    </mesh>
  );
}

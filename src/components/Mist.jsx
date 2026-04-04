import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function Mist() {
  const { mouse } = useThree();
  const meshRefs = useRef([]);
  const mouseVelocity = useRef(new THREE.Vector2(0, 0));
  const lastMouse = useRef(new THREE.Vector2(0, 0));

  const layers = useMemo(
    () => [
      { y: -1.2, speed: 0.08, scale: 6, opacity: 0.18 },
      { y: -0.6, speed: 0.05, scale: 5, opacity: 0.14 },
      { y: 0.0, speed: 0.12, scale: 7, opacity: 0.1 },
      { y: 0.6, speed: 0.06, scale: 5, opacity: 0.08 },
      { y: 1.0, speed: 0.09, scale: 6, opacity: 0.06 },
    ],
    [],
  );

  const shader = useMemo(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseVelocity: { value: new THREE.Vector2(0, 0) },
        uOpacity: { value: 0.15 },
        uSpeed: { value: 0.08 },
        uScale: { value: 5.0 },
      },
      vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uMouseVelocity;
      uniform float uOpacity;
      uniform float uSpeed;
      uniform float uScale;
      varying vec2 vUv;

      // 2D noise
      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(dot(hash2(i + vec2(0,0)), f - vec2(0,0)),
              dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
          mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
              dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y
        );
      }

      float fbm(vec2 p) {
        float val = 0.0;
        float amp = 0.5;
        float freq = 1.0;
        for (int i = 0; i < 4; i++) {
          val += amp * noise(p * freq);
          freq *= 2.0;
          amp *= 0.5;
        }
        return val;
      }

      void main() {
        vec2 uv = vUv - 0.5;

        // Mouse distortion
        vec2 mouseOffset = uMouse * 0.5;
        float mouseDist = length(uv - mouseOffset);
        float mouseStrength = smoothstep(0.4, 0.0, mouseDist);

        // Swirl distortion from mouse velocity
        vec2 swirl = vec2(
          -uMouseVelocity.y,
           uMouseVelocity.x
        ) * mouseStrength * 0.3;

        vec2 distortedUv = uv + swirl;

        // Animated mist
        float t = uTime * uSpeed;
        vec2 p = distortedUv * uScale;

        float mist = fbm(p + vec2(t, t * 0.7));
        mist += fbm(p * 1.5 - vec2(t * 0.8, t * 0.5)) * 0.5;
        mist = mist * 0.5 + 0.5;

        // Edge fade
        float edgeFade = smoothstep(0.0, 0.3, 0.5 - abs(uv.x));
        edgeFade *= smoothstep(0.0, 0.3, 0.5 - abs(uv.y));

        // Mouse pushes mist away
        float mistHole = 1.0 - mouseStrength * 0.8;

        float alpha = mist * edgeFade * mistHole * uOpacity;

        gl_FragColor = vec4(vec3(0.7, 0.85, 1.0), alpha);
      }
    `,
    }),
    [],
  );

  useFrame(({ clock }) => {
    // Calculate mouse velocity
    mouseVelocity.current.set(
      mouse.x - lastMouse.current.x,
      mouse.y - lastMouse.current.y,
    );
    lastMouse.current.set(mouse.x, mouse.y);

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const mat = mesh.material;
      mat.uniforms.uTime.value = clock.getElapsedTime();
      mat.uniforms.uMouse.value.set(mouse.x, mouse.y);
      mat.uniforms.uMouseVelocity.value.lerp(mouseVelocity.current, 0.1);
    });
  });

  return (
    <>
      {layers.map((layer, i) => (
        <mesh
          key={i}
          ref={(el) => (meshRefs.current[i] = el)}
          position={[0, layer.y, 1.5]}
          rotation={[0, 0, 0]}
        >
          <planeGeometry args={[10, 6, 1, 1]} />
          <shaderMaterial
            args={[
              {
                ...shader,
                uniforms: {
                  uTime: { value: 0 },
                  uMouse: { value: new THREE.Vector2(0, 0) },
                  uMouseVelocity: { value: new THREE.Vector2(0, 0) },
                  uOpacity: { value: layer.opacity },
                  uSpeed: { value: layer.speed },
                  uScale: { value: layer.scale },
                },
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader,
              },
            ]}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

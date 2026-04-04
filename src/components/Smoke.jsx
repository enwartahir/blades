import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Three depth layers of mist:
//   bg  — far behind the sword (z: -3 to -6),  large, slightly opaque
//   mid — same plane as sword  (z: -1.5 to 1.5), medium
//   fg  — in front of sword    (z: 1.5 to 3.5),  very transparent, close to camera
//
// Together they create the illusion of volumetric fog surrounding the viewer.

function makeParticle(layer) {
  switch (layer) {
    case 'bg':
      return {
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 10,
          -(Math.random() * 3 + 3),
        ),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.07,
        scale: 5 + Math.random() * 6,
        opacity: 0.025 + Math.random() * 0.055,
        driftX: (Math.random() - 0.5) * 0.0018,
        driftY: Math.random() * 0.003 + 0.0008,
        color: new THREE.Color(0.52, 0.60, 0.72),
        layer,
      }
    case 'mid':
      return {
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 9,
          (Math.random() - 0.5) * 3,
        ),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.11,
        scale: 3 + Math.random() * 4,
        opacity: 0.025 + Math.random() * 0.045,
        driftX: (Math.random() - 0.5) * 0.0015,
        driftY: Math.random() * 0.0022 + 0.0005,
        color: new THREE.Color(0.45, 0.54, 0.68),
        layer,
      }
    case 'fg':
    default:
      return {
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 7,
          1.5 + Math.random() * 2,
        ),
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.055,
        scale: 6 + Math.random() * 7,
        opacity: 0.012 + Math.random() * 0.022,
        driftX: (Math.random() - 0.5) * 0.001,
        driftY: Math.random() * 0.0018 + 0.0004,
        color: new THREE.Color(0.38, 0.48, 0.60),
        layer,
      }
  }
}

export default function Smoke() {
  const texture = useTexture('/smoke.png')
  const { mouse } = useThree()
  const meshRefs = useRef([])
  const lastMouse = useRef(new THREE.Vector2(0, 0))

  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < 40; i++) arr.push(makeParticle('bg'))
    for (let i = 0; i < 50; i++) arr.push(makeParticle('mid'))
    for (let i = 0; i < 30; i++) arr.push(makeParticle('fg'))
    return arr
  }, [])

  useFrame(() => {
    const mx = mouse.x * 4
    const my = mouse.y * 3
    const mvx = (mouse.x - lastMouse.current.x) * 10
    const mvy = (mouse.y - lastMouse.current.y) * 10
    lastMouse.current.set(mouse.x, mouse.y)

    const REPULSE = 2.2
    const WRAP_X = 8
    const WRAP_Y = 5.5

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const p = particles[i]

      // Slow rotation
      mesh.rotation.z += 0.016 * p.rotSpeed

      // Upward drift + gentle horizontal wander
      p.pos.y += p.driftY
      p.pos.x += p.driftX

      // Vertical wrap — creates the illusion of infinite rising mist
      if (p.pos.y > WRAP_Y) {
        p.pos.y = -WRAP_Y
        p.pos.x = (Math.random() - 0.5) * 12
      }
      // Horizontal wrap
      if (p.pos.x > WRAP_X) p.pos.x = -WRAP_X
      if (p.pos.x < -WRAP_X) p.pos.x = WRAP_X

      // Mouse repulsion — mist parts around the cursor
      const dx = mesh.position.x - mx
      const dy = mesh.position.y - my
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < REPULSE && dist > 0.01) {
        const inv = 1 / dist
        const force = (REPULSE - dist) / REPULSE
        p.pos.x += dx * inv * force * 0.07
        p.pos.y += dy * inv * force * 0.07
        // Carry some mouse velocity into the particle
        p.pos.x += mvx * force * 0.018
        p.pos.y += mvy * force * 0.018
      }

      // Soft pull back toward home position (restoring force)
      mesh.position.x += (p.pos.x - mesh.position.x) * 0.012
      mesh.position.y += (p.pos.y - mesh.position.y) * 0.012
      // Z stays fixed — no Z drift (maintains depth illusion)
      mesh.position.z = p.pos.z
    })
  })

  return (
    <>
      {particles.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => (meshRefs.current[i] = el)}
          position={[p.pos.x, p.pos.y, p.pos.z]}
          rotation={[0, 0, p.rotation]}
          scale={p.scale}
        >
          <planeGeometry args={[1, 1]} />
          <meshLambertMaterial
            map={texture}
            color={p.color}
            opacity={p.opacity}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  )
}

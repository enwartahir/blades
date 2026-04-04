import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SwordModel from './SwordModel'
import Smoke from './Smoke'
import { SWORDS, ELEMENT_COLORS, SWORD_CAMERA_POSITIONS } from '../data/swords'
import { scrollState } from '../store/scrollState'

// ─── Allocated once — avoids per-frame heap allocation ───────────────────────
const _camVec = new THREE.Vector3()
const _color  = new THREE.Color()

// ─── Camera smoothly follows scrollState.cameraTarget every frame ────────────
function CameraRig() {
  useFrame(({ camera }) => {
    _camVec.set(
      scrollState.cameraTarget.x,
      scrollState.cameraTarget.y,
      scrollState.cameraTarget.z,
    )
    camera.position.lerp(_camVec, 0.04)
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ─── Point light that lerpss to the current element's color ──────────────────
function ElementLight() {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    _color.set(scrollState.elementColorHex)
    ref.current.color.lerp(_color, 0.05)
  })
  return <pointLight ref={ref} position={[0, 0, 2]} intensity={3} color="#334488" />
}

// ─── Rim/spot light also follows element color ────────────────────────────────
function RimLight() {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    _color.set(scrollState.elementColorHex)
    ref.current.color.lerp(_color, 0.05)
  })
  return (
    <spotLight
      ref={ref}
      position={[0, -5, 2]}
      angle={0.5}
      penumbra={1}
      intensity={4}
      color="#334488"
    />
  )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────
export default function Scene() {
  // React state — only changes on sword switch (forces SingleSword remount)
  const [displayIndex, setDisplayIndex] = useState(7) // Mistsplitter for hero

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // ── Hero section ─────────────────────────────────────────────────────────
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      onLeave: () => {
        scrollState.heroMode = false
        // Trigger Bakufu (section 0) to start entering the mist
        scrollState.requestedSwordIndex = 0
      },
      onEnterBack: () => {
        scrollState.heroMode    = true
        scrollState.cameraTarget     = { x: 0, y: 0, z: 5 }
        scrollState.elementColorHex  = '#334488'
        scrollState.requestedSwordIndex = 7   // back to Mistsplitter
      },
    })

    // ── Sword sections ───────────────────────────────────────────────────────
    SWORDS.forEach((sword, i) => {
      const camPos = SWORD_CAMERA_POSITIONS[i + 1]
      const isLeft = i % 2 === 0

      // Camera target + scroll state update (scrub — maps directly to scroll pos)
      ScrollTrigger.create({
        trigger: `#sword-section-${i}`,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onEnter: () => {
          scrollState.heroMode = false
          scrollState.requestedSwordIndex = i
        },
        onEnterBack: () => {
          scrollState.requestedSwordIndex = i
        },
        onUpdate: (self) => {
          scrollState.sectionProgress = self.progress
          scrollState.cameraTarget    = camPos
          scrollState.elementColorHex = ELEMENT_COLORS[sword.element]
          scrollState.currentSwordIndex = i
        },
      })

      // Text overlay: fade in → hold → fade out across the full section scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: `#sword-section-${i}`,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
      tl.fromTo(
        `#sword-overlay-${i}`,
        { opacity: 0, x: isLeft ? -55 : 55 },
        { opacity: 1, x: 0, duration: 0.28, ease: 'none' },
      )
        .to(`#sword-overlay-${i}`, { opacity: 1, duration: 0.44 })
        .to(`#sword-overlay-${i}`, {
          opacity: 0,
          x: isLeft ? 35 : -35,
          duration: 0.28,
          ease: 'none',
        })
    })

    // ── Outro ─────────────────────────────────────────────────────────────────
    ScrollTrigger.create({
      trigger: '#outro',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: () => {
        scrollState.cameraTarget = { x: 0, y: 2, z: 8 }
      },
    })

    ScrollTrigger.refresh()

    return () => ScrollTrigger.killAll()
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: 0,
      }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      }}
    >
      {/* Atmospheric fog: objects past distance 7 start fading,
          fully hidden at distance 20. The sword travels to z=-16 on exit
          (distance ~21 from camera), so it vanishes completely into the mist. */}
      <fog attach="fog" args={['#050a14', 7, 20]} />

      <CameraRig />

      {/* Base scene lighting */}
      <ambientLight intensity={0.18} color="#0a1020" />
      <pointLight position={[0, 10, 5]}   intensity={1.5} color="#ffffff" />
      <pointLight position={[-8, -4, 3]}  intensity={1.0} color="#334488" />
      <pointLight position={[8, -4, 3]}   intensity={0.8} color="#220033" />

      {/* Dynamic element lighting — color follows the active sword's element */}
      <ElementLight />
      <RimLight />

      {/* Mist system — 120 particles across 3 depth layers */}
      <Smoke />

      {/* The sword — Suspense keeps the outer UI live while the GLB loads */}
      <Suspense fallback={null}>
        <SwordModel
          displayIndex={displayIndex}
          onRequestSwitch={setDisplayIndex}
        />
      </Suspense>

      <Environment preset="night" />
    </Canvas>
  )
}

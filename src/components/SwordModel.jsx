import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SWORDS } from '../data/swords'
import { scrollState } from '../store/scrollState'

// ─── helpers ──────────────────────────────────────────────────────────────────
function mapRange(v, inMin, inMax, outMin, outMax) {
  const t = Math.max(0, Math.min(1, (v - inMin) / (inMax - inMin)))
  return outMin + t * (outMax - outMin)
}

// ─── Single sword GLB ─────────────────────────────────────────────────────────
function SingleSword({ file }) {
  const { scene } = useGLTF(`/models/${file}`)

  const { cloned, scale, position } = useMemo(() => {
    const cloned = scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const s = maxDim > 0 ? 2.5 / maxDim : 1
    const pos = new THREE.Vector3(-center.x * s, -center.y * s, -center.z * s)
    return { cloned, scale: s, position: pos }
  }, [scene])

  return (
    <group scale={scale} position={position}>
      <primitive object={cloned} />
    </group>
  )
}

// ─── Sword Model ──────────────────────────────────────────────────────────────
// Transition phases:
//   entering  — sword travels from mist (z=-16) toward camera (z=0)
//   showcase  — sword is at z=0, scroll drives slow rotation + float
//   exiting   — sword retreats back into mist (z=-16) before a swap
export default function SwordModel({ displayIndex, onRequestSwitch }) {
  const groupRef = useRef()

  // Transition state — all refs, never React state (no re-renders inside r3f loop)
  const phase        = useRef('entering')
  const swordZ       = useRef(-16)       // current world-space Z offset of the sword
  const switchCalled = useRef(false)     // guard against calling onRequestSwitch twice

  // Drag / rotation offsets
  const isDragging  = useRef(false)
  const prevMouse   = useRef({ x: 0, y: 0 })
  const dragOffset  = useRef({ x: 0, y: 0 })
  const smoothDrag  = useRef({ x: 0, y: 0 })

  // When displayIndex changes, reset to entering from the mist
  useEffect(() => {
    swordZ.current       = -16
    phase.current        = 'entering'
    switchCalled.current = false
    dragOffset.current   = { x: 0, y: 0 }
    smoothDrag.current   = { x: 0, y: 0 }
  }, [displayIndex])

  // ── Mouse / touch drag ──────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e) => {
      isDragging.current = true
      prevMouse.current = { x: e.clientX, y: e.clientY }
    }
    const move = (e) => {
      if (!isDragging.current) return
      const dx = e.clientX - prevMouse.current.x
      const dy = e.clientY - prevMouse.current.y
      dragOffset.current.y += dx * 0.013
      dragOffset.current.x += dy * 0.013
      dragOffset.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, dragOffset.current.x))
      prevMouse.current = { x: e.clientX, y: e.clientY }
    }
    const up = () => { isDragging.current = false }

    const tstart = (e) => {
      isDragging.current = true
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const tmove = (e) => {
      if (!isDragging.current) return
      const dx = e.touches[0].clientX - prevMouse.current.x
      const dy = e.touches[0].clientY - prevMouse.current.y
      dragOffset.current.y += dx * 0.013
      dragOffset.current.x += dy * 0.013
      dragOffset.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, dragOffset.current.x))
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const tend = () => { isDragging.current = false }

    window.addEventListener('mousedown', down)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchstart', tstart, { passive: true })
    window.addEventListener('touchmove', tmove, { passive: true })
    window.addEventListener('touchend', tend)

    return () => {
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchstart', tstart)
      window.removeEventListener('touchmove', tmove)
      window.removeEventListener('touchend', tend)
    }
  }, [])

  // ── Per-frame animation ─────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    const p = scrollState.sectionProgress
    const requested = scrollState.requestedSwordIndex

    // ── Phase machine ────────────────────────────────────────────────────────

    // Any phase: if a different sword is requested, start exiting
    if (phase.current !== 'exiting' && requested !== displayIndex) {
      phase.current = 'exiting'
    }

    if (phase.current === 'exiting') {
      // If the request was cancelled (user scrolled back), come back in
      if (requested === displayIndex) {
        phase.current = 'entering'
        switchCalled.current = false
      } else {
        // Lerp Z away from camera into the mist
        swordZ.current += (-16 - swordZ.current) * 0.048

        // Once deep enough in the fog, swap the sword
        if (swordZ.current < -13.5 && !switchCalled.current) {
          switchCalled.current = true
          onRequestSwitch(requested)
          // useEffect[displayIndex] will reset swordZ to -16 and phase to 'entering'
        }
      }
    }

    if (phase.current === 'entering') {
      // Sword approaches from the mist toward showcase position
      swordZ.current += (0 - swordZ.current) * 0.042

      if (swordZ.current > -0.25) {
        swordZ.current = 0
        phase.current = 'showcase'
      }
    }

    // ── Position ─────────────────────────────────────────────────────────────

    groupRef.current.position.z = swordZ.current

    // Floating vertical oscillation (alive feel)
    groupRef.current.position.y = Math.sin(t * 0.65) * 0.14

    // Subtle horizontal drift
    groupRef.current.position.x = Math.sin(t * 0.22) * 0.06

    // ── Rotation ─────────────────────────────────────────────────────────────

    // Very slow ambient auto-spin (always present)
    const autoY = t * 0.09

    // Scroll-driven rotation: traverses ~1.5π (270°) over the full section
    // This is what gives the "examining the blade" feel as you scroll
    const scrollY = scrollState.heroMode ? 0 : mapRange(p, 0, 1, 0, Math.PI * 1.5)

    // Combined base rotation
    const baseRotY = autoY + scrollY

    // Drag offset decays gently when not dragging
    if (!isDragging.current) {
      dragOffset.current.x *= 0.955
      dragOffset.current.y *= 0.955
    }

    // Smooth the drag offset
    smoothDrag.current.x += (dragOffset.current.x - smoothDrag.current.x) * 0.09
    smoothDrag.current.y += (dragOffset.current.y - smoothDrag.current.y) * 0.09

    groupRef.current.rotation.x = smoothDrag.current.x
    groupRef.current.rotation.y = baseRotY + smoothDrag.current.y

    // ── Scale: swell slightly as sword approaches, adds "arrival" punch ──────
    // 0.06 when at z=-16 (invisible in mist), 1.0 at z=0
    const scaleFactor = Math.max(0.05, mapRange(swordZ.current, -16, -1.5, 0.05, 1.0))
    groupRef.current.scale.setScalar(scaleFactor)
  })

  return (
    <group ref={groupRef} position={[0, 0, -16]}>
      <SingleSword key={displayIndex} file={SWORDS[displayIndex].file} />
    </group>
  )
}

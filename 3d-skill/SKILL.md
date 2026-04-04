---
name: teyvat-blades-3d
description: "Use this skill for ALL work on the Teyvat Blades 3D storytelling website. This is a fully immersive, scroll-driven, WebGL 3D world built with React + Vite + Three.js + React Three Fiber + GSAP. Project is at D:\Websites\3d_websites\ocean-scene. Triggers on ANY request involving: 3D scene work, sword showcase, scroll animations, camera movement, lighting, mist/smoke/particles, navbar, storytelling sections, GSAP ScrollTrigger, shaders, postprocessing, hero section, sword lore pages, performance fixes, WebGL bugs, new visual effects, textures, environment maps, or any code changes to this project. Always read this entire skill before writing a single line of code."
---

# Teyvat Blades — Full 3D Storytelling Website

## The Vision — Read This First

This is NOT a standard website with a 3D element bolted on. This IS a **3D world that happens to contain a website**. The user is transported into a dark, atmospheric realm where legendary swords exist. They move through this world by scrolling. The camera flies, the environment reacts, the swords glow and float. Text appears like subtitles in a cinematic. Every interaction feels like being inside a game.

**References to draw inspiration from:**
- PeachWeb.io — scroll-driven 3D world
- Bruno Simon's portfolio — full 3D world with interactivity
- Awwwards sites with WebGL — dramatic camera reveals

**Tone:** Dark, epic, cinematic. Genshin Impact aesthetic — fantastical, slightly anime, dramatic lighting, mysterious atmosphere.

---

## Project Location & Stack

```
D:\Websites\3d_websites\ocean-scene\
```

**Core stack:**
- Vite + React 18
- Three.js
- @react-three/fiber (R3F) — React renderer for Three.js
- @react-three/drei — helpers and abstractions
- @react-three/postprocessing — Bloom, chromatic aberration, depth of field
- GSAP + ScrollTrigger — scroll-driven animations
- Custom GLSL shaders — for effects not achievable with standard materials

**Install missing deps:**
```bash
npm install gsap @gsap/react
npm install @react-three/postprocessing
npm install meshoptimizer
```

---

## ABSOLUTE CRITICAL RULES — Violating These Crashes Everything

### ❌ NEVER: React StrictMode
`src/main.jsx` must NEVER have `<React.StrictMode>`. It fires useEffect twice → double GPU texture uploads → WebGL Context Lost crash. This is the #1 source of crashes on this project.

```jsx
// src/main.jsx — CORRECT, forever, no exceptions
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
createRoot(document.getElementById('root')).render(<App />)
```

### ❌ NEVER: Load All 10 Swords Simultaneously
Each GLB is 200-700KB with textures. Loading all at once fills GPU VRAM → Context Lost.
Always load ONE sword at a time. Use `key={currentIndex}` to force unmount/remount.

```jsx
// CORRECT
<SingleSword key={currentIndex} file={SWORDS[currentIndex].file} />

// WRONG — never do this
SWORDS.forEach(s => useGLTF.preload(`/models/${s.file}`))
```

### ❌ NEVER: OrbitControls for sword rotation
OrbitControls rotates the ENTIRE scene — camera, smoke, lights, everything moves together. Smoke becomes a solid wall. Use manual window mouse event listeners to rotate only the sword group ref.

### ❌ NEVER: Recalculate Bounding Box After Transform
After cloning and scaling a scene, the bounding box changes. Always compute ONCE with useMemo before any transforms are applied.

```jsx
// CORRECT
const { cloned, scale, pos } = useMemo(() => {
  const cloned = scene.clone(true)
  const box = new THREE.Box3().setFromObject(cloned)
  // compute scale and position offset
  return { cloned, scale, pos }
}, [scene])
```

### ❌ NEVER: EffectComposer with alpha:true
```jsx
// CORRECT Canvas setup — always
<Canvas gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
```

### ❌ NEVER: Write partial code
Every file must be complete. No `// rest of code`, no `// existing code here`, no snippets. Full files only.

---

## Current File Structure

```
ocean-scene/
├── public/
│   ├── models/
│   │   ├── Bakufu_mesh.glb         (~270KB)
│   │   ├── Boreas_mesh.glb         (~350KB)
│   │   ├── Cool_steel_mesh.glb     (~180KB)
│   │   ├── Dull_bladel_mesh.glb    (~140KB)  ← note: 'bladel' typo in filename, keep it
│   │   ├── Freedom_sworn_mesh.glb  (~220KB)
│   │   ├── Katana_mesh.glb         (~660KB)
│   │   ├── Lions_roar_mesh.glb     (~190KB)
│   │   ├── Mistsplitter_mesh.glb   (~270KB)
│   │   ├── Narukami_mesh.glb       (~240KB)
│   │   └── Prototype_mesh.glb      (~440KB)
│   └── smoke.png                   ← smoke sprite for particle system
├── src/
│   ├── components/
│   │   ├── Scene.jsx               ← Canvas, lights, camera, layout
│   │   ├── SwordModel.jsx          ← GLB loading, drag rotation, float
│   │   └── Smoke.jsx               ← Particle smoke, mouse repulsion
│   ├── App.jsx                     ← Suspense wrapper
│   ├── main.jsx                    ← NO StrictMode
│   └── index.css                   ← Global reset, body background
```

---

## Complete Sword Data

```js
const SWORDS = [
  {
    file: 'Bakufu_mesh.glb',
    name: 'Bakufu Shades',
    element: 'Electro',
    rarity: 4,
    lore: 'A style of blade found in Inazuma. Its unique curvature channels the thunder of the Shogun herself, striking with the weight of divine judgment.',
    stats: { atk: 41, substat: 'EM +12' },
  },
  {
    file: 'Boreas_mesh.glb',
    name: 'Boreas',
    element: 'Anemo',
    rarity: 4,
    lore: 'Named after the god of the north wind. Legends say it was forged in a storm that lasted seven days, and the wind never truly left the blade.',
    stats: { atk: 44, substat: 'ATK +6%' },
  },
  {
    file: 'Cool_steel_mesh.glb',
    name: 'Cool Steel',
    element: 'Hydro',
    rarity: 3,
    lore: 'A sword that has seen a hundred battles and remembers every one. Its edge is as cold and clear as a mountain stream.',
    stats: { atk: 39, substat: 'ATK +7.7%' },
  },
  {
    file: 'Dull_bladel_mesh.glb',
    name: 'Dull Blade',
    element: 'None',
    rarity: 1,
    lore: 'Every legend starts somewhere. This is where most of them begin — a battered blade with nothing to prove and everything to earn.',
    stats: { atk: 23, substat: '—' },
  },
  {
    file: 'Freedom_sworn_mesh.glb',
    name: 'Freedom-Sworn',
    element: 'Anemo',
    rarity: 5,
    lore: 'A sword sworn to the forces of freedom and rebellion. It resonates with those who fight not for glory, but for a world without chains.',
    stats: { atk: 46, substat: 'EM +43' },
  },
  {
    file: 'Katana_mesh.glb',
    name: 'Katana',
    element: 'Pyro',
    rarity: 4,
    lore: 'Forged in the tradition of Inazuman swordsmiths who spent their lives perfecting a single stroke. The blade knows only one direction: forward.',
    stats: { atk: 41, substat: 'ATK +12%' },
  },
  {
    file: 'Lions_roar_mesh.glb',
    name: "Lion's Roar",
    element: 'Pyro',
    rarity: 4,
    lore: 'The roar of the lion is a declaration of dominance. Demons flee from its sound. Elemental creatures crumble before it.',
    stats: { atk: 42, substat: 'ATK +9%' },
  },
  {
    file: 'Mistsplitter_mesh.glb',
    name: 'Mistsplitter Reforged',
    element: 'Cryo',
    rarity: 5,
    lore: 'Reforged from the shards of a blade that once cut through the boundary between worlds. Some say it still remembers what lies beyond.',
    stats: { atk: 48, substat: 'CRIT DMG +9.6%' },
  },
  {
    file: 'Narukami_mesh.glb',
    name: 'Narukami',
    element: 'Electro',
    rarity: 5,
    lore: 'Blessed by the Electro Archon herself. Every strike calls down the fury of heaven. Every parry disperses the storm.',
    stats: { atk: 46, substat: 'CRIT Rate +7.2%' },
  },
  {
    file: 'Prototype_mesh.glb',
    name: 'Prototype Rancour',
    element: 'Geo',
    rarity: 4,
    lore: 'An experimental prototype that refused to be tamed. Its raw power terrifies even its wielder. No two strikes land the same way twice.',
    stats: { atk: 44, substat: 'PHYS DMG +7.5%' },
  },
]

const ELEMENT_COLORS = {
  Electro: '#cc88ff',
  Anemo:   '#44ffcc',
  Hydro:   '#44aaff',
  Pyro:    '#ff6633',
  Cryo:    '#aaddff',
  Geo:     '#ffcc44',
  None:    '#888888',
}

const ELEMENT_LIGHT_COLORS = {
  Electro: '#9944ff',
  Anemo:   '#00ffaa',
  Hydro:   '#0088ff',
  Pyro:    '#ff4400',
  Cryo:    '#88ccff',
  Geo:     '#ffaa00',
  None:    '#555555',
}
```

---

## Target Website Architecture — Build This

### Page Layout

The entire experience is a **single HTML page**. The Canvas is `position: fixed`, covers 100vw × 100vh always. The scrollable content is a tall div layered on top with `pointer-events: none` (except interactive elements).

```
Total scroll height: ~1200vh
├── HERO SECTION           (0vh - 100vh)
├── SWORD 1 - Bakufu       (100vh - 220vh)
├── SWORD 2 - Boreas       (220vh - 340vh)
├── SWORD 3 - Cool Steel   (340vh - 460vh)
├── SWORD 4 - Dull Blade   (460vh - 580vh)
├── SWORD 5 - Freedom-Sworn(580vh - 700vh)
├── SWORD 6 - Katana       (700vh - 820vh)
├── SWORD 7 - Lion's Roar  (820vh - 940vh)
├── SWORD 8 - Mistsplitter (940vh - 1060vh)
├── SWORD 9 - Narukami     (1060vh - 1180vh)
├── SWORD 10 - Prototype   (1180vh - 1300vh)
└── OUTRO                  (1300vh - 1400vh)
```

### GSAP ScrollTrigger Integration

```jsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// Scroll container: a div with height = total scroll height
// Canvas: position fixed, behind everything
// On scroll: ScrollTrigger updates camera position, sword visibility,
//            lighting color, text opacity
```

---

## Section-by-Section Build Guide

### SECTION 1: HERO

**3D Elements:**
- All smoke particles active, dense, atmospheric
- One hero sword (Mistsplitter — most dramatic) floating center screen
- Sword slowly rotates and bobs
- Volumetric fog in background (dark blue/purple gradient fog color on scene)
- Particles: floating embers/sparkles (THREE.Points with small sprite)
- Dramatic rim lighting from below (purple/blue)

**Camera:** `position: [0, 0, 5]`, looking at origin

**HTML Overlay:**
```
[TOP CENTER]
  "TEYVAT BLADES"  ← small caps, letter-spacing: 6px, color: #88aacc
  
[CENTER]
  "TEN LEGENDARY" ← huge, white, stacked
  "WEAPONS"
  
[BOTTOM CENTER]
  "Scroll to enter the collection ↓" ← subtle, animated bounce
```

**Entry Animation (on load, not scroll):**
- Sword fades in from below over 2s
- Title letters stagger in with gsap.from
- Smoke fades in over 3s

---

### SECTION 2–11: SWORD SECTIONS (one per sword)

Each sword section has 3 sub-phases controlled by scroll progress (0 → 1):

**Phase 1 (scroll 0–0.3): Transition In**
- Camera moves from previous position to this sword's showcase position
- Sword flies in from a direction (alternates: left, right, up, down per sword)
- Previous sword fades out
- Lighting color transitions to this element's color

**Phase 2 (scroll 0.3–0.7): Showcase**
- Sword is centered, slowly rotating
- Text panel fades in from the opposite side
- User can drag to rotate sword
- Smoke reacts to sword position (sword pushes smoke away as it rotates)
- Element-colored point light pulses slowly

**Phase 3 (scroll 0.7–1.0): Transition Out**
- Text fades out
- Camera begins moving toward next sword position
- Sword drifts in exit direction

**Camera positions per sword (approximate):**
```js
const SWORD_CAMERA_POSITIONS = [
  { x: 0,    y: 0,    z: 5   },  // hero
  { x: -1.5, y: 0.3, z: 4.5 },  // bakufu
  { x: 1.8,  y: -0.2,z: 4.2 },  // boreas
  { x: -2,   y: 0.5, z: 5   },  // cool steel
  { x: 0.5,  y: -0.5,z: 4.8 },  // dull blade
  { x: -1,   y: 0.8, z: 4   },  // freedom sworn
  { x: 2,    y: 0,   z: 4.5 },  // katana
  { x: -1.8, y: -0.3,z: 5   },  // lions roar
  { x: 0,    y: 0.6, z: 4.2 },  // mistsplitter
  { x: 1.5,  y: 0.2, z: 4.8 },  // narukami
  { x: -0.5, y: -0.4,z: 4.5 },  // prototype
]
```

**Text Panel Design (per sword):**
```
[Element badge]  e.g. ⚡ ELECTRO
[Sword Name]     huge, white
[Rarity stars]   ★★★★★
[Lore text]      italic, muted, max 2 lines visible
[Stats row]      ATK: 46 | CRIT Rate: 7.2%
[Divider line]   1px, element color, animated width reveal
```

---

### SECTION 12: OUTRO

**3D:** All 10 swords arranged in a slow-rotating circle
**Camera:** Pulls back to reveal them all
**Text:** "The Collection" + credits + back to top

---

## Navbar Specification

**Design:** Glassmorphism, fixed top, never intrusive

```jsx
// Navbar structure
<nav style={{
  position: 'fixed', top: 0, left: 0, right: 0,
  zIndex: 1000,
  background: 'rgba(5, 10, 20, 0.7)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  padding: '0 5vw',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}}>
  {/* LEFT: Logo */}
  <div>TEYVAT BLADES</div>
  
  {/* CENTER: Nav links */}
  <div>
    <a href="#hero">Home</a>
    <div className="dropdown">
      Collection ▾
      {/* Dropdown: all 10 sword names, clicking scrolls to section */}
    </div>
    <a href="#outro">About</a>
  </div>
  
  {/* RIGHT: CTA */}
  <button>Enter Collection →</button>
</nav>
```

**Scroll behavior:**
- Navbar starts transparent
- After scrolling past hero: background becomes opaque dark
- Active sword name highlights in dropdown

---

## Smoke System (Current — Enhance This)

File: `src/components/Smoke.jsx`

Current: 80 plane sprites with smoke.png, mouse repulsion
**Enhance with:**
- Pass sword world position as prop → smoke also repels from sword tip
- Increase particle count to 120 for hero section, reduce to 60 during sword sections
- Add slow upward drift to particles
- Element-colored tint on smoke near the active sword

```jsx
// Enhanced Smoke props
<Smoke
  swordPosition={swordWorldPos}    // Vector3 — sword pushes smoke away
  elementColor={currentElementColor} // sword element tint on nearby particles
  density={heroMode ? 120 : 70}    // more smoke on hero
/>
```

---

## Lighting Architecture

### Base Scene Lights (always present)
```jsx
<ambientLight intensity={0.2} color="#0a1020" />
<pointLight position={[0, 10, 5]}  intensity={1.5} color="#ffffff" />
<pointLight position={[-8, -4, 3]} intensity={1.0} color="#334488" />
<pointLight position={[8, -4, 3]}  intensity={0.8} color="#220033" />
```

### Dynamic Element Light (changes per sword)
```jsx
// Ref-driven — updated by ScrollTrigger without causing re-renders
const elementLightRef = useRef()
// Color transitions smoothly using lerp in useFrame
// Position: slightly in front of sword, at chest height
<pointLight ref={elementLightRef} position={[0, 0, 2]} intensity={3} />
```

### Rim Light (dramatic edge glow on sword)
```jsx
<spotLight
  position={[0, -5, 2]}
  angle={0.5}
  penumbra={1}
  intensity={4}
  color={elementColor}
  target-position={[0, 0, 0]}
/>
```

### Environment (for metallic reflections)
If user provides an HDR file, use:
```jsx
import { Environment } from '@react-three/drei'
<Environment files="/env.hdr" />
```
Otherwise use a preset: `<Environment preset="night" />`

---

## GSAP ScrollTrigger Implementation

### Setup
```jsx
// In a useEffect inside a component that has access to refs
useEffect(() => {
  gsap.registerPlugin(ScrollTrigger)

  // Pin the canvas (it's already fixed, but this helps ScrollTrigger tracking)
  ScrollTrigger.defaults({ scroller: window })

  // Create a timeline per sword section
  SWORDS.forEach((sword, i) => {
    const sectionId = `#sword-section-${i}`

    ScrollTrigger.create({
      trigger: sectionId,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress
        updateSwordSection(i, progress)
      }
    })
  })

  return () => ScrollTrigger.killAll()
}, [])
```

### Camera Animation
```jsx
// Use a shared camera target ref — update it from ScrollTrigger
// In useFrame: lerp camera.position toward cameraTarget
const cameraTarget = useRef(new THREE.Vector3(0, 0, 5))

useFrame(({ camera }) => {
  camera.position.lerp(cameraTarget.current, 0.05)
  camera.lookAt(0, 0, 0)
})

// From ScrollTrigger callback:
const updateSwordSection = (index, progress) => {
  const pos = SWORD_CAMERA_POSITIONS[index + 1]
  cameraTarget.current.set(pos.x, pos.y, pos.z)
}
```

### Text Animations
```jsx
// Each sword section has HTML overlaid on canvas
// Animate with GSAP inside ScrollTrigger
gsap.fromTo(`#sword-title-${i}`,
  { opacity: 0, x: -60 },
  {
    opacity: 1, x: 0, duration: 0.4,
    scrollTrigger: {
      trigger: `#sword-section-${i}`,
      start: 'top 60%',
      toggleActions: 'play reverse play reverse'
    }
  }
)
```

---

## Postprocessing (Add After Scene is Stable)

```jsx
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

// Inside Canvas — add last
<EffectComposer>
  <Bloom
    intensity={1.2}
    luminanceThreshold={0.4}
    luminanceSmoothing={0.9}
    mipmapBlur
  />
  <ChromaticAberration
    blendFunction={BlendFunction.NORMAL}
    offset={[0.0005, 0.0005]}
  />
  <Vignette
    eskil={false}
    offset={0.3}
    darkness={0.7}
  />
</EffectComposer>
```

**Only add this after everything else works.** Bloom alone can crash context if Canvas alpha is wrong.

---

## Shaders to Build

### 1. Background Nebula Shader
A full-screen background quad with animated noise creating a deep-space/ethereal look.

```glsl
// Fragment shader — dark space with slow color nebula
uniform float uTime;
uniform vec3 uColor1;  // deep purple
uniform vec3 uColor2;  // dark blue

// Use fbm noise to create nebula clouds
// Animate very slowly (uTime * 0.02)
// Output: dark base with subtle colored wisps
```

### 2. Sword Aura Shader
A glowing aura sprite that sits behind the sword, pulsing with element color.

```glsl
// Radial gradient from center
// Alpha = 1 - length(uv - 0.5) * 2
// Pulse: sin(uTime * 2.0) * 0.3 + 0.7
// Color: element color passed as uniform
```

### 3. Ground Reflection Plane
A mirror plane below the sword that shows a distorted reflection.

```jsx
// Use MeshReflectorMaterial from drei
import { MeshReflectorMaterial } from '@react-three/drei'
<mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -2, 0]}>
  <planeGeometry args={[20, 20]} />
  <MeshReflectorMaterial
    blur={[400, 100]}
    resolution={512}
    mixBlur={0.8}
    mixStrength={0.5}
    roughness={1}
    depthScale={1.2}
    color="#050a14"
  />
</mesh>
```

---

## Particle Systems to Build

### Floating Embers / Sparkles
For Pyro swords (Katana, Lion's Roar):
```jsx
// THREE.Points with 200 small particles
// Random positions in a sphere around the sword
// Slow upward drift
// Slight random shimmer in opacity
// Color: orange/red (#ff6633)
```

### Electric Sparks
For Electro swords (Bakufu, Narukami):
```jsx
// Short-lived line segments
// Random direction, quick flash, disappear
// Color: purple (#cc88ff)
// Trigger: random interval, 3-5 sparks per second
```

### Ice Crystals
For Cryo swords (Mistsplitter):
```jsx
// Slow-falling geometric shapes (icosahedron geometry, tiny)
// Shimmer with Bloom
// Color: light blue (#aaddff)
```

---

## Performance Budget

| Item | Limit |
|------|-------|
| Sword GLB file size | Max 700KB each |
| Smoke particles | Max 120 |
| Ember particles | Max 200 |
| Spark particles | Max 50 at a time |
| Pixel ratio | `Math.min(devicePixelRatio, 1.5)` |
| Simultaneous GLBs loaded | 1 |
| Shadow maps | Disabled (use fake shadows via plane opacity) |
| Texture size | Max 2K per texture |

---

## Assets — Ask User If Needed

Before building any feature that needs external assets, ask the user:

| Asset | What For | Where To Get |
|-------|----------|--------------|
| `.hdr` environment map | Metallic sword reflections | polyhaven.com/hdris — recommend `moonless_golf_4k.hdr` |
| Background texture | Deep space / stone texture behind scene | polyhaven.com/textures |
| Custom font | Epic title typography | fonts.google.com — recommend "Cinzel" or "Rajdhani" |
| Additional particle textures | Embers, sparkles, ice | Generate with canvas API (no file needed) |
| Sound effects | Sword whoosh, element sounds | freesound.org |
| Ambient music | Background atmosphere | freemusicarchive.org |

**Generate particle textures programmatically** (no file needed):
```js
// Create a circular gradient sprite on canvas
const canvas = document.createElement('canvas')
canvas.width = canvas.height = 64
const ctx = canvas.getContext('2d')
const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
grad.addColorStop(0, 'rgba(255,255,255,1)')
grad.addColorStop(1, 'rgba(255,255,255,0)')
ctx.fillStyle = grad
ctx.fillRect(0, 0, 64, 64)
const texture = new THREE.CanvasTexture(canvas)
```

---

## Component Architecture — Full Target Structure

```
src/
├── components/
│   ├── 3d/
│   │   ├── Scene.jsx              ← Canvas, camera, base lights, scroll camera control
│   │   ├── SwordModel.jsx         ← GLB load, normalize, drag rotation, float
│   │   ├── Smoke.jsx              ← Smoke particle system
│   │   ├── Embers.jsx             ← Fire/Pyro particles
│   │   ├── Sparks.jsx             ← Electro spark particles
│   │   ├── IceCrystals.jsx        ← Cryo crystal particles
│   │   ├── NebulaBg.jsx           ← Background shader quad
│   │   ├── SwordAura.jsx          ← Element-colored glow behind sword
│   │   ├── ReflectionPlane.jsx    ← Ground mirror
│   │   └── OutroCircle.jsx        ← All swords in a circle for outro
│   ├── ui/
│   │   ├── Navbar.jsx             ← Fixed nav with dropdown
│   │   ├── HeroOverlay.jsx        ← Hero section HTML text
│   │   ├── SwordOverlay.jsx       ← Per-sword text panel (name, lore, stats)
│   │   └── ScrollPrompt.jsx       ← "Scroll to explore" animated indicator
│   └── layout/
│       └── ScrollContainer.jsx    ← Tall scroll div, section markers for GSAP
├── hooks/
│   ├── useScrollProgress.js       ← Custom hook: current section + progress
│   ├── useSwordDrag.js            ← Drag rotation logic extracted to hook
│   └── useElementTheme.js         ← Returns colors/particles for current element
├── data/
│   └── swords.js                  ← SWORDS array, ELEMENT_COLORS, lore, stats
├── shaders/
│   ├── nebula.vert.glsl
│   ├── nebula.frag.glsl
│   └── aura.frag.glsl
├── App.jsx
├── main.jsx                       ← NO StrictMode
└── index.css
```

---

## State Management Pattern

Use a single global scroll state object — avoid React re-renders inside the Canvas.

```jsx
// src/store/scrollState.js — plain JS object, not React state
// Canvas reads from this every frame in useFrame
// ScrollTrigger writes to this in onUpdate callbacks
export const scrollState = {
  currentSwordIndex: 0,
  sectionProgress: 0,
  cameraTarget: { x: 0, y: 0, z: 5 },
  elementColor: '#ffffff',
  heroMode: true,
}

// In useFrame — read scrollState directly, no React state
useFrame(({ camera }) => {
  camera.position.lerp(scrollState.cameraTarget, 0.05)
  elementLightRef.current.color.lerp(targetColor, 0.05)
})

// In ScrollTrigger — write to scrollState directly
onUpdate: (self) => {
  scrollState.sectionProgress = self.progress
  scrollState.currentSwordIndex = swordIndex
}
```

This avoids React re-render churn inside the animation loop.

---

## Typography & Color System

```css
/* Fonts — add to index.html */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Raleway:ital,wght@0,300;0,400;1,300&display=swap');

/* CSS Variables */
:root {
  --bg: #050a14;
  --text-primary: #ffffff;
  --text-secondary: #889aaa;
  --text-muted: #445566;
  --accent: #4488ff;
  --font-display: 'Cinzel', serif;       /* titles, logo */
  --font-body: 'Raleway', sans-serif;    /* lore text, descriptions */
}

/* Title style */
.sword-name {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 0.9;
  color: white;
  text-transform: uppercase;
}

/* Lore text */
.sword-lore {
  font-family: var(--font-body);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  color: var(--text-secondary);
  max-width: 380px;
  line-height: 1.7;
}
```

---

## How To Build — Recommended Order

Build in this exact order to avoid broken states:

1. **Scroll container** — set up the tall scrollable div with section markers
2. **GSAP ScrollTrigger** — wire up camera movement, test with console.logs
3. **Navbar** — static first, then add dropdown + scroll behavior
4. **Hero section** — HTML overlay + dramatic entrance animation
5. **Sword sections** — one at a time, start with sword 1
6. **Per-sword lighting** — element color changes
7. **Sword particles** — embers, sparks, crystals per element type
8. **Text animations** — lore reveals, stat counters
9. **Background shader** — nebula effect
10. **Reflection plane** — ground mirror
11. **Outro section** — all swords circle
12. **Postprocessing** — bloom, vignette (LAST — most likely to break things)
13. **Mobile optimization** — reduce particles, simplify for touch

---

## Common Errors & Instant Fixes

| Error | Root Cause | Fix |
|-------|-----------|-----|
| `THREE.WebGLRenderer: Context Lost` | StrictMode OR all GLBs loading | Remove StrictMode. Load 1 sword at a time. |
| Sword disappears when dragging | Bounding box recalculated post-transform | Wrap clone+bbox in useMemo |
| Smoke moves like solid wall | OrbitControls rotating whole scene | Remove OrbitControls, manual drag on sword ref only |
| `Could not load .glb: Unexpected token '<'` | File not found, returns 404 HTML | Check exact filename in public/models/ |
| Model shows accessories only, no blade | gltf.report stripped main mesh | Re-export from Blender with Selected Objects Only |
| Black screen with no errors | Camera too close/far or model out of bounds | console.log bounding box, adjust camera z |
| Bloom crashes immediately | EffectComposer with alpha:true Canvas | Always set alpha:false on Canvas gl prop |
| ScrollTrigger not firing | Plugin not registered | `gsap.registerPlugin(ScrollTrigger)` before any use |
| Camera jerks instead of smooth | lerp factor too high | Use 0.03–0.06 for camera lerp, not 0.5+ |
| Text not visible over canvas | z-index or pointer-events wrong | Overlay div: zIndex 10, pointerEvents 'none'. Canvas: zIndex 0 |

---

## Code Quality Standards

- **No console.logs in final code** — remove debug logs before considering anything done
- **No placeholder comments** — `// TODO` is not acceptable in delivered code
- **Complete files always** — if touching a file, rewrite it completely
- **Ref over state** — for anything inside the render loop, always use useRef not useState
- **Cleanup always** — every useEffect that adds event listeners must return a cleanup function
- **useMemo for expensive 3D math** — bounding boxes, geometry computations, clones
- **One thing at a time** — do not load sword AND run postprocessing AND run particles in the same render tick on first frame

---

## What Claude Code Should Do On First Run

1. Read this entire skill
2. Read all existing source files in `src/`
3. Check `public/models/` for all 10 GLB files
4. Check `public/smoke.png` exists
5. Identify what's built vs what's missing
6. Ask user: "Do you have an HDR environment file, or should I use a preset? And do you want Cinzel font loaded from Google Fonts?"
7. Then begin building in the order specified above
8. Deliver complete files — never partial
9. After each major section is built, confirm with user before moving on
